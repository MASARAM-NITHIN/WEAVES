package com.sreepadmavathi.saree.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sarees")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Saree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "saree_name", nullable = false)
    private String sareeName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fabric_type_id")
    private FabricType fabricType;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "saree_collections",
            joinColumns = @JoinColumn(name = "saree_id"),
            inverseJoinColumns = @JoinColumn(name = "collection_id"))
    private java.util.Set<ThemeCollection> themeCollections = new java.util.HashSet<>();

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "actual_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal actualPrice;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @Column(name = "discounted_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountedPrice;

    @Column(name = "stock_available")
    private Integer stockAvailable;

    @Column(name = "in_stock")
    private Boolean inStock;

    @Column(name = "is_new")
    private Boolean isNew;

    @Column(name = "is_best_seller")
    private Boolean isBestSeller;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private BigDecimal avgRating;

    @Column(name = "rating_count")
    private Integer ratingCount;

    @CreationTimestamp
    @Column(name = "published_at", updatable = false)
    private LocalDateTime publishedAt;
}
