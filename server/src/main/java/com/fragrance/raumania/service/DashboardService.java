package com.fragrance.raumania.service;

import com.fragrance.raumania.constant.order.OrderStatus;
import com.fragrance.raumania.constant.payment.PaymentStatus;
import com.fragrance.raumania.dto.response.dashboard.*;
import com.fragrance.raumania.model.order.Order;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.Review;
import com.fragrance.raumania.repository.OrderRepository;
import com.fragrance.raumania.repository.ProductRepository;
import com.fragrance.raumania.repository.ReviewRepository;
import com.fragrance.raumania.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public DashboardSummaryResponse getDashboardSummary() {
        // Get current date and date 30 days ago
        Date now = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.add(Calendar.DAY_OF_MONTH, -30);
        Date thirtyDaysAgo = calendar.getTime();

        // Get counts
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        // Get revenue
        Double totalRevenue = orderRepository.findByOrderStatus(OrderStatus.DELIVERED)
                .stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // Get recent metrics
        long newOrders = orderRepository.countByCreatedAtAfter(thirtyDaysAgo);
        long newProducts = productRepository.countByCreatedAtAfter(thirtyDaysAgo);
        long newUsers = userRepository.countByCreatedAtAfter(thirtyDaysAgo);

        // Calculate growth percentages
        double orderGrowth = calculateGrowthPercentage(totalOrders - newOrders, totalOrders);
        double productGrowth = calculateGrowthPercentage(totalProducts - newProducts, totalProducts);
        double userGrowth = calculateGrowthPercentage(totalUsers - newUsers, totalUsers);

        return DashboardSummaryResponse.builder()
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalUsers(totalUsers)
                .newOrders(newOrders)
                .newProducts(newProducts)
                .newUsers(newUsers)
                .orderGrowth(orderGrowth)
                .productGrowth(productGrowth)
                .userGrowth(userGrowth)
                .build();
    }

    public List<OrderStatusResponse> getOrderStatusDistribution() {
        Map<OrderStatus, Long> orderStatusCounts = orderRepository.findAll().stream()
                .collect(Collectors.groupingBy(Order::getOrderStatus, Collectors.counting()));

        return orderStatusCounts.entrySet().stream()
                .map(entry -> new OrderStatusResponse(entry.getKey().name(), entry.getValue()))
                .collect(Collectors.toList());
    }

    public List<RecentOrderResponse> getRecentOrders(int limit) {
        return orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .limit(limit)
                .map(order -> RecentOrderResponse.builder()
                        .id(order.getId())
                        .customerName(order.getUser().getFullName())
                        .orderDate(order.getCreatedAt())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getOrderStatus().name())
                        .paymentStatus(order.getPaymentStatus().name())
                        .build())
                .collect(Collectors.toList());
    }



    public List<RecentReviewResponse> getRecentReviews(int limit) {
        return reviewRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .limit(limit)
                .map(review -> RecentReviewResponse.builder()
                        .id(review.getId())
                        .productName(review.getProduct().getName())
                        .customerName(review.getUser().getFullName())
                        .rating(review.getRating())
                        .content(review.getContent())
                        .date(review.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }



    private double calculateGrowthPercentage(double previous, double current) {
        if (previous == 0) return 100.0;
        return ((current - previous) / previous) * 100.0;
    }

    private double calculateAverageRating(Product product) {
        List<Review> reviews = product.getReviews();
        if (reviews.isEmpty()) return 0.0;

        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }
}