package com.fragrance.raumania.configuration.init;

import com.fragrance.raumania.constant.role.RoleName;
import com.fragrance.raumania.mapper.ProductMapper;
import com.fragrance.raumania.model.authorization.Role;
import com.fragrance.raumania.model.product.*;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ReviewRepository reviewRepository;
    private final ProductDocumentRepository productDocumentRepository;
    private final ProductMapper productMapper;

    @PostConstruct
    public void initData() {
        initRoles();
        initAdminAccount();
        initBrands();
        initProductsAndVariants();
        initReviews();
        initProductDocuments();
    }

    public void initRoles() {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        }
        System.out.println("✅ Roles initialized.");
    }

    public void initAdminAccount() {
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMIN).build())); // Use orElseGet to create if not found

        Optional<User> adminUserOpt = userRepository.findByUsername("adminadmin");

        if (adminUserOpt.isEmpty()) {
            User adminUser = User.builder()
                    .fullName("Admin User")
                    .email("adminadmin@gmail.com")
                    .username("adminadmin")
                    .password(passwordEncoder.encode("adminadmin"))
                    .isActive(true)
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);
            System.out.println("✅ Admin user created.");
        } else {
            System.out.println("ℹ️ Admin user already exists.");
        }
    }

    public void initBrands() {
        // List of brands to initialize
        List<Brand> brands = List.of(
                new Brand(null, "Skibidi Toilet", "A unique fragrance inspired by the Skibidi Toilet phenomenon.", new HashSet<>()),
                new Brand(null, "Lavender Dream", "A soothing lavender scent perfect for relaxation.", new HashSet<>()),
                new Brand(null, "Oceanic Breeze", "A fresh and crisp fragrance inspired by the sea.", new HashSet<>()),
                new Brand(null, "Golden Spice", "An exotic, warm fragrance with spicy undertones.", new HashSet<>()),
                new Brand(null, "Floral Blossom", "A refreshing floral fragrance with notes of rose and jasmine.", new HashSet<>()),
                new Brand(null, "Mystic Woods", "A deep and earthy fragrance with a woody base.", new HashSet<>()),
                new Brand(null, "Citrus Splash", "A bright, citrus-infused fragrance for an energetic vibe.", new HashSet<>())
        );

        // Save each brand if not already present
        brands.forEach(brand -> {
            brandRepository.findByName(brand.getName()).ifPresentOrElse(
                    existingBrand -> System.out.println("ℹ️ Brand already exists: " + brand.getName()),
                    () -> {
                        brandRepository.save(brand);
                        System.out.println("✅ Brand initialized: " + brand.getName());
                    }
            );
        });

        System.out.println("✅ Brand initialization complete.");
    }

    public void initProductsAndVariants() {
        Brand skibidiBrand = brandRepository.findByName("Skibidi Toilet")
                .orElseThrow(() -> new IllegalStateException("Brand not found"));

        List<Product> products = List.of(
                Product.builder()
                        .name("Mystic Essence")
                        .description("A captivating fragrance with a delicate balance of rare floral notes and subtle warm accents. This enchanting scent evokes mystery and sophistication, making it perfect for those special occasions where you want to leave a lasting impression.")
                        .productMaterial("Artisan ingredients and rare essences")
                        .inspiration("Inspired by the mysteries of the universe")
                        .usageInstructions("Apply sparingly on pulse points for a lasting aroma")
                        .thumbnailImage("mystic_essence.jpg")
                        .isActive(true)
                        .brand(skibidiBrand)
                        .build(),
                Product.builder()
                        .name("Velvet Bloom")
                        .description("An enchanting fusion of fresh blooms and dewy petals, Velvet Bloom captures the essence of a garden in full splendor at the break of dawn. Its floral and invigorating aroma inspires feelings of rejuvenation and subtle elegance.")
                        .productMaterial("Fresh petals and natural extracts")
                        .inspiration("Inspired by blooming gardens in the spring")
                        .usageInstructions("Spray lightly over the body for even coverage")
                        .thumbnailImage("velvet_bloom.jpg")
                        .isActive(true)
                        .brand(skibidiBrand)
                        .build(),
                Product.builder()
                        .name("Amber Whisper")
                        .description("A warm and woody fragrance that envelops you in an aura of sophistication. Amber Whisper artfully blends rich amber with hints of spice and smokiness, creating a timeless olfactory experience that evolves throughout the day.")
                        .productMaterial("Rich resins and amber oils")
                        .inspiration("Inspired by ancient traditions")
                        .usageInstructions("Apply on wrists and neck and reapply as needed")
                        .thumbnailImage("amber_whisper.jpg")
                        .isActive(true)
                        .brand(skibidiBrand)
                        .build(),
                Product.builder()
                        .name("Ocean Breeze")
                        .description("Dive into the refreshing embrace of Ocean Breeze, a cool and invigorating fragrance reminiscent of a gentle sea spray. With hints of salt and citrus mingling perfectly, this scent transports you to a calming coastal escape.")
                        .productMaterial("Marine extracts and essential minerals")
                        .inspiration("Inspired by the endless ocean")
                        .usageInstructions("Apply after a shower for a refreshing effect")
                        .thumbnailImage("ocean_breeze.jpg")
                        .isActive(true)
                        .brand(skibidiBrand)
                        .build(),
                Product.builder()
                        .name("Golden Spice")
                        .description("Golden Spice is an intoxicating blend of exotic oriental spices and luxurious aromas. It evokes memories of ancient spice routes and rich traditions, delivering a bold yet refined fragrance that captivates the senses.")
                        .productMaterial("Exotic spices, rich musk, and rare resins")
                        .inspiration("Inspired by ancient spice routes and oriental traditions")
                        .usageInstructions("A little goes a long way; apply sparingly")
                        .thumbnailImage("golden_spice.jpg")
                        .isActive(true)
                        .brand(skibidiBrand)
                        .build()
        );

        products.forEach(product -> {
            Optional<Product> existingProduct = productRepository.findByName(product.getName());

            if (existingProduct.isEmpty()) {
                Product savedProduct = productRepository.save(product);
                initProductVariants(savedProduct);
                System.out.println("✅ Product initialized: " + savedProduct.getName());
            } else {
                System.out.println("ℹ️ Product already exists: " + product.getName());
            }
        });

        System.out.println("✅ Product initialization complete.");
    }

    public void initProductVariants(Product product) {
        List<ProductVariant> variants = List.of(
                ProductVariant.builder().name(product.getName() + " - Travel Size").size("50ml").scent("Woody Amber").stock(50).price(36.0).product(product).build(),
                ProductVariant.builder().name(product.getName() + " - Deluxe").size("100ml").scent("Floral Musk").stock(30).price(36.6).product(product).build(),
                ProductVariant.builder().name(product.getName() + " - Collector’s Edition").size("150ml").scent("Citrus Spice").stock(20).price(36.66).product(product).build()
        );

        Double minPrice = null;
        Double maxPrice = null;

        for (ProductVariant variant : variants) {
            Optional<ProductVariant> existingVariant = productVariantRepository.findByNameAndProduct(variant.getName(), product);
            if (existingVariant.isEmpty()) {
                productVariantRepository.save(variant);
                System.out.println("✅ Product variant initialized: " + variant.getName());

                double price = variant.getPrice();
                minPrice = (minPrice == null || price < minPrice) ? price : minPrice;
                maxPrice = (maxPrice == null || price > maxPrice) ? price : maxPrice;
            } else {
                System.out.println("ℹ️ Product variant already exists: " + variant.getName());
            }
        }

        // Update product minPrice and maxPrice if we added new variants
        if (minPrice != null && maxPrice != null) {
            product.setMinPrice(minPrice);
            product.setMaxPrice(maxPrice);
            productRepository.save(product);  // Persist changes to the product
            System.out.println("🔄 Product price range updated: " + product.getName() + " [Min: " + minPrice + ", Max: " + maxPrice + "]");
        }
    }


    public void initReviews() {
        if (reviewRepository.existsByProductName("Mystic Essence")) {
            System.out.println("✅ Reviews already initialized. Skipping initialization.");
            return;
        }

        Optional<Product> mysticEssenceOpt = productRepository.findByName("Mystic Essence");
        if (mysticEssenceOpt.isEmpty()) {
            System.out.println("⚠️ Product 'Mystic Essence' not found. Skipping review initialization.");
            return;
        }
        Product mysticEssence = mysticEssenceOpt.get();

        Optional<ProductVariant> travelSizeVariantOpt = productVariantRepository.findByName("Mystic Essence - Travel Size");
        if (travelSizeVariantOpt.isEmpty()) {
            System.out.println("⚠️ ProductVariant 'Mystic Essence - Travel Size' not found. Skipping review initialization.");
            return;
        }
        ProductVariant travelSizeVariant = travelSizeVariantOpt.get();

        User adminUser = userRepository.findByUsername("adminadmin")
                .orElseThrow(() -> new IllegalStateException("User not found"));

        List<Review> reviews = List.of(
                new Review(null, 5, "Amazing fragrance! Lasts all day.", adminUser, travelSizeVariant, mysticEssence),
                new Review(null, 4, "Really nice scent, but a bit too strong for my taste.", adminUser, travelSizeVariant, mysticEssence),
                new Review(null, 3, "Good product but nothing special.", adminUser, travelSizeVariant, mysticEssence),
                new Review(null, 2, "Not what I expected, a little too sweet.", adminUser, travelSizeVariant, mysticEssence),
                new Review(null, 1, "Worst purchase ever. The scent fades too fast.", adminUser, travelSizeVariant, mysticEssence),
                new Review(null, 5, "Perfect for travel, love the compact size!", adminUser, travelSizeVariant, mysticEssence),
                new Review(null, 4, "Very convenient size but the scent is lighter.", adminUser, travelSizeVariant, mysticEssence)
        );

        // Save reviews
        reviews.forEach(review -> {
            reviewRepository.save(review);
            System.out.println("✅ Review initialized: " + review.getRating() + " stars");
        });

        System.out.println("✅ Review initialization complete.");
    }

    public void initProductDocuments() {

        if (productDocumentRepository.count() > 0) {
            System.out.println("✅ Product documents already initialized. Skipping initialization.");

            return;
        }

        List<Product> products = productRepository.findAllProductsWithBrandAndVariants();
        List<ProductDocument> productDocuments = new ArrayList<>();

        for (Product product : products) {
            ProductDocument productDocument = productMapper.toDocument(product);
            productDocuments.add(productDocument);
            System.out.println("✅ Product document ready for saving: " + product.getName());
            System.out.println("✅ Product id document ready for saving: " + product.getId());
        }

        // Save all documents at once
        productDocumentRepository.saveAll(productDocuments);
        System.out.println("✅ Product document initialization complete.");
    }
}
