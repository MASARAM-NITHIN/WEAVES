package com.sreepadmavathi.saree;

import com.sreepadmavathi.saree.dto.OrderPlaceRequestDto;
import com.sreepadmavathi.saree.dto.OrderResponseDto;
import com.sreepadmavathi.saree.dto.ReviewResponseDto;
import com.sreepadmavathi.saree.dto.ReviewSubmitRequestDto;
import com.sreepadmavathi.saree.dto.OrderItemRequestDto;
import com.sreepadmavathi.saree.entity.Order;
import com.sreepadmavathi.saree.entity.OrderStatus;
import com.sreepadmavathi.saree.entity.Saree;
import com.sreepadmavathi.saree.repository.OrderRepository;
import com.sreepadmavathi.saree.repository.SareeRepository;
import com.sreepadmavathi.saree.service.OrderService;
import com.sreepadmavathi.saree.service.ReviewService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class EndToEndSmokeTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private SareeRepository sareeRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @Transactional
    public void testGuestCheckoutAndReviewFlow() {
        // Assume sareeRepository has at least one mock saree injected by test profile sql or setup
        Saree saree = new Saree();
        saree.setSareeName("Test Kanchipuram");
        saree.setStockAvailable(10);
        saree.setActualPrice(new BigDecimal("5000"));
        saree.setDiscountedPrice(new BigDecimal("5000"));
        saree.setDiscountPercent(BigDecimal.ZERO);
        saree.setInStock(true);
        saree.setAvgRating(BigDecimal.ZERO);
        saree.setRatingCount(0);
        saree = sareeRepository.save(saree);
        
        Long sareeId = saree.getId();

        // 1. Place a guest order
        OrderPlaceRequestDto orderReq = new OrderPlaceRequestDto();
        orderReq.setPhone("9999999999");
        orderReq.setCustomerName("Guest User");
        orderReq.setShippingAddress("123 Silk Road");
        orderReq.setCity("Chennai");
        orderReq.setState("Tamil Nadu");
        orderReq.setPincode("600001");
        
        OrderItemRequestDto itemReq = new OrderItemRequestDto();
        itemReq.setSareeId(sareeId);
        itemReq.setQuantity(2);
        orderReq.setItems(Collections.singletonList(itemReq));

        OrderResponseDto orderResp = orderService.placeOrder(orderReq);
        assertNotNull(orderResp.getOrderCode());
        
        // Verify stock decremented
        Saree updatedSaree = sareeRepository.findById(sareeId).get();
        assertEquals(8, updatedSaree.getStockAvailable()); // 10 - 2 = 8

        // 2. Admin marks it DELIVERED
        OrderResponseDto updatedOrder = orderService.updateOrderStatus(orderResp.getId(), OrderStatus.DELIVERED);
        assertEquals("DELIVERED", updatedOrder.getOrderStatus());

        // 3. Submit a verified review
        ReviewSubmitRequestDto reviewReq = new ReviewSubmitRequestDto();
        reviewReq.setOrderCode(orderResp.getOrderCode());
        reviewReq.setPhone("9999999999");
        reviewReq.setSareeId(sareeId);
        reviewReq.setRating((short) 5);
        reviewReq.setComment("Amazing quality!");

        ReviewResponseDto reviewResp = reviewService.submitReview(reviewReq);
        assertTrue(reviewResp.getIsVerifiedPurchase());

        // 4. Confirm Saree Rating updated
        updatedSaree = sareeRepository.findById(sareeId).get();
        assertEquals(new BigDecimal("5.0"), updatedSaree.getAvgRating());
        assertEquals(1, updatedSaree.getRatingCount());
    }
}
