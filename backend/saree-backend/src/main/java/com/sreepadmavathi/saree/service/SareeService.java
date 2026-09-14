package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.dto.SareeCreateRequestDto;
import com.sreepadmavathi.saree.dto.SareeResponseDto;
import com.sreepadmavathi.saree.dto.SareeUpdateRequestDto;
import com.sreepadmavathi.saree.entity.FabricType;
import com.sreepadmavathi.saree.entity.Saree;
import com.sreepadmavathi.saree.entity.ThemeCollection;
import com.sreepadmavathi.saree.mapper.SareeMapper;
import com.sreepadmavathi.saree.repository.FabricTypeRepository;
import com.sreepadmavathi.saree.repository.SareeRepository;
import com.sreepadmavathi.saree.repository.ThemeCollectionRepository;
import com.sreepadmavathi.saree.specification.SareeSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class SareeService {

    private final SareeRepository sareeRepository;
    private final FabricTypeRepository fabricTypeRepository;
    private final ThemeCollectionRepository themeCollectionRepository;
    private final SareeMapper sareeMapper;

    public SareeService(SareeRepository sareeRepository, 
                        FabricTypeRepository fabricTypeRepository, 
                        ThemeCollectionRepository themeCollectionRepository, 
                        SareeMapper sareeMapper) {
        this.sareeRepository = sareeRepository;
        this.fabricTypeRepository = fabricTypeRepository;
        this.themeCollectionRepository = themeCollectionRepository;
        this.sareeMapper = sareeMapper;
    }

    public Page<SareeResponseDto> getSarees(
            Long fabricTypeId, Long collectionId, Boolean isNew, Boolean isBestSeller,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {

        Specification<Saree> spec = SareeSpecification.getSareesByFilters(
                fabricTypeId, collectionId, isNew, isBestSeller, minPrice, maxPrice);

        return sareeRepository.findAll(spec, pageable).map(sareeMapper::toResponseDto);
    }

    public SareeResponseDto getSareeById(Long id) {
        return sareeRepository.findById(id)
                .map(sareeMapper::toResponseDto)
                .orElseThrow(() -> new RuntimeException("Saree not found"));
    }

    @Transactional
    public SareeResponseDto createSaree(SareeCreateRequestDto request) {
        Saree saree = new Saree();
        saree.setSareeName(request.getSareeName());
        saree.setDescription(request.getDescription());
        saree.setImageUrl(request.getImageUrl());
        
        saree.setActualPrice(request.getActualPrice());
        if (request.getDiscountedPrice() != null) {
            saree.setDiscountedPrice(request.getDiscountedPrice());
            if (saree.getActualPrice() != null && saree.getActualPrice().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discountAmt = saree.getActualPrice().subtract(saree.getDiscountedPrice());
                BigDecimal percent = discountAmt.divide(saree.getActualPrice(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
                saree.setDiscountPercent(percent.setScale(2, RoundingMode.HALF_UP));
            } else {
                saree.setDiscountPercent(BigDecimal.ZERO);
            }
        } else {
            saree.setDiscountPercent(request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO);
            saree.setDiscountedPrice(calculateDiscountedPrice(saree.getActualPrice(), saree.getDiscountPercent()));
        }

        saree.setStockAvailable(request.getStockAvailable() != null ? request.getStockAvailable() : 0);
        saree.setInStock(saree.getStockAvailable() > 0);

        saree.setIsNew(request.getIsNew() != null ? request.getIsNew() : true);
        saree.setIsBestSeller(request.getIsBestSeller() != null ? request.getIsBestSeller() : false);
        
        saree.setAvgRating(BigDecimal.ZERO);
        saree.setRatingCount(0);
        saree.setPublishedAt(LocalDateTime.now());

        if (request.getFabricTypeId() != null) {
            FabricType fabric = fabricTypeRepository.findById(request.getFabricTypeId())
                    .orElseThrow(() -> new RuntimeException("Fabric type not found"));
            saree.setFabricType(fabric);
        }

        if (request.getCollectionIds() != null && !request.getCollectionIds().isEmpty()) {
            java.util.List<com.sreepadmavathi.saree.entity.ThemeCollection> collections = themeCollectionRepository.findAllById(request.getCollectionIds());
            saree.getThemeCollections().addAll(collections);
        }

        return sareeMapper.toResponseDto(sareeRepository.save(saree));
    }

    @Transactional
    public SareeResponseDto updateSaree(Long id, SareeUpdateRequestDto request) {
        Saree saree = sareeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Saree not found"));

        saree.setSareeName(request.getSareeName());
        saree.setDescription(request.getDescription());
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            saree.setImageUrl(request.getImageUrl());
        }

        saree.setActualPrice(request.getActualPrice());
        if (request.getDiscountedPrice() != null) {
            saree.setDiscountedPrice(request.getDiscountedPrice());
            if (saree.getActualPrice() != null && saree.getActualPrice().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discountAmt = saree.getActualPrice().subtract(saree.getDiscountedPrice());
                BigDecimal percent = discountAmt.divide(saree.getActualPrice(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
                saree.setDiscountPercent(percent.setScale(2, RoundingMode.HALF_UP));
            } else {
                saree.setDiscountPercent(BigDecimal.ZERO);
            }
        } else {
            saree.setDiscountPercent(request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO);
            saree.setDiscountedPrice(calculateDiscountedPrice(saree.getActualPrice(), saree.getDiscountPercent()));
        }

        saree.setStockAvailable(request.getStockAvailable() != null ? request.getStockAvailable() : 0);
        saree.setInStock(saree.getStockAvailable() > 0);

        if (request.getIsNew() != null) saree.setIsNew(request.getIsNew());
        if (request.getIsBestSeller() != null) saree.setIsBestSeller(request.getIsBestSeller());

        if (request.getFabricTypeId() != null) {
            FabricType fabric = fabricTypeRepository.findById(request.getFabricTypeId())
                    .orElseThrow(() -> new RuntimeException("Fabric type not found"));
            saree.setFabricType(fabric);
        } else {
            saree.setFabricType(null);
        }

        saree.getThemeCollections().clear();
        if (request.getCollectionIds() != null && !request.getCollectionIds().isEmpty()) {
            java.util.List<com.sreepadmavathi.saree.entity.ThemeCollection> collections = themeCollectionRepository.findAllById(request.getCollectionIds());
            saree.getThemeCollections().addAll(collections);
        }

        return sareeMapper.toResponseDto(sareeRepository.save(saree));
    }

    @Transactional
    public void deleteSaree(Long id) {
        if (!sareeRepository.existsById(id)) {
            throw new RuntimeException("Saree not found");
        }
        sareeRepository.deleteById(id);
    }
    
    @Transactional
    public void updateImageUrl(Long id, String imageUrl) {
        Saree saree = sareeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Saree not found"));
        saree.setImageUrl(imageUrl);
        sareeRepository.save(saree);
    }

    private BigDecimal calculateDiscountedPrice(BigDecimal actualPrice, BigDecimal discountPercent) {
        if (actualPrice == null) return BigDecimal.ZERO;
        if (discountPercent == null || discountPercent.compareTo(BigDecimal.ZERO) == 0) {
            return actualPrice;
        }
        BigDecimal multiplier = BigDecimal.ONE.subtract(discountPercent.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        return actualPrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }
}
