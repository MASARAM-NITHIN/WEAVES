package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.dto.ThemeCollectionRequestDto;
import com.sreepadmavathi.saree.dto.ThemeCollectionResponseDto;
import com.sreepadmavathi.saree.entity.ThemeCollection;
import com.sreepadmavathi.saree.exception.ResourceInUseException;
import com.sreepadmavathi.saree.repository.SareeRepository;
import com.sreepadmavathi.saree.repository.ThemeCollectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThemeCollectionService {

    private final ThemeCollectionRepository collectionRepository;
    private final SareeRepository sareeRepository;

    public ThemeCollectionService(ThemeCollectionRepository collectionRepository, SareeRepository sareeRepository) {
        this.collectionRepository = collectionRepository;
        this.sareeRepository = sareeRepository;
    }

    public List<ThemeCollectionResponseDto> getAllCollections() {
        return collectionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ThemeCollectionResponseDto getCollectionById(Long id) {
        return collectionRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
    }

    @Transactional
    public ThemeCollectionResponseDto createCollection(ThemeCollectionRequestDto request) {
        ThemeCollection collection = new ThemeCollection();
        collection.setCollectionName(request.getCollectionName());
        collection.setBadge(request.getBadge());
        collection.setDescription(request.getDescription());
        collection.setImageUrl(request.getImageUrl());
        collection.setPublishedAt(LocalDateTime.now());
        
        return mapToResponse(collectionRepository.save(collection));
    }

    @Transactional
    public ThemeCollectionResponseDto updateCollection(Long id, ThemeCollectionRequestDto request) {
        ThemeCollection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
                
        collection.setCollectionName(request.getCollectionName());
        collection.setBadge(request.getBadge());
        collection.setDescription(request.getDescription());
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            collection.setImageUrl(request.getImageUrl());
        }
        
        return mapToResponse(collectionRepository.save(collection));
    }

    @Transactional
    public void deleteCollection(Long id) {
        // Check if collection is used in any saree
        if (sareeRepository.existsByThemeCollectionsId(id)) {
            throw new ResourceInUseException("Cannot delete collection: there are sarees associated with it.");
        }
        collectionRepository.deleteById(id);
    }
    
    @Transactional
    public void updateImageUrl(Long id, String imageUrl) {
        ThemeCollection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        collection.setImageUrl(imageUrl);
        collectionRepository.save(collection);
    }

    private ThemeCollectionResponseDto mapToResponse(ThemeCollection collection) {
        ThemeCollectionResponseDto dto = new ThemeCollectionResponseDto();
        dto.setId(collection.getId());
        dto.setCollectionName(collection.getCollectionName());
        dto.setBadge(collection.getBadge());
        dto.setDescription(collection.getDescription());
        dto.setImageUrl(collection.getImageUrl());
        return dto;
    }
}
