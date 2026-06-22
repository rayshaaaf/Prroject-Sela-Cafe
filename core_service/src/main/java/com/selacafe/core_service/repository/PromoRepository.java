package com.selacafe.core_service.repository;

import com.selacafe.core_service.entity.Promo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PromoRepository extends JpaRepository<Promo, Long> {
    Optional<Promo> findByPromoCodeIgnoreCase(String promoCode);
}