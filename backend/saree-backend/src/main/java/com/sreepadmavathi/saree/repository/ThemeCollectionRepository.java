package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.entity.ThemeCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThemeCollectionRepository extends JpaRepository<ThemeCollection, Long> {
}
