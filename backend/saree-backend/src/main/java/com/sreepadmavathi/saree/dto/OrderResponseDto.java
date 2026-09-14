package com.sreepadmavathi.saree.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDto {
    private Long id;
    private String orderCode;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal orderTotal;
    private String upiId;
    private String utrNumber;
    private String paymentScreenshotUrl;
    private String verificationStatus;
    private String orderStatus;
    private LocalDateTime orderedAt;
    
    private List<OrderItemResponseDto> items;
}
