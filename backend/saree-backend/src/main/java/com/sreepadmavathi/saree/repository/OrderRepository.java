package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByCustomer_Id(Long customerId);
    Optional<Order> findByOrderCodeAndCustomerPhone(String orderCode, String phone);
    
    @EntityGraph(attributePaths = {"customer"})
    List<Order> findByCustomerPhoneOrderByOrderedAtDesc(String phone);
    
    @EntityGraph(attributePaths = {"customer"})
    Page<Order> findAll(Pageable pageable);
}
