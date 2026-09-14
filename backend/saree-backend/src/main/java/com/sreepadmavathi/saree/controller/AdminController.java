package com.sreepadmavathi.saree.controller;

import com.sreepadmavathi.saree.dto.AdminRequestDto;
import com.sreepadmavathi.saree.dto.AdminResponseDto;
import com.sreepadmavathi.saree.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/admins")
@PreAuthorize("hasRole('OWNER')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<AdminResponseDto> createAdmin(@Valid @RequestBody AdminRequestDto request) {
        return new ResponseEntity<>(adminService.createAdmin(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<AdminResponseDto> deactivateAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deactivateAdmin(id));
    }

    @GetMapping
    public ResponseEntity<List<AdminResponseDto>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }
}
