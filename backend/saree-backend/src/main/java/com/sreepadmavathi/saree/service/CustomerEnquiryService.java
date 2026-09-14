package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.dto.EnquiryRequestDto;
import com.sreepadmavathi.saree.dto.EnquiryResponseDto;
import com.sreepadmavathi.saree.entity.CustomerEnquiry;
import com.sreepadmavathi.saree.repository.CustomerEnquiryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CustomerEnquiryService {

    private final CustomerEnquiryRepository enquiryRepository;

    public CustomerEnquiryService(CustomerEnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    public EnquiryResponseDto createEnquiry(EnquiryRequestDto dto) {
        CustomerEnquiry enquiry = CustomerEnquiry.builder()
                .enquiryCode("INQ-" + (int)(Math.random() * 90000 + 10000))
                .orderId(dto.getOrderId() != null && !dto.getOrderId().trim().isEmpty() ? dto.getOrderId() : "N/A")
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .sareeInterest(dto.getSareeInterest() != null && !dto.getSareeInterest().trim().isEmpty() ? dto.getSareeInterest() : "General Consultation")
                .message(dto.getMessage())
                .status("Pending")
                .createdAt(LocalDateTime.now())
                .build();

        enquiry = enquiryRepository.save(enquiry);
        return mapToResponseDto(enquiry);
    }

    public List<EnquiryResponseDto> getAllEnquiries() {
        return enquiryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public EnquiryResponseDto updateEnquiryStatus(UUID id, String status) {
        CustomerEnquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));
        enquiry.setStatus(status);
        enquiry = enquiryRepository.save(enquiry);
        return mapToResponseDto(enquiry);
    }

    public void deleteEnquiry(UUID id) {
        enquiryRepository.deleteById(id);
    }

    private EnquiryResponseDto mapToResponseDto(CustomerEnquiry enquiry) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM yyyy");
        String formattedDate = enquiry.getCreatedAt() != null ? enquiry.getCreatedAt().format(formatter) : "N/A";

        return EnquiryResponseDto.builder()
                .id(enquiry.getId().toString())
                .enquiryCode(enquiry.getEnquiryCode())
                .orderId(enquiry.getOrderId())
                .name(enquiry.getName())
                .email(enquiry.getEmail())
                .phone(enquiry.getPhone())
                .sareeInterest(enquiry.getSareeInterest())
                .message(enquiry.getMessage())
                .status(enquiry.getStatus())
                .date(formattedDate)
                .build();
    }
}
