package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.request.checkout.CheckoutRequest;
import com.fragrance.raumania.dto.request.order.UpdateOrderStatusRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<?> createOrder(@RequestBody CheckoutRequest checkoutRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Order created successfully",
                        orderService.createOrderFromSelectedCartItems(checkoutRequest))
        );
    }

    @GetMapping("/status-counts")
    public ResponseEntity<?> getOrderStatusCounts() {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Order status counts fetched successfully",
                        orderService.getAllOrdersStatusCounts())
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable UUID orderId) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Order retrieved successfully",
                        orderService.getOrderById(orderId))
        );
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable UUID orderId) {
        UUID deletedOrderId = orderService.deleteOrder(orderId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Order deleted successfully", deletedOrderId)
        );
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getOrdersForCurrentUser(@RequestParam(defaultValue = "1") int pageNumber,
                                                     @RequestParam(defaultValue = "10") int pageSize,
                                                     @RequestParam(defaultValue = "id") String sortBy,
                                                     @RequestParam(defaultValue = "asc") String sortDirection) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Orders retrieved successfully",
                        orderService.getOrdersForCurrentUser(pageNumber, pageSize, sortBy, sortDirection))
        );
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Order status updated successfully", orderService.updateOrderStatus(orderId, request))
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PageResponse<?> response = orderService.getAllOrders(page, size, sortBy, sortDir);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Orders retrieved successfully", response)
        );
    }
}
