package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.entity.Saree;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SareeRepository extends JpaRepository<Saree, Long>, JpaSpecificationExecutor<Saree> {

    @EntityGraph(attributePaths = {"fabricType", "themeCollections"})
    Page<Saree> findAll(Specification<Saree> spec, Pageable pageable);
    
    @EntityGraph(attributePaths = {"fabricType", "themeCollections"})
    Optional<Saree> findById(Long id);

    List<Saree> findByThemeCollections_Id(Long collectionId);
    List<Saree> findByFabricType_Id(Long fabricTypeId);
    List<Saree> findByIsBestSellerTrue();
    List<Saree> findByIsNewTrue();
    
    boolean existsByThemeCollectionsId(Long collectionId);
    boolean existsByFabricTypeId(Long fabricTypeId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Saree s SET s.avgRating = :avgRating, s.ratingCount = :ratingCount WHERE s.id = :sareeId")
    void updateSareeRating(@org.springframework.data.repository.query.Param("sareeId") Long sareeId, 
                           @org.springframework.data.repository.query.Param("avgRating") java.math.BigDecimal avgRating, 
                           @org.springframework.data.repository.query.Param("ratingCount") Integer ratingCount);
}
