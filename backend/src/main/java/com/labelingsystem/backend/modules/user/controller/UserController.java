package com.labelingsystem.backend.modules.user.controller;

import com.labelingsystem.backend.common.response.ApiResponse;
import com.labelingsystem.backend.common.response.PageResponse;
import com.labelingsystem.backend.modules.user.dto.request.UserCreationDTO;
import com.labelingsystem.backend.modules.user.dto.request.UserUpdateDTO;
import com.labelingsystem.backend.modules.user.dto.response.UserResponseDTO;
import com.labelingsystem.backend.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    // TODO: Require ADMIN role
    // @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<UserResponseDTO> createUser(@RequestBody @Valid UserCreationDTO request) {
        return ApiResponse.success(userService.createUser(request));
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(userService.getAllUsers(page, size));
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<UserResponseDTO> getUser(@PathVariable Long id) {
        return ApiResponse.success(userService.getUser(id));
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<UserResponseDTO> updateUser(
            @PathVariable Long id, 
            @RequestBody @Valid UserUpdateDTO request) {
        return ApiResponse.success(userService.updateUser(id, request));
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("User deleted successfully.");
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/lock")
    public ApiResponse<String> lockUser(@PathVariable Long id) {
        userService.lockUser(id);
        return ApiResponse.success("User locked successfully.");
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/unlock")
    public ApiResponse<String> unlockUser(@PathVariable Long id) {
        userService.unlockUser(id);
        return ApiResponse.success("User unlocked successfully.");
    }
}
