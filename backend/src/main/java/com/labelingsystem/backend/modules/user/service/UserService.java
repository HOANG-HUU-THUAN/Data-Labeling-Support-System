package com.labelingsystem.backend.modules.user.service;

import com.labelingsystem.backend.common.response.PageResponse;
import com.labelingsystem.backend.modules.user.dto.request.AssignRolesDTO;
import com.labelingsystem.backend.modules.user.dto.request.UserCreationDTO;
import com.labelingsystem.backend.modules.user.dto.request.UserUpdateDTO;
import com.labelingsystem.backend.modules.user.dto.response.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO createUser(UserCreationDTO request);

    UserResponseDTO updateUser(Long id, UserUpdateDTO request);

    void deleteUser(Long id);

    UserResponseDTO getUser(Long id);

    PageResponse<UserResponseDTO> getAllUsers(int page, int size);

    void lockUser(Long id);

    void unlockUser(Long id);

    List<UserResponseDTO> getUsersByRole(String roleName);

    UserResponseDTO assignRoles(Long id, AssignRolesDTO request);
}
