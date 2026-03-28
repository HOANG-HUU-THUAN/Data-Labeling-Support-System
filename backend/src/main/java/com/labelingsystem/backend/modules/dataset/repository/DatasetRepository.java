package com.labelingsystem.backend.modules.dataset.repository;

import com.labelingsystem.backend.modules.dataset.entity.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    Optional<Dataset> findByIdAndDeletedFalse(Long id);
}
