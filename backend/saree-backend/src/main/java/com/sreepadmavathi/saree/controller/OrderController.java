package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.OrderPlaceRequestDto;
import com.sreepadmavathi.saree.dto.OrderResponseDto;
import com.sreepadmavathi.saree.dto.PaymentUploadDto;
import com.sreepadmavathi.saree.entity.Order;
import com.sreepadmavathi.saree.entity.OrderStatus;
import com.sreepadmavathi.saree.entity.VerificationStatus;
import com.sreepadmavathi.saree.service.OrderService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // --- Public Endpoints ---

    @PostMapping("/orders")
    public ResponseEntity<OrderResponseDto> placeOrder(@Valid @RequestBody OrderPlaceRequestDto request) {
        return new ResponseEntity<>(orderService.placeOrder(request), HttpStatus.CREATED);
    }

    @PostMapping("/orders/{orderCode}/payment-proof")
    public ResponseEntity<?> uploadPaymentProof(
            @PathVariable String orderCode,
            @RequestParam("phone") String phone,
            @RequestParam("utrNumber") String utrNumber,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = orderService.uploadPaymentProof(orderCode, phone, utrNumber, file);
            return ResponseEntity.ok(Map.of("message", "Payment proof uploaded successfully", "paymentScreenshotUrl", imageUrl));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload payment proof: " + e.getMessage());
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/orders/lookup")
    public ResponseEntity<OrderResponseDto> lookupOrder(
            @RequestParam String orderCode,
            @RequestParam String phone) {
        try {
            return ResponseEntity.ok(orderService.lookupOrder(orderCode, phone));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/orders/history")
    public ResponseEntity<List<OrderResponseDto>> getOrderHistory(@RequestParam String phone) {
        return ResponseEntity.ok(orderService.getOrdersHistoryByPhone(phone));
    }

    // --- Admin Endpoints ---

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/admin/orders")
    public ResponseEntity<Page<OrderResponseDto>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Sort by orderedAt descending so newest orders are always on top
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "orderedAt"));
        return ResponseEntity.ok(orderService.getOrders(pageable));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/admin/orders/{id}/verification-status")
    public ResponseEntity<OrderResponseDto> updateVerificationStatus(
            @PathVariable Long id,
            @RequestParam VerificationStatus status) {
        return ResponseEntity.ok(orderService.updateVerificationStatus(id, status));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
