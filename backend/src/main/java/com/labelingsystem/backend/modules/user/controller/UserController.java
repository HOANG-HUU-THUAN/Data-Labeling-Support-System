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
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;


     
    @PostMapping
    public ApiResponse<UserResponseDTO> createUser(@RequestBody @Valid UserCreationDTO request) {
        return ApiResponse.success(userService.createUser(request));
    }

     
    @GetMapping
    public ApiResponse<PageResponse<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(userService.getAllUsers(page, size));
    }

     
    @GetMapping("/{id}")
    public ApiResponse<UserResponseDTO> getUser(@PathVariable Long id) {
        return ApiResponse.success(userService.getUser(id));
    }

     
    @PutMapping("/{id}")
    public ApiResponse<UserResponseDTO> updateUser(
            @PathVariable Long id, 
            @RequestBody @Valid UserUpdateDTO request) {
        return ApiResponse.success(userService.updateUser(id, request));
    }

     
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("User deleted successfully.");
    }

     
    @PatchMapping("/{id}/lock")
    public ApiResponse<String> lockUser(@PathVariable Long id) {
        userService.lockUser(id);
        return ApiResponse.success("User locked successfully.");
    }

     
    @PatchMapping("/{id}/unlock")
    public ApiResponse<String> unlockUser(@PathVariable Long id) {
        userService.unlockUser(id);
        return ApiResponse.success("User unlocked successfully.");
    }
}
