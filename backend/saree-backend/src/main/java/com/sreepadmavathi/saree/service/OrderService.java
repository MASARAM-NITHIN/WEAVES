package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.dto.OrderPlaceRequestDto;
import com.sreepadmavathi.saree.dto.OrderResponseDto;
import com.sreepadmavathi.saree.entity.*;
import com.sreepadmavathi.saree.dto.OrderItemRequestDto;
import com.sreepadmavathi.saree.mapper.OrderMapper;
import com.sreepadmavathi.saree.repository.OrderItemRepository;
import com.sreepadmavathi.saree.repository.OrderRepository;
import com.sreepadmavathi.saree.repository.SareeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final SareeRepository sareeRepository;
    private final CustomerService customerService;
    private final OrderMapper orderMapper;
    private final OrderItemRepository orderItemRepository;

    public OrderService(OrderRepository orderRepository, SareeRepository sareeRepository,
                        CustomerService customerService,
                        OrderMapper orderMapper, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.sareeRepository = sareeRepository;
        this.customerService = customerService;
        this.orderMapper = orderMapper;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public OrderResponseDto placeOrder(OrderPlaceRequestDto request) {
        Customer customer = customerService.resolveCustomer(request.getPhone(), request.getCustomerName(), request.getShippingAddress(), request.getEmail());

        Order order = new Order();
        order.setCustomer(customer);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getPhone());
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setVerificationStatus(VerificationStatus.PENDING);
        order.setOrderedAt(LocalDateTime.now());
        
        // Shipping details (default to customer's if not provided separately, but DTO might have them)
        order.setShippingAddress(request.getShippingAddress());
        order.setCity(request.getCity());
        order.setState(request.getState());
        order.setPincode(request.getPincode());
        
        // Save payment reference details
        order.setUpiId(request.getUpiId());
        order.setUtrNumber(request.getUtrNumber());

        BigDecimal orderTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequestDto itemReq : request.getItems()) {
            Saree saree = sareeRepository.findById(itemReq.getSareeId())
                    .orElseThrow(() -> new RuntimeException("Saree not found: " + itemReq.getSareeId()));

            if (saree.getStockAvailable() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for saree: " + saree.getSareeName());
            }

            saree.setStockAvailable(saree.getStockAvailable() - itemReq.getQuantity());
            saree.setInStock(saree.getStockAvailable() > 0);
            sareeRepository.save(saree);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setSaree(saree);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(saree.getDiscountedPrice());
            orderItem.setSareeName(saree.getSareeName());
            
            BigDecimal subtotal = saree.getDiscountedPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            orderItem.setSubtotal(subtotal);

            orderTotal = orderTotal.add(subtotal);
            orderItems.add(orderItem);
        }

        order.setOrderTotal(orderTotal);
        order = orderRepository.save(order);
        orderItems = orderItemRepository.saveAll(orderItems);

        return orderMapper.toResponseDto(order, orderItems);
    }

    @Transactional
    public String uploadPaymentProof(String orderCode, String phone, String utrNumber, MultipartFile file) throws IOException {
        Order order = orderRepository.findByOrderCodeAndCustomerPhone(orderCode, phone)
                .orElseThrow(() -> new RuntimeException("Order not found or phone number does not match"));

        // Payment screenshots are stored directly in the database as Base64 strings.
        String contentType = file.getContentType();
        if (contentType == null || contentType.equals("application/octet-stream")) {
            // If browser failed to attach proper MIME type, default to jpeg so the <img> tag can render it
            contentType = "image/jpeg";
        }
        String base64Image = "data:" + contentType + ";base64," + java.util.Base64.getEncoder().encodeToString(file.getBytes());

        order.setPaymentScreenshotUrl(base64Image);
        order.setUtrNumber(utrNumber);
        order.setVerificationStatus(VerificationStatus.PENDING); // Mark pending review
        
        orderRepository.save(order);
        
        return base64Image;
    }

    public OrderResponseDto lookupOrder(String orderCode, String phone) {
        Order order = orderRepository.findByOrderCodeAndCustomerPhone(orderCode, phone)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return orderMapper.toResponseDto(order, orderItemRepository.findByOrder_Id(order.getId()));
    }

    public List<OrderResponseDto> getOrdersHistoryByPhone(String phone) {
        return orderRepository.findByCustomerPhoneOrderByOrderedAtDesc(phone)
                .stream()
                .map(order -> orderMapper.toResponseDto(order, orderItemRepository.findByOrder_Id(order.getId())))
                .toList();
    }

    @Transactional
    public OrderResponseDto updateVerificationStatus(Long id, VerificationStatus status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setVerificationStatus(status);
        order = orderRepository.save(order);
        return orderMapper.toResponseDto(order, orderItemRepository.findByOrder_Id(order.getId()));
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(status);
        order = orderRepository.save(order);
        return orderMapper.toResponseDto(order, orderItemRepository.findByOrder_Id(order.getId()));
    }

    public Page<OrderResponseDto> getOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(order -> orderMapper.toResponseDto(order, orderItemRepository.findByOrder_Id(order.getId())));
    }
}
