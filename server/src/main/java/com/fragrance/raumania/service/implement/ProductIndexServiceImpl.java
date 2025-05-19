package com.fragrance.raumania.service.implement;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import com.fragrance.raumania.dto.response.PageResponse;
import com.fragrance.raumania.dto.response.product.ProductExportResponse;
import com.fragrance.raumania.dto.response.product.ProductSummary;
import com.fragrance.raumania.mapper.ProductMapper;
import com.fragrance.raumania.model.product.Product;
import com.fragrance.raumania.model.product.ProductDocument;
import com.fragrance.raumania.repository.ProductDocumentRepository;
import com.fragrance.raumania.repository.ProductRepository;
import com.fragrance.raumania.service.interfaces.ProductIndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductIndexServiceImpl implements ProductIndexService  {
    private final ProductDocumentRepository productDocumentRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ElasticsearchOperations elasticsearchOperations;


    @Override
    public void indexProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productDocumentRepository.save(productMapper.toDocument(product));
    }

    @Override
    public void unIndexProduct(UUID productId) {
        productDocumentRepository.deleteById(productId);
    }

    @Override
    public PageResponse<?> searchName(String name, int pageNumber, int pageSize) {
        if (pageNumber < 1) {
            pageNumber = 1;
        }

        NativeQuery query = NativeQuery.builder()
                .withQuery(QueryBuilders
                        .wildcard(w ->
                                w.field("name")
                                        .value("*" + name + "*")
                                        .caseInsensitive(true)
                        )
                )
                .withPageable(PageRequest.of(pageNumber - 1, pageSize))
                .build();

        SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(query, ProductDocument.class);
        SearchPage<ProductDocument> productPage = SearchHitSupport.searchPageFor(searchHits, query.getPageable());

        List<String> productNames = productPage.getContent().stream()
                .map(hit -> hit.getContent().getName())
                .toList();

        return PageResponse.builder()
                .content(productNames)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .build();
    }

    @Override
    public PageResponse<?> elasticsearchProducts(String name,
                                                           Double minPrice,
                                                           Double maxPrice,
                                                           String brandName,
                                                           Boolean isActive,
                                                           String size,
                                                           String scent,
                                                           int pageNumber,
                                                           int pageSize,
                                                           String sortBy,
                                                           String sortDirection) {

        if (pageNumber < 1) {
            pageNumber = 1;
        }

        BoolQuery.Builder b = QueryBuilders.bool();

        if (name != null && !name.trim().isEmpty()) {
            b.must(m ->
                    m.match(v ->
                            v.field("name")
                                    .query(name)
                                    .fuzziness("2")));
        }

        if (minPrice != null) {
            b.must(m ->
                    m.range(r ->
                            r.number(n ->
                                    n.field("maxPrice")
                                            .gte(minPrice))
                )
            );
        }

        if (maxPrice != null) {
            b.must(m ->
                    m.range(r ->
                            r.number(n ->
                                    n.field("minPrice")
                                            .lte(maxPrice))
                )
            );
        }

        if (brandName != null && !brandName.trim().isEmpty()) {
            b.must(m ->
                    m.match(v ->
                            v.field("brandName").query(brandName)));
        }

        if (isActive != null) {
            b.must(m ->
                    m.term(t ->
                            t.field("isActive").value(isActive)));
        }

        if (size != null && !size.trim().isEmpty()) {
            b.must(m ->
                    m.term(t ->
                            t.field("variantSizes").value(size)));
        }

        if (scent != null && !scent.trim().isEmpty()) {
            b.must(m ->
                    m.match(v ->
                            v.field("variantScents").query(scent)));
        }

        Sort sort = Sort.by(Sort.Order.by(sortBy).with(Sort.Direction.fromString(sortDirection)));

        PageRequest pageRequest = PageRequest.of(pageNumber - 1, pageSize, sort);

        NativeQuery query = NativeQuery.builder()
                .withQuery(q -> q.bool(b.build()))
                .withFields("id", "name", "minPrice", "maxPrice", "thumbnailImage")
                .withPageable(pageRequest)
                .build();

        SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(query, ProductDocument.class);
        SearchPage<ProductDocument> productPage = SearchHitSupport.searchPageFor(searchHits, pageRequest);

        List<ProductSummary> summaries = productPage.getContent().stream()
                .map(SearchHit::getContent)
                .map(doc -> new ProductSummary(
                        doc.getId(),
                        doc.getName(),
                        doc.getMinPrice(),
                        doc.getMaxPrice(),
                        doc.getThumbnailImage()
                ))
                .toList();

        return PageResponse.builder()
                .content(summaries)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .build();
    }

    @Override
    public PageResponse<?> getAllForDataExport() {

        BoolQuery.Builder b = QueryBuilders.bool();

        int limit = 10000;
        PageRequest pageRequest = PageRequest.of(0, limit);

        NativeQuery query = NativeQuery.builder()
                .withQuery(q -> q.bool(b.build()))
                .withFields("id", "name", "minPrice", "brandName", "variantNames")
                .withPageable(pageRequest)
                .build();

        SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(query, ProductDocument.class);
        SearchPage<ProductDocument> productPage = SearchHitSupport.searchPageFor(searchHits, pageRequest);

        List<ProductExportResponse> responses = productPage.getContent().stream()
                .map(SearchHit::getContent)
                .map(doc ->
                        ProductExportResponse.builder()
                                .id(doc.getId())
                                .name(doc.getName())
                                .price(doc.getMinPrice())
                                .brandName(doc.getBrandName())
                                .variantName(doc.getVariantNames())
                            .build()
                        )
                .toList();

        return PageResponse.builder()
                .content(responses)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .pageNumber(0)
                .pageSize(limit)
                .build();
    }

}
