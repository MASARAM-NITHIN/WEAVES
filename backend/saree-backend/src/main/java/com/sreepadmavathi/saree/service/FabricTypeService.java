package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.dto.FabricTypeRequestDto;
import com.sreepadmavathi.saree.dto.FabricTypeResponseDto;
import com.sreepadmavathi.saree.entity.FabricType;
import com.sreepadmavathi.saree.exception.ResourceInUseException;
import com.sreepadmavathi.saree.repository.FabricTypeRepository;
import com.sreepadmavathi.saree.repository.SareeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FabricTypeService {

    private final FabricTypeRepository fabricTypeRepository;
    private final SareeRepository sareeRepository;

    public FabricTypeService(FabricTypeRepository fabricTypeRepository, SareeRepository sareeRepository) {
        this.fabricTypeRepository = fabricTypeRepository;
        this.sareeRepository = sareeRepository;
    }

    public List<FabricTypeResponseDto> getAllFabricTypes() {
        return fabricTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FabricTypeResponseDto getFabricTypeById(Long id) {
        return fabricTypeRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Fabric Type not found"));
    }

    @Transactional
    public FabricTypeResponseDto createFabricType(FabricTypeRequestDto request) {
        FabricType fabricType = new FabricType();
        fabricType.setFabricName(request.getFabricName());
        fabricType.setDescription(request.getDescription());
        fabricType.setImageUrl(request.getImageUrl());
        
        return mapToResponse(fabricTypeRepository.save(fabricType));
    }

    @Transactional
    public FabricTypeResponseDto updateFabricType(Long id, FabricTypeRequestDto request) {
        FabricType fabricType = fabricTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fabric Type not found"));
                
        fabricType.setFabricName(request.getFabricName());
        fabricType.setDescription(request.getDescription());
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            fabricType.setImageUrl(request.getImageUrl());
        }
        
        return mapToResponse(fabricTypeRepository.save(fabricType));
    }

    @Transactional
    public void deleteFabricType(Long id) {
        if (sareeRepository.existsByFabricTypeId(id)) {
            throw new ResourceInUseException("Cannot delete fabric type: there are sarees associated with it.");
        }
        fabricTypeRepository.deleteById(id);
    }

    @Transactional
    public void updateImageUrl(Long id, String imageUrl) {
        FabricType fabric = fabricTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fabric Type not found"));
        fabric.setImageUrl(imageUrl);
        fabricTypeRepository.save(fabric);
    }

    private FabricTypeResponseDto mapToResponse(FabricType fabricType) {
        FabricTypeResponseDto dto = new FabricTypeResponseDto();
        dto.setId(fabricType.getId());
        dto.setFabricName(fabricType.getFabricName());
        dto.setDescription(fabricType.getDescription());
        dto.setImageUrl(fabricType.getImageUrl());
        return dto;
    }
}
