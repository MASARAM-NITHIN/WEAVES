package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder_Id(Long orderId);
    List<OrderItem> findBySaree_IdAndOrder_OrderCodeAndOrder_CustomerPhone(Long sareeId, String orderCode, String phone);
}
