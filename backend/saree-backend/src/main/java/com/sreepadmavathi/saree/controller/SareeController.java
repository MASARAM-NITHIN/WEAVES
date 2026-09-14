package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.SareeCreateRequestDto;
import com.sreepadmavathi.saree.dto.SareeResponseDto;
import com.sreepadmavathi.saree.dto.SareeUpdateRequestDto;
import com.sreepadmavathi.saree.service.SareeService;
import com.sreepadmavathi.saree.service.ImageStorageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SareeController {

    private final SareeService sareeService;
    private final ImageStorageService storageService;

    public SareeController(SareeService sareeService, ImageStorageService storageService) {
        this.sareeService = sareeService;
        this.storageService = storageService;
    }

    // --- Public Endpoints ---
    @GetMapping("/sarees")
    public ResponseEntity<Page<SareeResponseDto>> getSarees(
            @RequestParam(required = false) Long fabricTypeId,
            @RequestParam(required = false) Long collectionId,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean isBestSeller,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<SareeResponseDto> sarees = sareeService.getSarees(fabricTypeId, collectionId, isNew, isBestSeller, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(sarees);
    }

    @GetMapping("/sarees/{id}")
    public ResponseEntity<SareeResponseDto> getSareeById(@PathVariable Long id) {
        return ResponseEntity.ok(sareeService.getSareeById(id));
    }

    // --- Admin Endpoints ---
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admin/sarees")
    public ResponseEntity<SareeResponseDto> createSaree(@Valid @RequestBody SareeCreateRequestDto request) {
        return new ResponseEntity<>(sareeService.createSaree(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/admin/sarees/{id}")
    public ResponseEntity<SareeResponseDto> updateSaree(@PathVariable Long id, @Valid @RequestBody SareeUpdateRequestDto request) {
        return ResponseEntity.ok(sareeService.updateSaree(id, request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/admin/sarees/{id}")
    public ResponseEntity<Void> deleteSaree(@PathVariable Long id) {
        sareeService.deleteSaree(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admin/sarees/{id}/image")
    public ResponseEntity<?> uploadSareeImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = storageService.uploadImage(file, "sarees", "saree-images");
            sareeService.updateImageUrl(id, imageUrl);
            return ResponseEntity.ok(Map.of("message", "Image uploaded successfully", "imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admin/upload")
    public ResponseEntity<?> uploadGenericImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = storageService.uploadImage(file, "sarees", "saree-images");
            return ResponseEntity.ok(Map.of("success", true, "url", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
