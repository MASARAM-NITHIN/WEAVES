package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.entity.CustomerEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CustomerEnquiryRepository extends JpaRepository<CustomerEnquiry, UUID> {
}
