package com.labelingsystem.backend.modules.project.controller;

import com.labelingsystem.backend.modules.project.dto.request.LabelRequest;
import com.labelingsystem.backend.modules.project.dto.response.LabelResponse;
import com.labelingsystem.backend.modules.project.service.LabelService;
import com.labelingsystem.backend.security.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class LabelController {

    @Autowired
    private LabelService labelService;

    // Helper method to get Auth info
    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }
    private boolean checkAdmin(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
    }

    // ==========================================
    // ADD LABEL TO PROJECT
    // ==========================================
    @PostMapping("/api/projects/{projectId}/labels")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<?> addLabelToProject(
            @PathVariable Long projectId,
            @RequestBody LabelRequest request,
            Authentication auth) {
        try {
            LabelResponse response = labelService.addLabel(projectId, request, getUserId(auth), checkAdmin(auth));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // UPDATE LABEL
    // ==========================================
    @PutMapping("/api/labels/{labelId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<?> updateLabel(
            @PathVariable Long labelId,
            @RequestBody LabelRequest request,
            Authentication auth) {
        try {
            LabelResponse response = labelService.updateLabel(labelId, request, getUserId(auth), checkAdmin(auth));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // DELETE LABEL
    // ==========================================
    @DeleteMapping("/api/labels/{labelId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ResponseEntity<?> deleteLabel(
            @PathVariable Long labelId,
            Authentication auth) {
        try {
            labelService.deleteLabel(labelId, getUserId(auth), checkAdmin(auth));
            return ResponseEntity.ok("Đã xóa nhãn thành công! (Label deleted successfully!)");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}