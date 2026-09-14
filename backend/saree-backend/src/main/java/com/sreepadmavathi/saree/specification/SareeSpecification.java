package com.sreepadmavathi.saree.specification;

import com.sreepadmavathi.saree.entity.Saree;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SareeSpecification {

    public static Specification<Saree> getSareesByFilters(
            Long fabricTypeId,
            Long collectionId,
            Boolean isNew,
            Boolean isBestSeller,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (fabricTypeId != null) {
                predicates.add(criteriaBuilder.equal(root.get("fabricType").get("id"), fabricTypeId));
            }

            if (collectionId != null) {
                jakarta.persistence.criteria.Join<Saree, com.sreepadmavathi.saree.entity.ThemeCollection> collectionsJoin = root.join("themeCollections");
                predicates.add(criteriaBuilder.equal(collectionsJoin.get("id"), collectionId));
            }

            if (isNew != null) {
                predicates.add(criteriaBuilder.equal(root.get("isNew"), isNew));
            }

            if (isBestSeller != null) {
                predicates.add(criteriaBuilder.equal(root.get("isBestSeller"), isBestSeller));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("discountedPrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("discountedPrice"), maxPrice));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
