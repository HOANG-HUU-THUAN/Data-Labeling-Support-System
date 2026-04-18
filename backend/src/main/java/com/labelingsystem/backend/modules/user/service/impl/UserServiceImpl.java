package com.labelingsystem.backend.modules.user.service.impl;

import com.labelingsystem.backend.common.enums.ErrorCode;
import com.labelingsystem.backend.common.exception.CustomAppException;
import com.labelingsystem.backend.common.exception.ResourceNotFoundException;
import com.labelingsystem.backend.common.response.PageResponse;
import com.labelingsystem.backend.modules.audit.aspect.AuditAction;
import com.labelingsystem.backend.modules.user.dto.request.AssignRolesDTO;
import com.labelingsystem.backend.modules.user.dto.request.UserCreationDTO;
import com.labelingsystem.backend.modules.user.dto.request.UserUpdateDTO;
import com.labelingsystem.backend.modules.user.dto.response.UserResponseDTO;
import com.labelingsystem.backend.modules.user.entity.Role;
import com.labelingsystem.backend.modules.user.entity.User;
import com.labelingsystem.backend.modules.user.mapper.UserMapper;
import com.labelingsystem.backend.modules.user.repository.RoleRepository;
import com.labelingsystem.backend.modules.user.repository.UserRepository;
import com.labelingsystem.backend.modules.user.service.UserService;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    @AuditAction("CREATE_USER")
    public UserResponseDTO createUser(UserCreationDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomAppException(ErrorCode.USER_EXISTED);
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new CustomAppException(ErrorCode.EMAIL_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus("ACTIVE");
        
        // Assign default role (e.g., ANNOTATOR)
        Optional<Role> defaultRole = roleRepository.findByName("ROLE_ANNOTATOR");
        if (defaultRole.isPresent()) {
            Set<Role> roles = new HashSet<>();
            roles.add(defaultRole.get());
            user.setRoles(roles);
        }

        user = userRepository.save(user);
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    @Transactional
    @AuditAction("UPDATE_USER")
    public UserResponseDTO updateUser(Long id, UserUpdateDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomAppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) 
            && userRepository.existsByEmail(request.getEmail())) {
            throw new CustomAppException(ErrorCode.EMAIL_EXISTED);
        }

        userMapper.updateUserFromDTO(request, user);
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    @Transactional
    @AuditAction("DELETE_USER")
    public void deleteUser(Long id) {
        // Soft delete
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomAppException(ErrorCode.USER_NOT_EXISTED));
        user.setDeleted(true);
        userRepository.save(user);
    }

    @Override
    public UserResponseDTO getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    public PageResponse<UserResponseDTO> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> usersPage = userRepository.findAll(pageable);
        
        List<UserResponseDTO> dtoList = usersPage.getContent().stream()
                .map(userMapper::toUserResponseDTO)
                .collect(Collectors.toList());

        return PageResponse.<UserResponseDTO>builder()
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .last(usersPage.isLast())
                .data(dtoList)
                .build();
    }

    @Override
    @Transactional
    @AuditAction("LOCK_USER")
    public void lockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomAppException(ErrorCode.USER_NOT_EXISTED));
        user.setStatus("LOCKED");
        userRepository.save(user);
    }

    @Override
    @Transactional
    @AuditAction("UNLOCK_USER")
    public void unlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomAppException(ErrorCode.USER_NOT_EXISTED));
        user.setStatus("ACTIVE");
        userRepository.save(user);
    }

    @Override
    public List<UserResponseDTO> getUsersByRole(String roleName) {
        return userRepository.findByRoles_Name(roleName).stream()
                .map(userMapper::toUserResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @AuditAction("ASSIGN_ROLES")
    public UserResponseDTO assignRoles(Long id, AssignRolesDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomAppException(ErrorCode.USER_NOT_EXISTED));

        Set<Role> newRoles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new CustomAppException(ErrorCode.ROLE_NOT_FOUND)))
                .collect(Collectors.toSet());

        user.setRoles(newRoles);
        user = userRepository.save(user);
        return userMapper.toUserResponseDTO(user);
    }
}
