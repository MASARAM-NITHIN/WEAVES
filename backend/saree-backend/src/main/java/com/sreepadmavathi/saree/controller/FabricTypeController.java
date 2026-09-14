package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.FabricTypeRequestDto;
import com.sreepadmavathi.saree.dto.FabricTypeResponseDto;
import com.sreepadmavathi.saree.service.FabricTypeService;
import com.sreepadmavathi.saree.service.ImageStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FabricTypeController {

    private final FabricTypeService fabricTypeService;
    private final ImageStorageService storageService;

    public FabricTypeController(FabricTypeService fabricTypeService, ImageStorageService storageService) {
        this.fabricTypeService = fabricTypeService;
        this.storageService = storageService;
    }

    // --- Public Endpoints ---
    @GetMapping("/fabric-types")
    public ResponseEntity<List<FabricTypeResponseDto>> getAllFabricTypes() {
        return ResponseEntity.ok(fabricTypeService.getAllFabricTypes());
    }

    @GetMapping("/fabric-types/{id}")
    public ResponseEntity<FabricTypeResponseDto> getFabricTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(fabricTypeService.getFabricTypeById(id));
    }

    // --- Admin Endpoints ---
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admin/fabric-types")
    public ResponseEntity<FabricTypeResponseDto> createFabricType(@Valid @RequestBody FabricTypeRequestDto request) {
        return new ResponseEntity<>(fabricTypeService.createFabricType(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/admin/fabric-types/{id}")
    public ResponseEntity<FabricTypeResponseDto> updateFabricType(@PathVariable Long id, @Valid @RequestBody FabricTypeRequestDto request) {
        return ResponseEntity.ok(fabricTypeService.updateFabricType(id, request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/admin/fabric-types/{id}")
    public ResponseEntity<Void> deleteFabricType(@PathVariable Long id) {
        fabricTypeService.deleteFabricType(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admin/fabric-types/{id}/image")
    public ResponseEntity<?> uploadFabricImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = storageService.uploadImage(file, "fabrics", "saree-images");
            fabricTypeService.updateImageUrl(id, imageUrl);
            return ResponseEntity.ok(Map.of("message", "Image uploaded successfully", "imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        }
    }
}
