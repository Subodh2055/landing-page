package com.ecommerce.landingpage.service;

import com.ecommerce.landingpage.dto.AuthRequest;
import com.ecommerce.landingpage.dto.AuthResponse;
import com.ecommerce.landingpage.dto.UserDto;
import com.ecommerce.landingpage.model.User;
import com.ecommerce.landingpage.model.RefreshToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RefreshTokenService refreshTokenService;
    
    public AuthResponse authenticate(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                authRequest.getUsernameOrEmail(),
                authRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        
        User user = userService.findByUsernameOrEmail(authRequest.getUsernameOrEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create refresh token
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        
        return new AuthResponse(
            token,
            refreshToken,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            LocalDateTime.now().plusHours(24)
        );
    }
    
    public String generateToken(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();
        
        return jwtService.generateToken(userDetails);
    }
    
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return new UserDto(user);
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        // Find the refresh token in database
        RefreshToken token = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
        
        // Verify the refresh token is not expired
        token = refreshTokenService.verifyExpiration(token);
        
        // Get the user from the refresh token
        User user = token.getUser();
        
        // Generate new access token
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();
        
        String newAccessToken = jwtService.generateToken(userDetails);
        
        // Generate new refresh token
        String newRefreshToken = refreshTokenService.createRefreshToken(user).getToken();
        
        return new AuthResponse(
            newAccessToken,
            newRefreshToken,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            LocalDateTime.now().plusHours(24)
        );
    }
}
