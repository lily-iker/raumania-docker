package com.fragrance.raumania.service.implement;

import com.fragrance.raumania.constant.role.RoleName;
import com.fragrance.raumania.constant.token.TokenType;
import com.fragrance.raumania.dto.request.auth.ForgotPasswordRequest;
import com.fragrance.raumania.dto.request.auth.LoginRequest;
import com.fragrance.raumania.dto.request.auth.RegisterRequest;
import com.fragrance.raumania.dto.request.auth.ResetPasswordRequest;
import com.fragrance.raumania.dto.response.auth.ResetPasswordResponse;
import com.fragrance.raumania.dto.response.token.TokenResponse;
import com.fragrance.raumania.exception.DataInUseException;
import com.fragrance.raumania.exception.InvalidDataException;
import com.fragrance.raumania.exception.ResourceNotFoundException;
import com.fragrance.raumania.model.authorization.Role;
import com.fragrance.raumania.model.cart.Cart;
import com.fragrance.raumania.model.user.User;
import com.fragrance.raumania.repository.CartRepository;
import com.fragrance.raumania.repository.RoleRepository;
import com.fragrance.raumania.repository.UserRepository;
import com.fragrance.raumania.service.JwtService;
import com.fragrance.raumania.service.interfaces.AuthenticationService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.Duration;
import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    @Value("${frontend.url}")
    private String frontendUrl;

    private static final int ACCESS_TOKEN_COOKIE_EXPIRATION = 60 * 10; // 10 minutes expiration
    private static final int REFRESH_TOKEN_COOKIE_EXPIRATION = 60 * 60 * 24 * 14; // 14 days expiration
    private static final String RESET_PASSWORD_PREFIX = "reset-password-";

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final JavaMailSender mailSender;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CartRepository cartRepository;


    @Override
    public TokenResponse login(LoginRequest loginRequest, HttpServletResponse response) {
        // Call the custom UserDetailsService.loadUserByUsername(String input) method
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(),
                loginRequest.getPassword()));

        User user = userRepository.findByUsernameOrEmail(loginRequest.getIdentifier())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with username or email: " + loginRequest.getIdentifier()));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Cookie accessTokenCookie = createAccessTokenCookie(accessToken);
        Cookie refreshTokenCookie = createRefreshTokenCookie(refreshToken);

        // Add the cookies to the response
        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    @Override
    public TokenResponse register(RegisterRequest registerRequest, HttpServletResponse response) {

        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new DataInUseException("Username is already in use");
        }

        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new DataInUseException("Email is already in use");
        }

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Role 'USER' not found"));

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .isActive(true)
                .role(userRole)
                .build();

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Cookie accessTokenCookie = createAccessTokenCookie(accessToken);
        Cookie refreshTokenCookie = createRefreshTokenCookie(refreshToken);

        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);

        Cart cart = Cart.builder()
                .user(user)
                .build();
        cartRepository.save(cart);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie accessTokenCookie = new Cookie("accessToken", "");
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setAttribute("SameSite", "Strict");
        accessTokenCookie.setMaxAge(0);

        Cookie refreshTokenCookie = new Cookie("refreshToken", "");
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setAttribute("SameSite", "Strict");
        refreshTokenCookie.setMaxAge(0);

        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);

        SecurityContextHolder.clearContext();
    }

    @Override
    public TokenResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = "";
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            refreshToken = Arrays.stream(cookies)
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse("");
        }

        if (refreshToken.isBlank()) {
            throw new InvalidDataException("Token can not be blank");
        }

        final String username = jwtService.extractUsername(refreshToken, TokenType.REFRESH_TOKEN);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username not found"));

        if (!jwtService.isValidToken(refreshToken, TokenType.REFRESH_TOKEN, user)) {
            throw new InvalidDataException("Invalid Token");
        }

        String accessToken = jwtService.generateAccessToken(user);
        Cookie accessTokenCookie = createAccessTokenCookie(accessToken);

        response.addCookie(accessTokenCookie);

        SecurityContextHolder.clearContext();

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    @Override
    public User getAuthenticatedUser() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return  (User) securityContext.getAuthentication().getPrincipal();
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request, HttpServletRequest servletRequest)
            throws MessagingException, UnsupportedEncodingException {
        String email = request.getEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String emailResetKey = RESET_PASSWORD_PREFIX + email;
        if (redisTemplate.hasKey(emailResetKey)) {
            redisTemplate.delete(emailResetKey);
        }
        String token = UUID.randomUUID().toString();

        redisTemplate.opsForValue().set(emailResetKey, token, Duration.ofMinutes(5));

        String resetPasswordLink = frontendUrl + "/reset-password?email=" + email + "&token=" + token;
        sendResetPasswordEmail(email, resetPasswordLink);

        return "We have sent a reset password link to your email. Please check your mail.";

    }

    @Override
    public String resetPassword(ResetPasswordRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new InvalidDataException("Passwords do not match");
        }

        String requestToken = request.getToken();
        String email = request.getEmail();

        String emailResetKey = RESET_PASSWORD_PREFIX + email;
        String cachedToken = (String) redisTemplate.opsForValue().get(emailResetKey);

        if (!requestToken.equals(cachedToken)) {
            throw new InvalidDataException("Invalid or expired token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // Invalidate the token in Redis
        redisTemplate.delete(emailResetKey);

        return "You have successfully changed your password.";
    }

    private void sendResetPasswordEmail(String recipientEmail, String link)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("contact@gmail.com", "RAUMANIA FRAGRANCE");
        helper.setTo(recipientEmail);

        User user = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + recipientEmail));
        String username = user.getUsername();

        String subject = "Here's the link to reset your password";

        String content = buildContent(username, link);

        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }

    private Cookie createAccessTokenCookie(String accessToken) {
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setAttribute("SameSite", "Strict");
        accessTokenCookie.setMaxAge(ACCESS_TOKEN_COOKIE_EXPIRATION);

        return accessTokenCookie;
    }

    private Cookie createRefreshTokenCookie(String refreshToken) {
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setAttribute("SameSite", "Strict");
        refreshTokenCookie.setMaxAge(REFRESH_TOKEN_COOKIE_EXPIRATION);

        return refreshTokenCookie;
    }

    private String buildContent(String username, String link) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>" +
                "<style>" +
                "body { margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif; }" +
                "table { border-spacing:0; }" +
                ".container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; }" +
                ".header { padding:20px; text-align:left; }" +
                ".header img { height:40px; }" +
                ".content { padding:30px 20px; color:#333333; }" +
                ".content h1 { font-size:20px; margin:0 0 15px; font-weight:normal; color:#333333; }" +
                ".content p { font-size:16px; line-height:1.5; margin:0 0 15px; }" +
                ".button-container { text-align:center; margin:20px 0; }" +
                ".button {\n" +
                "    background-color: #007bff !important;\n" +
                "    color: #ffffff !important;\n" +
                "    text-decoration: none !important;\n" +
                "    padding: 16px 24px !important;\n" +
                "    border-radius: 4px !important;\n" +
                "    display: inline-block !important;\n" +
                "    font-size: 16px !important;\n" +
                "}" +
                ".footer { padding:20px; text-align:center; font-size:12px; color:#888888; background-color:#f4f6f8; }" +
                ".footer a {text-decoration:none; }" +
                "</style>" +
                "</head>" +
                "<body>" +

                // outer wrapper
                "<table width=\"100%\" bgcolor=\"#f4f6f8\">" +
                "<tr><td align=\"center\">" +

                // main container
                "<table class=\"container\" bgcolor=\"#ffffff\">" +

                // header with logo
                "<tr>" +
                "<td class=\"header\">" +
                "<img src=\"https://yourdomain.com/assets/logo.png\" alt=\"Your Company Logo\"/>" +
                "</td>" +
                "</tr>" +

                // body content
                "<tr>" +
                "<td class=\"content\">" +
                "<h1>Hello, " + username + "</h1>" +
                "<p>You have requested to reset your password. Click the button below to proceed:</p>" +

                // button
                "<div class=\"button-container\">" +
                "<a href=\"" + link + "\" class=\"button\">Reset Password</a>" +
                "</div>" +

                "<p>If you did not make this request, you can safely ignore this email or <a href=\"mailto:support@yourdomain.com\">contact support</a> if you have questions.</p>" +
                "</td>" +
                "</tr>" +

                // optional footer note
                "<tr>" +
                "<td class=\"footer\">" +
                "© 2025 Your Company, Inc. All rights reserved.<br/>" +
                "<a href=\"https://yourdomain.com/blog\">Blog</a> • " +
                "<a href=\"https://twitter.com/yourcompany\">Twitter</a> • " +
                "<a href=\"https://facebook.com/yourcompany\">Facebook</a>" +
                "</td>" +
                "</tr>" +

                "</table>" +

                "</td></tr>" +
                "</table>" +

                "</body>" +
                "</html>";
    }
}
