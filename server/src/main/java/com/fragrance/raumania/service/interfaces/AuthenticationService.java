package com.fragrance.raumania.service.interfaces;

import com.fragrance.raumania.dto.request.auth.ForgotPasswordRequest;
import com.fragrance.raumania.dto.request.auth.LoginRequest;
import com.fragrance.raumania.dto.request.auth.RegisterRequest;
import com.fragrance.raumania.dto.request.auth.ResetPasswordRequest;
import com.fragrance.raumania.dto.response.auth.ResetPasswordResponse;
import com.fragrance.raumania.dto.response.token.TokenResponse;
import com.fragrance.raumania.model.user.User;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.UnsupportedEncodingException;

public interface AuthenticationService {

    TokenResponse login(LoginRequest loginRequest, HttpServletResponse response);

    TokenResponse register(RegisterRequest registerRequest, HttpServletResponse response);

    void logout(HttpServletRequest request, HttpServletResponse response);

    TokenResponse refresh(HttpServletRequest request, HttpServletResponse response);

    String forgotPassword(ForgotPasswordRequest request, HttpServletRequest servletRequest) throws MessagingException, UnsupportedEncodingException;
    String resetPassword(ResetPasswordRequest request);


    User getAuthenticatedUser();
}
