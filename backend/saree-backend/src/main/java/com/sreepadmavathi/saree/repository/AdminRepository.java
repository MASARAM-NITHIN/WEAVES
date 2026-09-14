package com.sreepadmavathi.saree.repository;

import com.sreepadmavathi.saree.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByAdminUsername(String username);

    @Transactional
    @Modifying
    @Query("UPDATE Admin a SET a.failedLoginAttempts = a.failedLoginAttempts + 1 WHERE a.adminUsername = :username")
    void incrementFailedLoginAttempts(@Param("username") String username);

    @Transactional
    @Modifying
    @Query("UPDATE Admin a SET a.failedLoginAttempts = 0, a.lockoutUntil = null WHERE a.adminUsername = :username")
    void resetFailedLoginAttempts(@Param("username") String username);

    @Transactional
    @Modifying
    @Query("UPDATE Admin a SET a.lockoutUntil = :lockoutTime WHERE a.adminUsername = :username")
    void lockAccount(@Param("username") String username, @Param("lockoutTime") LocalDateTime lockoutTime);
}
