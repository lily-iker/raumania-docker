package com.fragrance.raumania.controller;


import com.fragrance.raumania.dto.request.auth.ForgotPasswordRequest;
import com.fragrance.raumania.dto.request.auth.LoginRequest;
import com.fragrance.raumania.dto.request.auth.RegisterRequest;
import com.fragrance.raumania.dto.request.auth.ResetPasswordRequest;
import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.service.interfaces.AuthenticationService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   @NonNull HttpServletResponse response) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Login success",
                        authenticationService.login(loginRequest, response))
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest,
                                      @NonNull HttpServletResponse response) {
        return ResponseEntity.ok(
                new ApiResponse<>(201,
                        "Registration successful",
                        authenticationService.register(registerRequest, response))
        );
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(@NonNull HttpServletRequest request,
                                      @NonNull HttpServletResponse response) {
        authenticationService.logout(request, response);
        return new ApiResponse<>(200,
                "Logout success");
    }

    @PostMapping("/refresh")
    public ApiResponse<?> refresh(@NonNull HttpServletRequest request,
                                  @NonNull HttpServletResponse response) {
        return new ApiResponse<>(200,
                "Refresh token success",
                authenticationService.refresh(request, response));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
                                                          HttpServletRequest servletRequest) throws MessagingException, UnsupportedEncodingException {
        return new  ApiResponse<>(200,
                "Forgot password success",
                authenticationService.forgotPassword(request, servletRequest)) ;
    }

    @PostMapping("/reset-password")
    public ApiResponse<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return new  ApiResponse<>(200,
                "Reset password success",
                authenticationService.resetPassword(request)) ;
    }
}
