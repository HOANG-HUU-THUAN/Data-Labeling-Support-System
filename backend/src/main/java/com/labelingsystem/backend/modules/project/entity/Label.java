package com.labelingsystem.backend.modules.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "labels")
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