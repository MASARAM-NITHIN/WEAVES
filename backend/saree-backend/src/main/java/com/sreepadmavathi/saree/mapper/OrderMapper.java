package com.sreepadmavathi.saree.mapper;

import com.sreepadmavathi.saree.dto.OrderResponseDto;
import com.sreepadmavathi.saree.dto.OrderItemResponseDto;
import com.sreepadmavathi.saree.entity.Order;
import com.sreepadmavathi.saree.entity.OrderItem;
import com.sreepadmavathi.saree.repository.CustomerReviewRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    private final CustomerReviewRepository reviewRepository;

    public OrderMapper(CustomerReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public OrderResponseDto toResponseDto(Order order, List<OrderItem> items) {
        if (order == null) return null;

        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setOrderCode(order.getOrderCode());
        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
        }
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setCity(order.getCity());
        dto.setState(order.getState());
        dto.setPincode(order.getPincode());
        dto.setOrderTotal(order.getOrderTotal());
        dto.setUpiId(order.getUpiId());
        dto.setUtrNumber(order.getUtrNumber());
        dto.setPaymentScreenshotUrl(order.getPaymentScreenshotUrl());
        if (order.getVerificationStatus() != null) {
            dto.setVerificationStatus(order.getVerificationStatus().name());
        }
        if (order.getOrderStatus() != null) {
            dto.setOrderStatus(order.getOrderStatus().name());
        }
        dto.setOrderedAt(order.getOrderedAt());

        if (items != null) {
            dto.setItems(items.stream().map(this::toItemResponseDto).collect(Collectors.toList()));
        }

        return dto;
    }

    private OrderItemResponseDto toItemResponseDto(OrderItem item) {
        if (item == null) return null;
        OrderItemResponseDto dto = new OrderItemResponseDto();
        dto.setId(item.getId());
        if (item.getSaree() != null) {
            dto.setSareeId(item.getSaree().getId());
            dto.setImageUrl(item.getSaree().getImageUrl());
        }
        dto.setSareeName(item.getSareeName());
        dto.setPrice(item.getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getSubtotal());
        if (item.getId() != null) {
            dto.setIsReviewed(reviewRepository.existsByOrderItem_Id(item.getId()));
        } else {
            dto.setIsReviewed(false);
        }
        return dto;
    }
}
