package com.labelingsystem.backend.modules.user.repository;

import com.labelingsystem.backend.modules.user.entity.Role;
import com.labelingsystem.backend.common.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleType name);
}
