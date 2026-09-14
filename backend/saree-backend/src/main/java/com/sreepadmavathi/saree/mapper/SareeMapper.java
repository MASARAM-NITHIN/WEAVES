package com.sreepadmavathi.saree.mapper;

import com.sreepadmavathi.saree.dto.SareeResponseDto;
import com.sreepadmavathi.saree.entity.Saree;
import org.springframework.stereotype.Component;

@Component
public class SareeMapper {

    public SareeResponseDto toResponseDto(Saree saree) {
        if (saree == null) return null;

        SareeResponseDto dto = new SareeResponseDto();
        dto.setId(saree.getId());
        dto.setSareeName(saree.getSareeName());
        
        if (saree.getFabricType() != null) {
            dto.setFabricTypeId(saree.getFabricType().getId());
            dto.setFabricTypeName(saree.getFabricType().getFabricName());
        }
        
        if (saree.getThemeCollections() != null && !saree.getThemeCollections().isEmpty()) {
            dto.setCollectionIds(saree.getThemeCollections().stream().map(com.sreepadmavathi.saree.entity.ThemeCollection::getId).collect(java.util.stream.Collectors.toList()));
            dto.setCollectionNames(saree.getThemeCollections().stream().map(com.sreepadmavathi.saree.entity.ThemeCollection::getCollectionName).collect(java.util.stream.Collectors.toList()));
        } else {
            dto.setCollectionIds(new java.util.ArrayList<>());
            dto.setCollectionNames(new java.util.ArrayList<>());
        }
        
        dto.setDescription(saree.getDescription());
        dto.setImageUrl(saree.getImageUrl());
        dto.setActualPrice(saree.getActualPrice());
        dto.setDiscountPercent(saree.getDiscountPercent());
        dto.setDiscountedPrice(saree.getDiscountedPrice());
        dto.setStockAvailable(saree.getStockAvailable());
        dto.setInStock(saree.getInStock());
        dto.setIsNew(saree.getIsNew());
        dto.setIsBestSeller(saree.getIsBestSeller());
        dto.setAvgRating(saree.getAvgRating());
        dto.setRatingCount(saree.getRatingCount());
        dto.setPublishedAt(saree.getPublishedAt());
        
        return dto;
    }
}
