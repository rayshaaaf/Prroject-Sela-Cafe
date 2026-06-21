package com.selacafe.core_service.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.selacafe.core_service.entity.Role;
import com.selacafe.core_service.repository.RoleRepository;
import com.selacafe.core_service.repository.CategoryRepository;
import com.selacafe.core_service.repository.MenuRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {


private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final MenuRepository menuRepository;

    @Override
    public void run(String... args) {

        if (roleRepository.count() == 0) {

            roleRepository.save(
                Role.builder()
                    .name("ADMIN")
                    .description("Administrator akses penuh")
                    .build()
            );

            roleRepository.save(
                Role.builder()
                    .name("OWNER")
                    .description("Pemilik Cafe")
                    .build()
            );

            roleRepository.save(
                Role.builder()
                    .name("CUSTOMER")
                    .description("Pelanggan aplikasi")
                    .build()
            );

            roleRepository.save(
                Role.builder()
                    .name("CASHIER")
                    .description("Kasir kelola order dan meja")
                    .build()
            );

            roleRepository.save(
                Role.builder()
                    .name("KITCHEN")
                    .description("Dapur update status masak")
                    .build()
            );

            roleRepository.save(
                Role.builder()
                    .name("COURIER")
                    .description("Kurir update status pengiriman")
                    .build()
            );
        }

        if (categoryRepository.count() == 0) {
            com.selacafe.core_service.entity.Category coffee = categoryRepository.save(
                com.selacafe.core_service.entity.Category.builder().nameId("coffee").nameEn("Coffee").build()
            );
            com.selacafe.core_service.entity.Category pastry = categoryRepository.save(
                com.selacafe.core_service.entity.Category.builder().nameId("pastry").nameEn("Pastry").build()
            );
            com.selacafe.core_service.entity.Category tea = categoryRepository.save(
                com.selacafe.core_service.entity.Category.builder().nameId("tea").nameEn("Tea").build()
            );
            com.selacafe.core_service.entity.Category dessert = categoryRepository.save(
                com.selacafe.core_service.entity.Category.builder().nameId("dessert").nameEn("Dessert").build()
            );

            if (menuRepository.count() == 0) {
                menuRepository.save(
                    com.selacafe.core_service.entity.Menu.builder()
                        .nameId("Hazelnut Velvet Latte")
                        .nameEn("Hazelnut Velvet Latte")
                        .price(new java.math.BigDecimal("95000"))
                        .category(coffee)
                        .descriptionId("A smooth blend of our signature espresso with toasted hazelnut essence and micro-foamed milk.")
                        .descriptionEn("A smooth blend of our signature espresso with toasted hazelnut essence and micro-foamed milk.")
                        .imageUrl("https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop")
                        .stock(10)
                        .isAvailable(true)
                        .createdAt(java.time.LocalDateTime.now())
                        .build()
                );
                menuRepository.save(
                    com.selacafe.core_service.entity.Menu.builder()
                        .nameId("Almond Croissant")
                        .nameEn("Almond Croissant")
                        .price(new java.math.BigDecimal("78000"))
                        .category(pastry)
                        .descriptionId("Double-baked pastry filled with rich almond frangipane and topped with toasted slivers.")
                        .descriptionEn("Double-baked pastry filled with rich almond frangipane and topped with toasted slivers.")
                        .imageUrl("https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop")
                        .stock(10)
                        .isAvailable(true)
                        .createdAt(java.time.LocalDateTime.now())
                        .build()
                );
                menuRepository.save(
                    com.selacafe.core_service.entity.Menu.builder()
                        .nameId("Ceremonial Matcha")
                        .nameEn("Ceremonial Matcha")
                        .price(new java.math.BigDecimal("105000"))
                        .category(tea)
                        .descriptionId("Uji-grade matcha whisked with oat milk for a creamy, earthy, and perfectly balanced finish.")
                        .descriptionEn("Uji-grade matcha whisked with oat milk for a creamy, earthy, and perfectly balanced finish.")
                        .imageUrl("https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop")
                        .stock(10)
                        .isAvailable(true)
                        .createdAt(java.time.LocalDateTime.now())
                        .build()
                );
                menuRepository.save(
                    com.selacafe.core_service.entity.Menu.builder()
                        .nameId("Signature Flat White")
                        .nameEn("Signature Flat White")
                        .price(new java.math.BigDecimal("82000"))
                        .category(coffee)
                        .descriptionId("A crisp rosetta latte art with perfectly balanced sweetness and a velvety finish.")
                        .descriptionEn("A crisp rosetta latte art with perfectly balanced sweetness and a velvety finish.")
                        .imageUrl("https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=600&auto=format&fit=crop")
                        .stock(10)
                        .isAvailable(true)
                        .createdAt(java.time.LocalDateTime.now())
                        .build()
                );
                menuRepository.save(
                    com.selacafe.core_service.entity.Menu.builder()
                        .nameId("24h Cold Brew")
                        .nameEn("24h Cold Brew")
                        .price(new java.math.BigDecimal("98000"))
                        .category(coffee)
                        .descriptionId("Cold brew coffee served with a large clear ice sphere, garnished with dried orange.")
                        .descriptionEn("Cold brew coffee served with a large clear ice sphere, garnished with dried orange.")
                        .imageUrl("https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop")
                        .stock(10)
                        .isAvailable(true)
                        .createdAt(java.time.LocalDateTime.now())
                        .build()
                );
                menuRepository.save(
                    com.selacafe.core_service.entity.Menu.builder()
                        .nameId("Dark Choc Sea Salt")
                        .nameEn("Dark Choc Sea Salt")
                        .price(new java.math.BigDecimal("65000"))
                        .category(dessert)
                        .descriptionId("The subtle salt flakes perfectly elevate the dark cocoa notes.")
                        .descriptionEn("The subtle salt flakes perfectly elevate the dark cocoa notes.")
                        .imageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop")
                        .stock(10)
                        .isAvailable(true)
                        .createdAt(java.time.LocalDateTime.now())
                        .build()
                );
            }
        }
    }


}
