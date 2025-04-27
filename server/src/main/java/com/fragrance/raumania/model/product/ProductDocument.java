package com.fragrance.raumania.model.product;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(indexName = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDocument {

    @Id
    @Field(type = FieldType.Keyword)
    private UUID id;

    @Field(type = FieldType.Text, analyzer = "english")
    private String name;

    @Field(type = FieldType.Text, analyzer = "english")
    private String description;

    @Field(type = FieldType.Text, analyzer = "english")
    private String productMaterial;

    @Field(type = FieldType.Text, analyzer = "english")
    private String inspiration;

    @Field(type = FieldType.Text, analyzer = "english")
    private String usageInstructions;

    @Field(type = FieldType.Keyword)
    private String thumbnailImage;

    @Field(type = FieldType.Double)
    private Double minPrice;

    @Field(type = FieldType.Double)
    private Double maxPrice;

    @Field(type = FieldType.Boolean)
    private Boolean isActive;

    @Field(type = FieldType.Text)
    private String brandName;

    @Field(type = FieldType.Text, analyzer = "english")
    private List<String> variantNames = new ArrayList<>();

    @Field(type = FieldType.Keyword)
    private List<String> variantSizes = new ArrayList<>();

    @Field(type = FieldType.Text, analyzer = "english")
    private List<String> variantScents = new ArrayList<>();
}