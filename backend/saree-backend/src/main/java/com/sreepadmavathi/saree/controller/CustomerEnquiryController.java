package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.EnquiryRequestDto;
import com.sreepadmavathi.saree.dto.EnquiryResponseDto;
import com.sreepadmavathi.saree.service.CustomerEnquiryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CustomerEnquiryController {

    private final CustomerEnquiryService enquiryService;

    public CustomerEnquiryController(CustomerEnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    // Public Endpoint: Submit an enquiry
    @PostMapping("/public/enquiries")
    public ResponseEntity<EnquiryResponseDto> submitEnquiry(@Valid @RequestBody EnquiryRequestDto requestDto) {
        EnquiryResponseDto response = enquiryService.createEnquiry(requestDto);
        return ResponseEntity.ok(response);
    }

    // Admin Endpoint: Get all enquiries
    @GetMapping("/admin/enquiries")
    public ResponseEntity<List<EnquiryResponseDto>> getAllEnquiries() {
        return ResponseEntity.ok(enquiryService.getAllEnquiries());
    }

    // Admin Endpoint: Update status
    @PutMapping("/admin/enquiries/{id}/status")
    public ResponseEntity<EnquiryResponseDto> updateEnquiryStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        return ResponseEntity.ok(enquiryService.updateEnquiryStatus(id, status));
    }

    // Admin Endpoint: Delete enquiry
    @DeleteMapping("/admin/enquiries/{id}")
    public ResponseEntity<Void> deleteEnquiry(@PathVariable UUID id) {
        enquiryService.deleteEnquiry(id);
        return ResponseEntity.ok().build();
    }
}
