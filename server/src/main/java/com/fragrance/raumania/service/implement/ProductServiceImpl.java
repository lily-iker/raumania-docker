package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.dto.filter.product.ProductFilter;
import com.fragrance.raumania.dto.request.product.CreateProductRequest;
import com.fragrance.raumania.dto.request.product.CreateProductVariantRequest;
import com.fragrance.raumania.dto.request.product.UpdateProductRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.product.*;
import com.fragrance.raumania.dto.response.review.ReviewResponse;
import com.fragrance.raumania.dto.response.review.ReviewStatisticProjection;
import com.fragrance.raumania.dto.response.review.ReviewStatisticResponse;
import com.fragrance.raumania.event.ProductIndexEvent;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.ProductMapper;
import com.fragrance.raumania.mapper.ProductVariantMapper;
import com.fragrance.raumania.mapper.ReviewMapper;
import com.fragrance.raumania.model.product.Brand;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductImage;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.repository.*;
import com.fragrance.raumania.repository.specification.ProductSpecification;
import com.fragrance.raumania.service.CloudinaryService;
import com.fragrance.raumania.service.interfaces.ProductService;
import com.fragrance.raumania.utils.SortUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ApplicationEventPublisher eventPublisher;
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository variantRepository;
    private final CloudinaryService cloudinaryService;
    private final ProductMapper productMapper;
    private final ProductVariantMapper productVariantMapper;
    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final SortUtils sortUtils;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request,
                                         MultipartFile thumbnailImageFile,
                                         MultipartFile[] imageFiles) throws IOException {

        Optional<Product> existingProduct = productRepository.findByName(request.getName());
        if (existingProduct.isPresent()) {
            throw new IllegalArgumentException("Product with the same name already exists");
        }

        Brand brand = brandRepository.findByName(request.getBrand())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        String thumbnailImage = "";
        if (thumbnailImageFile != null) {
            thumbnailImage =  cloudinaryService.uploadImage(thumbnailImageFile);
        }

        CreateProductVariantRequest variantRequest = request.getProductVariant();

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .productMaterial(request.getProductMaterial())
                .inspiration(request.getInspiration())
                .usageInstructions(request.getUsageInstructions())
                .thumbnailImage(thumbnailImage)
                .isActive(request.getIsActive())
                .minPrice(variantRequest.getPrice())
                .maxPrice(variantRequest.getPrice())
                .brand(brand)
                .build();

        productRepository.save(product);

        ProductVariant variant = ProductVariant.builder()
                .name(variantRequest.getName())
                .size(variantRequest.getSize())
                .scent(variantRequest.getScent())
                .stock(variantRequest.getStock())
                .price(variantRequest.getPrice())
                .product(product)
                .build();

        productVariantRepository.save(variant);

        if (imageFiles != null && imageFiles.length > 0) {
            List<ProductImage> productImages = new ArrayList<>();

            for (MultipartFile imageFile : imageFiles) {

                String imageUrl = cloudinaryService.uploadImage(imageFile);

                ProductImage productImage = ProductImage.builder()
                        .image(imageUrl)
                        .product(product)
                        .build();

                productImages.add(productImage);
            }

            if (!productImages.isEmpty()) {
                productImageRepository.saveAll(productImages);
            }
        }

        productRepository.flush();

        eventPublisher.publishEvent(new ProductIndexEvent(product.getId(), ProductIndexEvent.Operation.CREATE));
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID id,
                                         UpdateProductRequest request,
                                         MultipartFile thumbnailImageFile,
                                         MultipartFile[] imageFiles) throws IOException {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Brand brand = brandRepository.findByName(request.getBrand())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

        // ✅ Upload new thumbnail image if provided
        if (thumbnailImageFile != null && !thumbnailImageFile.isEmpty()) {
            String thumbnailImageUrl = cloudinaryService.uploadImage(thumbnailImageFile);
            product.setThumbnailImage(thumbnailImageUrl);
        } else {
            product.setThumbnailImage(request.getThumbnailImage());
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setProductMaterial(request.getProductMaterial());
        product.setInspiration(request.getInspiration());
        product.setUsageInstructions(request.getUsageInstructions());
        product.setIsActive(request.getIsActive());
        product.setBrand(brand);

        product = productRepository.save(product);

        // ✅ Upload and associate new images (optional: clear old images first)
        if (imageFiles != null && imageFiles.length > 0) {
            List<ProductImage> newImages = new ArrayList<>();

            for (MultipartFile imageFile : imageFiles) {
                if (!imageFile.isEmpty()) {
                    String imageUrl = cloudinaryService.uploadImage(imageFile);
                    ProductImage newImage = ProductImage.builder()
                            .image(imageUrl)
                            .product(product)
                            .build();
                    newImages.add(newImage);
                }
            }

            if (!newImages.isEmpty()) {

                productImageRepository.saveAll(newImages);
            }
        }

        eventPublisher.publishEvent(new ProductIndexEvent(product.getId(), ProductIndexEvent.Operation.UPDATE));

        return productMapper.toProductResponse(product);
    }

    @Transactional
    public void deleteProductImage(UUID productId, UUID imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        // Optional: validate ownership
        if (!image.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Image does not belong to this product");
        }

        productImageRepository.delete(image);
    }

    @Override
    public Map<String, List<String>> getAllFilterOptions() {
        Map<String, List<String>> filters = new HashMap<>();
        filters.put("brands", productRepository.findAllDistinctBrandNames());
        filters.put("sizes", variantRepository.findAllDistinctSizes());
        filters.put("scents", variantRepository.findAllDistinctScents());
        return filters;
    }

    @Override
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        OptionalDouble minPrice = product.getProductVariants().stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .min();

        OptionalDouble maxPrice = product.getProductVariants().stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .max();

        List<ProductVariantResponse> productVariantResponses = product.getProductVariants()
                .stream()
                .map(productVariantMapper::toProductVariantResponse)
                .toList();

        List<ProductImageResponse> productImageResponses = product.getProductImages()
                .stream()
                .map(productImage -> {
                    return ProductImageResponse.builder()
                            .id(productImage.getId())
                            .image(productImage.getImage())
                            .build();
                })
                .toList();

        List<ReviewResponse> fiveLatestReviews = reviewRepository.find5LatestReviewByProductId(product.getId().toString())
                .stream()
                .map(reviewMapper::toReviewResponse)
                .toList();

        ReviewStatisticResponse reviewStatistic = new ReviewStatisticResponse();
        ReviewStatisticProjection projection = reviewRepository.findReviewStatisticByProductId(product.getId().toString());

        if (projection != null) {
            reviewStatistic = new ReviewStatisticResponse(
                    projection.getAverageRating() != null ? projection.getAverageRating() : 0.0,
                    projection.getTotalReviews() != null ? projection.getTotalReviews().intValue() : 0,
                    projection.getFiveStarReviews() != null ? projection.getFiveStarReviews().intValue() : 0,
                    projection.getFourStarReviews() != null ? projection.getFourStarReviews().intValue() : 0,
                    projection.getThreeStarReviews() != null ? projection.getThreeStarReviews().intValue() : 0,
                    projection.getTwoStarReviews() != null ? projection.getTwoStarReviews().intValue() : 0,
                    projection.getOneStarReviews() != null ? projection.getOneStarReviews().intValue() : 0
            );
        }

        List<Product> relatedProducts = productRepository.findRandomProducts(4);

        List<RelatedProductResponse> relatedProductResponses = relatedProducts.stream()
                .map(relatedProduct -> RelatedProductResponse.builder()
                        .id(relatedProduct.getId())
                        .name(relatedProduct.getName())
                        .thumbnailImage(relatedProduct.getThumbnailImage())
                        .minPrice(
                                relatedProduct.getProductVariants()
                                        .stream()
                                        .map(ProductVariant::getPrice)
                                        .min(Double::compareTo)
                                        .orElse(null)
                        )
                        .build())
                .collect(Collectors.toList());

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setRelatedProducts(relatedProductResponses);
        productResponse.setProductVariants(productVariantResponses);
        productResponse.setProductImages(productImageResponses);
        productResponse.setFiveLatestReviews(fiveLatestReviews);
        productResponse.setReviewStatistic(reviewStatistic);

        productResponse.setMinPrice(minPrice.isPresent() ? minPrice.getAsDouble() : null);
        productResponse.setMaxPrice(maxPrice.isPresent() ? maxPrice.getAsDouble() : null);
        return productResponse;
    }

    @Override
    @Transactional
    public UUID deleteProduct(UUID id) {
        productRepository.deleteById(id);
        eventPublisher.publishEvent(new ProductIndexEvent(id, ProductIndexEvent.Operation.DELETE));
        return id;
    }

    @Override
    @Transactional
    public List<RelatedProductResponse> getRelatedProducts(int limit) {
        List<Product> relatedProducts = productRepository.findRandomProducts(limit);

        return relatedProducts.stream()
                .map(product -> {
                    Double minPrice = product.getProductVariants()
                            .stream()
                            .map(ProductVariant::getPrice)
                            .min(Double::compareTo)
                            .orElse(null);

                    return RelatedProductResponse.builder()
                            .id(product.getId())
                            .name(product.getName())
                            .thumbnailImage(product.getThumbnailImage())
                            .minPrice(minPrice)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<?> getAllProducts(int pageNumber, int pageSize, String sortBy, String sortDirection) {
        if (pageNumber < 1) {
            pageNumber = 1; // Adjust to 1-based index
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1 , pageSize, sort);

        Page<Product> productsPage = productRepository.findAll(pageable);

        var searchProductsResponse = productsPage.getContent().stream().map(productMapper::toSearchProductResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(productsPage.getTotalElements())
                .totalPages(productsPage.getTotalPages())
                .content(searchProductsResponse)
                .build();
    }

    @Override
    public PageResponse<?> searchAndFilterProducts(int pageNumber,
                                                   int pageSize,
                                                   String sortBy,
                                                   String sortDirection,
                                                   ProductFilter filter) {
        if (pageNumber < 1) {
            pageNumber = 1;
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);
        Specification<Product> specification = ProductSpecification.filterBy(filter);

        Page<Product> productsPage = productRepository.findAll(specification, pageable);

        var searchProductsResponse = productsPage.getContent().stream().map(productMapper::toSearchProductResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(productsPage.getTotalElements())
                .totalPages(productsPage.getTotalPages())
                .content(searchProductsResponse)
                .build();
    }


}
