package com.labelingsystem.backend.modules.annotation.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AnnotationItemRequest {
    @NotNull(message = "Label ID cannot be null")
    Long labelId;

    @NotNull(message = "Type cannot be null")
    String type;

    @NotNull(message = "Coordinates cannot be null")
    JsonNode coordinates;
}

