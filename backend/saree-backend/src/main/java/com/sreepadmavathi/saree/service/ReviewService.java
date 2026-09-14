package com.sreepadmavathi.saree.service;

import com.sreepadmavathi.saree.dto.ReviewAggregationDto;
import com.sreepadmavathi.saree.dto.ReviewResponseDto;
import com.sreepadmavathi.saree.dto.ReviewSubmitRequestDto;
import com.sreepadmavathi.saree.entity.CustomerReview;
import com.sreepadmavathi.saree.entity.Customer;
import com.sreepadmavathi.saree.entity.Order;
import com.sreepadmavathi.saree.entity.OrderStatus;
import com.sreepadmavathi.saree.entity.OrderItem;
import com.sreepadmavathi.saree.entity.Saree;
import com.sreepadmavathi.saree.mapper.ReviewMapper;
import com.sreepadmavathi.saree.repository.CustomerReviewRepository;
import com.sreepadmavathi.saree.repository.OrderItemRepository;
import com.sreepadmavathi.saree.repository.SareeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final CustomerReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final SareeRepository sareeRepository;
    private final CustomerService customerService;
    private final ReviewMapper reviewMapper;

    public ReviewService(CustomerReviewRepository reviewRepository,
                         OrderItemRepository orderItemRepository,
                         SareeRepository sareeRepository,
                         CustomerService customerService,
                         ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.sareeRepository = sareeRepository;
        this.customerService = customerService;
        this.reviewMapper = reviewMapper;
    }

    @Transactional
    public ReviewResponseDto submitReview(ReviewSubmitRequestDto request) {
        Saree saree = sareeRepository.findById(request.getSareeId())
                .orElseThrow(() -> new RuntimeException("Saree not found"));

        CustomerReview review = new CustomerReview();
        review.setSaree(saree);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setPhotoUrl(request.getPhotoUrl());
        review.setReviewDate(LocalDateTime.now());
        
        // This is a loose review - we don't have the customer resolved from auth,
        // so we just store the name they provided. If they matched an order, we could use that.
        // For simplicity, we just save the name provided or resolve if possible.
        // But the schema implies customer_id is a foreign key, so we need to resolve it.
        // Let's resolve via phone.
        Customer resolvedCust = customerService.resolveCustomer(request.getPhone(), request.getName(), null);
        review.setCustomer(resolvedCust);
        review.setCustomerName(request.getName());

        List<OrderItem> orderItems = orderItemRepository.findBySaree_IdAndOrder_OrderCodeAndOrder_CustomerPhone(
                request.getSareeId(), request.getOrderCode(), request.getPhone());

        if (!orderItems.isEmpty()) {
            OrderItem orderItem = orderItems.get(0);
            if (reviewRepository.existsByOrderItem_Id(orderItem.getId())) {
                throw new RuntimeException("A review already exists for this purchased item."); // 409 Conflict
            }
            review.setOrderItem(orderItem);
            review.setIsVerifiedPurchase(true);
            // Override customer to the exact one from the order
            review.setCustomer(orderItem.getOrder().getCustomer());
        } else {
            review.setOrderItem(null);
            review.setIsVerifiedPurchase(false);
        }

        CustomerReview savedReview = reviewRepository.save(review);
        recalculateSareeRating(saree.getId());

        return reviewMapper.toResponseDto(savedReview);
    }

    public List<ReviewResponseDto> getReviewsForSaree(Long sareeId) {
        return reviewRepository.findBySaree_IdOrderByReviewDateDesc(sareeId)
                .stream()
                .map(reviewMapper::fromProjection)
                .toList();
    }

    public List<ReviewResponseDto> getAllReviews() {
        return reviewRepository.findAllByOrderByReviewDateDesc()
                .stream()
                .map(reviewMapper::fromProjection)
                .toList();
    }

    public String getReviewPhotoBase64(Long id) {
        return reviewRepository.findById(id)
                .map(CustomerReview::getPhotoUrl)
                .orElse(null);
    }

    private void recalculateSareeRating(Long sareeId) {
        ReviewAggregationDto agg = reviewRepository.getReviewAggregationForSaree(sareeId);
        
        BigDecimal avgRating = BigDecimal.ZERO;
        Integer ratingCount = 0;

        if (agg != null && agg.getRatingCount() > 0) {
            avgRating = BigDecimal.valueOf(agg.getAvgRating()).setScale(1, RoundingMode.HALF_UP);
            ratingCount = agg.getRatingCount().intValue();
        }

        sareeRepository.updateSareeRating(sareeId, avgRating, ratingCount);
    }
}
