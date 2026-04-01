package com.labelingsystem.backend.modules.dataset.repository;

import com.labelingsystem.backend.modules.dataset.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    
    @Query("SELECT i FROM Image i WHERE i.dataset.id = :datasetId AND i.status = :status AND i.deleted = false " +
           "AND i.id NOT IN (SELECT ti.id FROM Task t JOIN t.images ti WHERE t.project.id = :projectId AND t.deleted = false)")
    List<Image> findUnassignedImages(@Param("projectId") Long projectId, @Param("datasetId") Long datasetId, @Param("status") String status);
    
    List<Image> findByDatasetIdAndDeletedFalse(Long datasetId);
}
