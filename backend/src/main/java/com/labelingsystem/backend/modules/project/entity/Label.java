package com.labelingsystem.backend.modules.project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "labels")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Label {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "name", length = 256, nullable = false)
    private String name;

    @Column(name = "color", length = 50, nullable = false)
    private String color;

    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;
}