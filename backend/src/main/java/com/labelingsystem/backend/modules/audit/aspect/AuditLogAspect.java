package com.labelingsystem.backend.modules.audit.aspect;

import com.labelingsystem.backend.modules.audit.service.AuditLogService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuditLogAspect {

    AuditLogService auditLogService;

    @AfterReturning(pointcut = "@annotation(auditAction)", returning = "result")
    public void logAuditAction(JoinPoint joinPoint, AuditAction auditAction, Object result) {
        String action = auditAction.value();
        if (action.isEmpty()) {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            action = signature.getMethod().getName();
        }

        String details = "Args: " + Arrays.toString(joinPoint.getArgs());
        
        auditLogService.log(action, details);
    }
}
