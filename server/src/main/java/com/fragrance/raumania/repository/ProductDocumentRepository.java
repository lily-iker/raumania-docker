package com.fragrance.raumania.repository;

import com.fragrance.raumania.model.product.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductDocumentRepository extends ElasticsearchRepository<ProductDocument, UUID> {
}
