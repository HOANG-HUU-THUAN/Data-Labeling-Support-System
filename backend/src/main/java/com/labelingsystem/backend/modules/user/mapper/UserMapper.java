package com.labelingsystem.backend.modules.user.mapper;

import com.labelingsystem.backend.modules.user.dto.request.UserCreationDTO;
import com.labelingsystem.backend.modules.user.dto.request.UserUpdateDTO;
import com.labelingsystem.backend.modules.user.dto.response.UserResponseDTO;
import com.labelingsystem.backend.modules.user.entity.Role;
import com.labelingsystem.backend.modules.user.entity.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toUser(UserCreationDTO request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateUserFromDTO(UserUpdateDTO request, @MappingTarget User user);

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRoles")
    UserResponseDTO toUserResponseDTO(User user);

    @Named("mapRoles")
    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}
