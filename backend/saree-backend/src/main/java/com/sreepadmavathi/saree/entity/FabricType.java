package com.sreepadmavathi.saree.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fabric_types")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FabricType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fabric_name", unique = true, nullable = false, length = 100)
    private String fabricName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
}
