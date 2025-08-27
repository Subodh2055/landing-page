package com.ecommerce.landingpage.controller;

import com.ecommerce.landingpage.dto.AuthRequest;
import com.ecommerce.landingpage.dto.AuthResponse;
import com.ecommerce.landingpage.dto.RefreshTokenRequest;
import com.ecommerce.landingpage.dto.UserDto;
import com.ecommerce.landingpage.model.User;
import com.ecommerce.landingpage.service.AuthService;
import com.ecommerce.landingpage.service.UserService;
import com.ecommerce.landingpage.service.OAuth2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private OAuth2Service oauth2Service;
    
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserDto userDto) {
        UserDto createdUser = userService.createUser(userDto);
        User user = userService.findByUsername(createdUser.getUsername()).orElse(null);
        
        if (user != null) {
            String token = authService.generateToken(user);
            // For registration, we don't create a refresh token initially
            AuthResponse response = new AuthResponse(
                token,
                null, // No refresh token for registration
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                LocalDateTime.now().plusHours(24)
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
    
    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user and returns JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            AuthResponse response = authService.authenticate(authRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns current authenticated user information")
    public ResponseEntity<UserDto> getCurrentUser() {
        try {
            UserDto currentUser = authService.getCurrentUser();
            return ResponseEntity.ok(currentUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refreshes the JWT token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
    @GetMapping("/oauth2/providers")
    @Operation(summary = "Get OAuth2 providers", description = "Returns available OAuth2 providers")
    public ResponseEntity<Object> getOAuth2Providers() {
        return ResponseEntity.ok(Map.of(
            "providers", Arrays.asList(
                Map.of("name", "google", "url", "/api/auth/oauth2/authorization/google"),
                Map.of("name", "github", "url", "/api/auth/oauth2/authorization/github")
            )
        ));
    }
    
    @GetMapping("/oauth2/authorization/{provider}")
    @Operation(summary = "OAuth2 authorization", description = "Initiates OAuth2 authorization flow")
    public ResponseEntity<Void> oauth2Authorization(@PathVariable String provider) {
        // This will be handled by Spring Security OAuth2
        return ResponseEntity.ok().build();
    }
}
