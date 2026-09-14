package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.ThemeCollectionRequestDto;
import com.sreepadmavathi.saree.dto.ThemeCollectionResponseDto;
import com.sreepadmavathi.saree.service.ImageStorageService;
import com.sreepadmavathi.saree.service.ThemeCollectionService;
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
public class ThemeCollectionController {

    private final ThemeCollectionService collectionService;
    private final ImageStorageService storageService;

    public ThemeCollectionController(ThemeCollectionService collectionService, ImageStorageService storageService) {
        this.collectionService = collectionService;
        this.storageService = storageService;
    }

    // --- Public Endpoints ---
    @GetMapping("/collections")
    public ResponseEntity<List<ThemeCollectionResponseDto>> getAllCollections() {
        return ResponseEntity.ok(collectionService.getAllCollections());
    }

    @GetMapping("/collections/{id}")
    public ResponseEntity<ThemeCollectionResponseDto> getCollectionById(@PathVariable Long id) {
        return ResponseEntity.ok(collectionService.getCollectionById(id));
    }

    // --- Admin Endpoints ---
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admin/collections")
    public ResponseEntity<ThemeCollectionResponseDto> createCollection(@Valid @RequestBody ThemeCollectionRequestDto request) {
        return new ResponseEntity<>(collectionService.createCollection(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/admin/collections/{id}")
    public ResponseEntity<ThemeCollectionResponseDto> updateCollection(@PathVariable Long id, @Valid @RequestBody ThemeCollectionRequestDto request) {
        return ResponseEntity.ok(collectionService.updateCollection(id, request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/admin/collections/{id}")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.noContent().build();
    }
    
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/admin/collections/{id}/image")
    public ResponseEntity<?> uploadCollectionImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = storageService.uploadImage(file, "collections", "saree-images");
            collectionService.updateImageUrl(id, imageUrl);
            return ResponseEntity.ok(Map.of("message", "Image uploaded successfully", "imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        }
    }
}
