# Spring Boot E-commerce Backend

A comprehensive Spring Boot backend for the e-commerce landing page application built with Spring Boot 3.2.4, Spring Security, JWT authentication, and JPA/Hibernate.

## 🚀 Features

- **Spring Boot 3.2.4** - Latest stable version with Java 17
- **Spring Security** - JWT-based authentication and authorization
- **JPA/Hibernate** - Database persistence with H2 (development) and MySQL support
- **RESTful APIs** - Complete CRUD operations for products, users, and orders
- **Swagger/OpenAPI** - API documentation and testing interface
- **CORS Configuration** - Cross-origin resource sharing for Angular frontend
- **Actuator** - Application monitoring and health checks
- **Validation** - Input validation with Bean Validation
- **Auditing** - Automatic timestamp management for entities

## 🛠️ Technology Stack

- **Java 17**
- **Spring Boot 3.2.4**
- **Spring Security 6.x**
- **Spring Data JPA**
- **H2 Database** (Development)
- **MySQL** (Production ready)
- **JWT (JSON Web Tokens)**
- **Swagger/OpenAPI 3**
- **Maven**

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
cd backend
```

### 2. Build the Project
```bash
mvn clean install
```

### 3. Run the Application
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## 📚 API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/v3/api-docs`
- **H2 Console**: `http://localhost:8080/api/h2-console`

## 🔐 Authentication

The application uses JWT-based authentication with the following endpoints:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Example Login Request:
```json
{
  "usernameOrEmail": "user@example.com",
  "password": "password123"
}
```

### Example Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "user",
  "email": "user@example.com",
  "role": "USER",
  "expiresAt": "2024-01-01T12:00:00"
}
```

## 📦 Product Management

### Public Endpoints (No Authentication Required):
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/products/search` - Search products with filters
- `GET /api/products/categories` - Get all categories
- `GET /api/products/in-stock` - Get in-stock products
- `GET /api/products/top-rated` - Get top-rated products
- `GET /api/products/discounted` - Get discounted products

### Admin Endpoints (Requires ADMIN Role):
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Example Product Request:
```json
{
  "name": "Sample Product",
  "description": "A sample product description",
  "price": 29.99,
  "originalPrice": 39.99,
  "category": "Electronics",
  "image": "https://example.com/image.jpg",
  "stock": 100,
  "rating": 4.5,
  "reviews": 25,
  "role": "PUBLIC",
  "active": true
}
```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Encrypted)
- `role` (USER/ADMIN)
- `enabled` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### Products Table
- `id` (Primary Key)
- `name`
- `description`
- `price` (Decimal)
- `original_price` (Decimal)
- `category`
- `image`
- `stock` (Integer)
- `rating` (Decimal)
- `reviews` (Integer)
- `role` (PUBLIC/USER/ADMIN)
- `active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### Carts Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `subtotal`, `tax`, `shipping`, `total`, `discount` (Decimal)
- `discount_code`
- `created_at`, `updated_at` (Timestamps)

### Orders Table
- `id` (Primary Key)
- `order_number` (Unique)
- `user_id` (Foreign Key)
- `status` (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED/REFUNDED)
- `subtotal`, `tax`, `shipping`, `total`, `discount` (Decimal)
- `discount_code`
- `shipping_address`, `billing_address`
- `created_at`, `updated_at` (Timestamps)

## 🔧 Configuration

### Application Properties
The main configuration is in `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# CORS Configuration
cors.allowed-origins=*
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=*
cors.allow-credentials=true
cors.max-age=3600
```

### Production Configuration
For production, update the database configuration:

```properties
# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=your-username
spring.datasource.password=your-password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```

## 🧪 Testing

### Run Tests
```bash
mvn test
```

### Integration Tests
The project includes integration tests for:
- Authentication endpoints
- Product management
- User management
- Security configurations

## 📊 Monitoring

### Actuator Endpoints
- `GET /api/actuator/health` - Application health
- `GET /api/actuator/info` - Application information
- `GET /api/actuator/metrics` - Application metrics

## 🔒 Security

### JWT Token Structure
- **Header**: Algorithm (HS256)
- **Payload**: User information and expiration
- **Signature**: HMAC SHA256 signature

### Role-Based Access Control
- **PUBLIC**: Accessible to all users
- **USER**: Requires user authentication
- **ADMIN**: Requires admin role

### CORS Configuration
The application uses a flexible CORS configuration that can be easily customized:

#### Default Configuration (Allows all origins):
```properties
cors.allowed-origins=*
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=*
cors.allow-credentials=true
cors.max-age=3600
```

#### Custom Configuration Examples:

**For specific origins:**
```properties
cors.allowed-origins=http://localhost:4200,https://myapp.com,https://staging.myapp.com
```

**For development only:**
```properties
cors.allowed-origins=http://localhost:4200,http://localhost:3000
```

**For production with specific domains:**
```properties
cors.allowed-origins=https://myapp.com,https://www.myapp.com
```

The configuration supports:
- **Wildcard (*)**: Allows all origins (default)
- **Specific origins**: Comma-separated list of allowed origins
- **Pattern matching**: Uses Spring's origin pattern matching
- **Dynamic configuration**: Can be changed without code modifications

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/landing-page-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Build and Run with Docker
```bash
docker build -t landing-page-backend .
docker run -p 8080:8080 landing-page-backend
```

## 📝 API Examples

### Get All Products (Paginated)
```bash
curl -X GET "http://localhost:8080/api/products?page=0&size=10&sortBy=name&sortDir=asc"
```

### Search Products
```bash
curl -X GET "http://localhost:8080/api/products/search?category=Electronics&minPrice=10&maxPrice=100&searchTerm=laptop"
```

### Create Product (Admin Only)
```bash
curl -X POST "http://localhost:8080/api/products" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "category": "Electronics",
    "stock": 50
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/swagger-ui.html`
- Review the application logs for debugging

## 🔄 Version History

- **v1.0.0** - Initial release with basic CRUD operations
- **v1.1.0** - Added JWT authentication and security
- **v1.2.0** - Added cart and order management
- **v1.3.0** - Added search and filtering capabilities
