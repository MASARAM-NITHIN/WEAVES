package com.sreepadmavathi.saree.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; ")
        );
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", errors.toString(), request);
    }

    @ExceptionHandler({NoSuchElementException.class, RuntimeException.class})
    public ResponseEntity<Object> handleNotFoundAndRuntime(Exception ex, WebRequest request) {
        // Since we threw raw RuntimeExceptions for not found in services, we try to interpret them
        if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
        } else if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("insufficient stock")) {
            return buildErrorResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
        } else if (ex.getMessage() != null && ex.getMessage().contains("already exists")) {
            return buildErrorResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
        }
        
        // If it's a generic RuntimeException not matching known patterns, log it and return 500
        logger.error("Unexpected RuntimeException: ", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred", request);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, ResourceInUseException.class})
    public ResponseEntity<Object> handleConflict(Exception ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Forbidden", "You do not have permission to access this resource", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllOtherExceptions(Exception ex, WebRequest request) {
        // Silently ignore harmless "Broken pipe" errors caused by clients aborting connections (common with fast UI navigation)
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (ex.getClass().getName().contains("ClientAbortException") || 
            (ex.getCause() != null && ex.getCause().getClass().getName().contains("ClientAbortException")) ||
            msg.contains("broken pipe")) {
            return null; // Don't log and don't respond, client is already gone
        }

        logger.error("Unhandled exception caught: ", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred", request);
    }

    private ResponseEntity<Object> buildErrorResponse(HttpStatus status, String error, String message, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        body.put("path", ((ServletWebRequest) request).getRequest().getRequestURI());

        return new ResponseEntity<>(body, status);
    }
}
