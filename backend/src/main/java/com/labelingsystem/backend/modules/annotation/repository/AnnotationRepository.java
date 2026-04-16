package com.labelingsystem.backend.modules.annotation.repository;

import com.labelingsystem.backend.modules.annotation.entity.Annotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AnnotationRepository extends JpaRepository<Annotation, Long> {
    List<Annotation> findByImageId(Long imageId);
    
    @Query("SELECT COUNT(DISTINCT a.image.id) FROM Annotation a WHERE a.task.id = :taskId")
    long countAnnotatedImages(@Param("taskId") Long taskId);
}
