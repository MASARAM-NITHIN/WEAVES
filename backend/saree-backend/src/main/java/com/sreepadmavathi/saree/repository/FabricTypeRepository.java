package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.entity.FabricType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FabricTypeRepository extends JpaRepository<FabricType, Long> {
}
