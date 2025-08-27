package com.ecommerce.landingpage.service;

import com.ecommerce.landingpage.dto.AuthResponse;
import com.ecommerce.landingpage.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2Service {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private RefreshTokenService refreshTokenService;
    
    public AuthResponse processOAuth2Login(Authentication authentication) {
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = oauth2Token.getPrincipal();
            
            String provider = oauth2Token.getAuthorizedClientRegistrationId();
            Map<String, Object> attributes = oauth2User.getAttributes();
            
            // Extract user information based on provider
            User user = extractUserFromOAuth2(provider, attributes);
            
            // Save or update user in database
            User savedUser = saveOrUpdateUser(user);
            
                               // Generate JWT token
                   UserDetails userDetails = org.springframework.security.core.userdetails.User
                           .withUsername(savedUser.getUsername())
                           .password(savedUser.getPassword())
                           .authorities(savedUser.getRole().name())
                           .build();
                   String token = jwtService.generateToken(userDetails);
                   
                   // Generate refresh token
                   String refreshToken = refreshTokenService.createRefreshToken(savedUser).getToken();
                   
                   return new AuthResponse(
                       token,
                       refreshToken,
                       savedUser.getId(),
                       savedUser.getUsername(),
                       savedUser.getEmail(),
                       savedUser.getRole().name(),
                       LocalDateTime.now().plusHours(24)
                   );
        }
        
        throw new RuntimeException("Invalid OAuth2 authentication");
    }
    
    private User extractUserFromOAuth2(String provider, Map<String, Object> attributes) {
        User user = new User();
        
        switch (provider.toLowerCase()) {
            case "google":
                user.setEmail((String) attributes.get("email"));
                user.setUsername((String) attributes.get("name"));
                user.setRole(User.Role.USER);
                break;
                
            case "github":
                user.setEmail((String) attributes.get("email"));
                user.setUsername((String) attributes.get("login"));
                user.setRole(User.Role.USER);
                break;
                
            default:
                throw new RuntimeException("Unsupported OAuth2 provider: " + provider);
        }
        
        return user;
    }
    
    private User saveOrUpdateUser(User oauth2User) {
        Optional<User> existingUser = userService.findByEmail(oauth2User.getEmail());
        
        if (existingUser.isPresent()) {
            // Update existing user
            User user = existingUser.get();
            user.setUsername(oauth2User.getUsername());
            user.setUpdatedAt(LocalDateTime.now());
            return userService.updateUserEntity(user);
        } else {
            // Create new user
            oauth2User.setEnabled(true);
            oauth2User.setPassword("OAUTH2_USER"); // Set a placeholder password
            return userService.createUserEntity(oauth2User);
        }
    }
}
