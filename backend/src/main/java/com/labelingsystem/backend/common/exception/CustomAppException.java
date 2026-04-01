package com.labelingsystem.backend.common.exception;

import com.labelingsystem.backend.common.enums.ErrorCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomAppException extends RuntimeException {
    private final ErrorCode errorCode;

    public CustomAppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
