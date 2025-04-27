package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.dto.request.brand.CreateBrandRequest;
import com.fragrance.raumania.dto.request.brand.UpdateBrandRequest;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.brand.BrandExportResponse;
import com.fragrance.raumania.dto.response.brand.BrandNameResponse;
import com.fragrance.raumania.dto.response.brand.BrandResponse;
import com.fragrance.raumania.event.ProductIndexEvent;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.mapper.BrandMapper;
import com.fragrance.raumania.mapper.ProductMapper;
import com.fragrance.raumania.model.product.Brand;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductVariant;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.BrandRepository;
import com.fragrance.raumania.repository.ProductRepository;
import com.fragrance.raumania.service.interfaces.BrandService;
import com.fragrance.raumania.utils.SortUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final ApplicationEventPublisher eventPublisher;
    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final SortUtils sortUtils;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public BrandResponse createBrand(CreateBrandRequest request) {

        Optional<Brand> brandOptional = brandRepository.findByName(request.getName());
        if (brandOptional.isPresent()) {
            throw new ResourceNotFoundException("Brand already exists");
        }

        Brand brand = Brand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(UUID id, UpdateBrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

        brand.setName(request.getName());
        brand.setDescription(request.getDescription());

        brand = brandRepository.save(brand);

        brand.getProducts().forEach(product ->
                eventPublisher.publishEvent(new ProductIndexEvent(product.getId(), ProductIndexEvent.Operation.UPDATE))
        );

        return brandMapper.toBrandResponse(brand);
    }

    @Override
    public BrandResponse getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        return brandMapper.toBrandResponse(brand);
    }

    @Override
    @Transactional
    public UUID deleteBrand(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

        brand.getProducts().forEach(product -> {
                product.setBrand(null);
                eventPublisher.publishEvent(new ProductIndexEvent(product.getId(), ProductIndexEvent.Operation.UPDATE));
            }
        );

        brandRepository.deleteById(id);
        return id;
    }

    @Override
    public PageResponse<?> getProductByBrand(UUID brandId, int pageNumber, int pageSize, String sortBy, String sortDirection) {
        if (pageNumber < 1) {
            pageNumber = 1; // Adjust to 1-based index
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Page<Product> productsPage = productRepository.findByBrandId(brandId, pageable);

        var searchProductsResponse = productsPage.getContent().stream()
                .map(productMapper::toSearchProductResponse)
                .toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(productsPage.getTotalElements())
                .totalPages(productsPage.getTotalPages())
                .content(searchProductsResponse)
                .build();
    }

    @Override
    public PageResponse<?> getAllBrands(int pageNumber, int pageSize, String sortBy, String sortDirection) {

        if (pageNumber < 1) {
            pageNumber = 1;
        }

        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Page<Brand> usersPage = brandRepository.findAll(pageable);

        var brandResponses = usersPage.getContent().stream().map(brandMapper::toBrandResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .content(brandResponses)
                .build();

    }

    @Override
    public PageResponse<?> searchBrands(int pageNumber, int pageSize, String sortBy, String sortDirection, String name) {

        if (pageNumber < 1) {
            pageNumber = 1;
        }
        Sort sort = sortUtils.buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Page<Brand> usersPage = brandRepository.findByNameContainingIgnoreCase(name, pageable);

        var brandResponses = usersPage.getContent().stream().map(brandMapper::toBrandResponse).toList();

        return PageResponse.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .content(brandResponses)
                .build();
    }

    @Override
    public PageResponse<?> getAllForDataExport() {
        List<Brand> brands = brandRepository.findAllWithProducts();

        List<BrandExportResponse> responseList = brands.stream()
                .map(brand -> BrandExportResponse.builder()
                        .id(brand.getId())
                        .name(brand.getName())
                        .productNames(
                                brand.getProducts().stream()
                                        .map(Product::getName)
                                        .toList()
                        )
                        .build()
                ).toList();

        return PageResponse.builder()
                .content(responseList)
                .totalPages(1)
                .totalElements(responseList.size())
                .pageNumber(1)
                .pageSize(responseList.size())
                .build();
    }

    @Override
    public List<BrandNameResponse> getBrandDropdownList() {
        List<Brand> brands = brandRepository.findAll(Sort.by("name").ascending()); // Sort alphabetically
        return brands.stream()
                .map(brandMapper::toDropdownResponse)
                .toList();
    }

}
