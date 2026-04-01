package com.labelingsystem.backend.modules.project.repository;

import com.labelingsystem.backend.modules.project.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {
}