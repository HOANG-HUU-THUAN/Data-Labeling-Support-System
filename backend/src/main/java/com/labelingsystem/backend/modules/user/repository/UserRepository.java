package com.labelingsystem.backend.modules.user.repository;

import com.labelingsystem.backend.modules.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
}
