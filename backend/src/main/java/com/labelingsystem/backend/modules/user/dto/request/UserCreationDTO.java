package com.labelingsystem.backend.modules.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationDTO {

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, message = "USERNAME_INVALID")
    String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String password;

    @Email(message = "Valid email is required")
    String email;
}
