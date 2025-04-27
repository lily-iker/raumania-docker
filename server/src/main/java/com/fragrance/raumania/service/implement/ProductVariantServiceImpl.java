package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.dto.request.product.CreateProductVariantRequest;
import com.fragrance.raumania.dto.request.product.UpdateProductVariantRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.product.ProductVariantResponse;
import com.fragrance.raumania.event.ProductIndexEvent;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.ProductVariantMapper;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.repository.ProductRepository;
import com.fragrance.raumania.repository.ProductVariantRepository;
import com.fragrance.raumania.service.interfaces.ProductVariantService;
import com.fragrance.raumania.utils.SortUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ApplicationEventPublisher eventPublisher;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final SortUtils sortUtils;
    private final ProductVariantMapper productVariantMapper;


    @Override
    @Transactional
    public ProductVariantResponse createProductVariant(CreateProductVariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if a product variant with the same attributes already exists
        boolean variantExists = productVariantRepository.existsByProductIdAndNameAndSizeAndScent(
                request.getProductId(),
                request.getName(),
                request.getSize(),
                request.getScent()
        );

        // If a variant already exists, throw an exception
        if (variantExists) {
            throw new IllegalArgumentException("Product variant with the same attributes already exists.");
        }

        ProductVariant variant = ProductVariant.builder()
                .name(request.getName())
                .size(request.getSize())
                .scent(request.getScent())
                .stock(request.getStock())
                .price(request.getPrice())
                .product(product)
                .build();

        productVariantRepository.save(variant);

        // Recalculate min and max prices from all variants of this product
        List<ProductVariant> variants = productVariantRepository.findAllByProductId(product.getId());

        Double minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(0.0);

        Double maxPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .max(Comparator.naturalOrder())
                .orElse(0.0);

        product.setMinPrice(minPrice);
        product.setMaxPrice(maxPrice);
        productRepository.save(product); // Save updated product to the database

        eventPublisher.publishEvent(new ProductIndexEvent(product.getId(), ProductIndexEvent.Operation.UPDATE));

        return productVariantMapper.toProductVariantResponse(variant);
    }

    @Override
    @Transactional
    public ProductVariantResponse updateProductVariant(UUID id, UpdateProductVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant not found"));

        variant.setName(request.getName());
        variant.setSize(request.getSize());
        variant.setScent(request.getScent());
        variant.setStock(request.getStock());
        variant.setPrice(request.getPrice());

        productVariantRepository.save(variant);

        Product product = variant.getProduct();

        // Recalculate min and max prices from all variants of this product
        List<ProductVariant> variants = productVariantRepository.findAllByProductId(product.getId());

        Double minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(0.0);

        Double maxPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .max(Comparator.naturalOrder())
                .orElse(0.0);

        product.setMinPrice(minPrice);
        product.setMaxPrice(maxPrice);
        productRepository.save(product); // Save updated product to the database


        eventPublisher.publishEvent(new ProductIndexEvent(variant.getProduct().getId(), ProductIndexEvent.Operation.UPDATE));

        return productVariantMapper.toProductVariantResponse(variant);
    }

    @Override
    public ProductVariantResponse getProductVariantById(UUID id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product Variant not found"));
        return productVariantMapper.toProductVariantResponse(variant);
    }

    @Override
    @Transactional
    public UUID deleteProductVariant(UUID id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        Product product = variant.getProduct();

        if (productVariantRepository.countByProductId(product.getId()) <= 1) {
            throw new IllegalStateException("Cannot delete the last variant of a product");
        }

        Double deletedPrice = variant.getPrice();
        Double minPrice = product.getMinPrice();
        Double maxPrice = product.getMaxPrice();

        // Delete the variant
        productVariantRepository.deleteById(id);

        // If deleted price was affecting min or max, recalculate
        if (deletedPrice.compareTo(minPrice) == 0 || deletedPrice.compareTo(maxPrice) == 0) {
            List<ProductVariant> remainingVariants = productVariantRepository.findByProductId(product.getId());

            Double newMinPrice = remainingVariants.stream()
                    .map(ProductVariant::getPrice)
                    .min(Comparator.naturalOrder())
                    .orElse(null);

            Double newMaxPrice = remainingVariants.stream()
                    .map(ProductVariant::getPrice)
                    .max(Comparator.naturalOrder())
                    .orElse(null);

            product.setMinPrice(newMinPrice);
            product.setMaxPrice(newMaxPrice);
            productRepository.save(product);
        }

        // Publish event for reindex
        eventPublisher.publishEvent(new ProductIndexEvent(product.getId(), ProductIndexEvent.Operation.UPDATE));

        return id;
    }

    @Override
    public PageResponse<?> getAllProductVariantsByProduct(UUID productId, int pageNumber, int pageSize, String sortBy, String sortDirection) {
        if (pageNumber < 1) {
            pageNumber = 1; // Adjust to 1-based index
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Page<ProductVariant> productsPage = productVariantRepository.findByProductId(productId, pageable);

        var searchProductsResponse = productsPage.getContent().stream()
                .map(productVariantMapper::toProductVariantResponse)
                .toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(productsPage.getTotalElements())
                .totalPages(productsPage.getTotalPages())
                .content(searchProductsResponse)
                .build();
    }

}
