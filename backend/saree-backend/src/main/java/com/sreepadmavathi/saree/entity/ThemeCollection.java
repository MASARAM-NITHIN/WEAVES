package com.sreepadmavathi.saree.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "theme_collections")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "collection_name", unique = true, nullable = false, length = 100)
    private String collectionName;

    @Column(name = "badge", length = 50)
    private String badge;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "published_at", updatable = false)
    private LocalDateTime publishedAt;
}
