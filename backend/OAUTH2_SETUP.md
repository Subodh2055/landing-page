# OAuth2 Setup Guide

This guide will help you set up OAuth2 authentication with Google and GitHub providers for your Spring Boot backend.

## 🚀 Quick Setup

### 1. Google OAuth2 Setup

#### Step 1: Create Google OAuth2 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set the application type to "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:8080/api/auth/oauth2/callback/google` (for development)
   - `https://yourdomain.com/api/auth/oauth2/callback/google` (for production)
8. Copy the Client ID and Client Secret

#### Step 2: Configure Environment Variables
```bash
# Development
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret

# Or add to application.properties
spring.security.oauth2.client.registration.google.client-id=your-google-client-id
spring.security.oauth2.client.registration.google.client-secret=your-google-client-secret
```

### 2. GitHub OAuth2 Setup

#### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your App Name
   - **Homepage URL**: `http://localhost:4200` (for development)
   - **Authorization callback URL**: `http://localhost:8080/api/auth/oauth2/callback/github`
4. Click "Register application"
5. Copy the Client ID and Client Secret

#### Step 2: Configure Environment Variables
```bash
# Development
export GITHUB_CLIENT_ID=your-github-client-id
export GITHUB_CLIENT_SECRET=your-github-client-secret

# Or add to application.properties
spring.security.oauth2.client.registration.github.client-id=your-github-client-id
spring.security.oauth2.client.registration.github.client-secret=your-github-client-secret
```

## 🔧 Configuration

### Application Properties
```properties
# OIDC Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:your-google-client-id}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:your-google-client-secret}
spring.security.oauth2.client.registration.google.scope=openid,email,profile
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/api/auth/oauth2/callback/google

spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID:your-github-client-id}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET:your-github-client-secret}
spring.security.oauth2.client.registration.github.scope=read:user,user:email
spring.security.oauth2.client.registration.github.redirect-uri={baseUrl}/api/auth/oauth2/callback/github

# OAuth2 Provider Configuration
spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/auth
spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token
spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo
spring.security.oauth2.client.provider.google.user-name-attribute=sub

spring.security.oauth2.client.provider.github.authorization-uri=https://github.com/login/oauth/authorize
spring.security.oauth2.client.provider.github.token-uri=https://github.com/login/oauth/access_token
spring.security.oauth2.client.provider.github.user-info-uri=https://api.github.com/user
spring.security.oauth2.client.provider.github.user-name-attribute=login
```

## 🌐 Frontend Integration

### Angular Service Methods
```typescript
// OAuth2 Methods
getOAuth2Providers(): Observable<any> {
  return this.http.get(`${this.apiUrl}/auth/oauth2/providers`);
}

loginWithGoogle(): void {
  this.initiateOAuth2Login('google');
}

loginWithGitHub(): void {
  this.initiateOAuth2Login('github');
}

private initiateOAuth2Login(provider: string): void {
  const authUrl = `${this.apiUrl}/auth/oauth2/authorization/${provider}`;
  window.location.href = authUrl;
}
```

### HTML Template
```html
<!-- OAuth2 Login Section -->
<div class="oauth2-section">
  <div class="divider">
    <span>or continue with</span>
  </div>
  
  <div class="oauth2-buttons">
    <button type="button" class="oauth2-button google" (click)="loginWithGoogle()">
      <i class="fab fa-google"></i>
      <span>Continue with Google</span>
    </button>
    
    <button type="button" class="oauth2-button github" (click)="loginWithGitHub()">
      <i class="fab fa-github"></i>
      <span>Continue with GitHub</span>
    </button>
  </div>
</div>
```

## 🔄 OAuth2 Flow

1. **User clicks OAuth2 button** → Frontend redirects to backend OAuth2 endpoint
2. **Backend redirects to provider** → Google/GitHub authorization page
3. **User authorizes** → Provider redirects back to backend callback URL
4. **Backend processes callback** → Extracts user info and creates/updates user
5. **Backend returns JWT token** → Frontend receives token and logs user in

## 📋 API Endpoints

### OAuth2 Endpoints
- `GET /api/auth/oauth2/providers` - Get available OAuth2 providers
- `GET /api/auth/oauth2/authorization/{provider}` - Initiate OAuth2 flow
- `GET /api/auth/oauth2/callback/{provider}` - OAuth2 callback (handled by Spring Security)

### Authentication Endpoints
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

## 🛡️ Security Features

- **JWT Tokens**: Secure token-based authentication
- **CORS Configuration**: Flexible cross-origin settings
- **Role-Based Access**: User and Admin roles
- **OAuth2 Integration**: Google and GitHub providers
- **Automatic User Creation**: Users created automatically on first OAuth2 login

## 🚀 Deployment

### Environment Variables for Production
```bash
# Production Environment Variables
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
```

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/landing-page-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🔍 Testing

### Test OAuth2 Flow
1. Start the backend application
2. Navigate to the login page
3. Click "Continue with Google" or "Continue with GitHub"
4. Complete the OAuth2 authorization
5. Verify you're redirected back and logged in

### Test API Endpoints
```bash
# Get OAuth2 providers
curl -X GET "http://localhost:8080/api/auth/oauth2/providers"

# Test protected endpoint
curl -X GET "http://localhost:8080/api/products" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure the redirect URI in your OAuth2 app matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **CORS Issues**
   - Verify CORS configuration allows your frontend domain
   - Check browser console for CORS errors

3. **Invalid Client ID/Secret**
   - Double-check your OAuth2 credentials
   - Ensure environment variables are set correctly

4. **User Not Created**
   - Check database connection
   - Verify OAuth2 user info extraction logic

### Debug Mode
```properties
# Enable debug logging
logging.level.com.ecommerce.landingpage=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.security.oauth2=DEBUG
```

## 📚 Additional Resources

- [Spring Security OAuth2 Documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth2 Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [JWT.io](https://jwt.io/) - JWT token debugger

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review application logs for error details
3. Verify OAuth2 provider configuration
4. Test with a simple OAuth2 flow first
