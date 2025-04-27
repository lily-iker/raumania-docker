package com.fragrance.raumania.exception.handler;

import com.fragrance.raumania.dto.response.ApiErrorResponse;
import com.fragrance.raumania.exception.DataInUseException;
import com.fragrance.raumania.exception.InvalidDataException;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.Date;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ApiErrorResponse createApiErrorResponse(HttpStatus status, String message, WebRequest request) {
        return ApiErrorResponse.builder()
                .timestamp(new Date())
                .status(status.value())
                .error(status.getReasonPhrase())
                .path(request.getDescription(false).replace("uri=", ""))
                .message(message)
                .build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleMethodArgumentNotValidException(MethodArgumentNotValidException e, WebRequest request) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return createApiErrorResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(IOException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleIOException(IOException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleIllegalArgumentException(IllegalArgumentException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiErrorResponse handleBadCredentialsException(BadCredentialsException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.UNAUTHORIZED, e.getMessage(), request);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleUsernameNotFoundException(UsernameNotFoundException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.NOT_FOUND, e.getMessage(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleResourceNotFoundException(ResourceNotFoundException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.NOT_FOUND, e.getMessage(), request);
    }

    @ExceptionHandler(InvalidDataException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleInvalidDataException(InvalidDataException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(DataInUseException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleDataInUseException(DataInUseException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.CONFLICT, e.getMessage(), request);
    }

    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleSQLIntegrityConstraintViolationException(SQLIntegrityConstraintViolationException e,
                                                                        WebRequest request) {
        return createApiErrorResponse(HttpStatus.CONFLICT, "Database constraint violation", request);
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleIllegalStateException(IllegalStateException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(UnsupportedEncodingException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleUnsupportedEncodingException(UnsupportedEncodingException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(MessagingException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponse handleMessagingException(MessagingException e, WebRequest request) {
        return createApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleHttpMessageNotReadableException(HttpMessageNotReadableException e,
                                                               WebRequest request) {
        String message;
        if (e.getMessage().contains("Gender")) message = "Gender can only be: male, female, other";
        else if (e.getMessage().contains("Role")) message = "Invalid Role";
        else if (e.getMessage().contains("Permission")) message = "Invalid Permission";
        else {
            // Optional: if more enum required
            message = e.getMessage();
        }

        return createApiErrorResponse(HttpStatus.BAD_REQUEST, message, request);
    }

//    @ExceptionHandler(Exception.class)
//    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
//    public ApiErrorResponse handleException(Exception e, WebRequest request) {
//        if (e.getCause() == null) {
//            return createApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), request);
//        }
//        return createApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getCause().getMessage(), request);
//    }

}

