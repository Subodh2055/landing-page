package com.ecommerce.landingpage.service;

import com.ecommerce.landingpage.model.Product;
import com.ecommerce.landingpage.model.User;
import com.ecommerce.landingpage.repository.ProductRepository;
import com.ecommerce.landingpage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataInitializerService implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeProducts();
    }
    
    private void initializeUsers() {
        if (userRepository.count() == 0) {
            // Create admin user
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            
            // Create regular user
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@example.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(User.Role.USER);
            user.setEnabled(true);
            userRepository.save(user);
            
            System.out.println("Users initialized successfully!");
        }
    }
    
    private void initializeProducts() {
        if (productRepository.count() == 0) {
            // Electronics
            Product laptop = new Product();
            laptop.setName("MacBook Pro 13-inch");
            laptop.setDescription("Apple MacBook Pro with M2 chip, 8GB RAM, 256GB SSD");
            laptop.setPrice(new BigDecimal("1299.99"));
            laptop.setOriginalPrice(new BigDecimal("1499.99"));
            laptop.setCategory("Electronics");
            laptop.setImage("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500");
            laptop.setStock(50);
            laptop.setRating(new BigDecimal("4.8"));
            laptop.setReviews(125);
            laptop.setRole(Product.ProductRole.PUBLIC);
            laptop.setActive(true);
            productRepository.save(laptop);
            
            Product smartphone = new Product();
            smartphone.setName("iPhone 15 Pro");
            smartphone.setDescription("Latest iPhone with A17 Pro chip, 48MP camera, titanium design");
            smartphone.setPrice(new BigDecimal("999.99"));
            smartphone.setCategory("Electronics");
            smartphone.setImage("https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500");
            smartphone.setStock(100);
            smartphone.setRating(new BigDecimal("4.9"));
            smartphone.setReviews(89);
            smartphone.setRole(Product.ProductRole.PUBLIC);
            smartphone.setActive(true);
            productRepository.save(smartphone);
            
            // Clothing
            Product tshirt = new Product();
            tshirt.setName("Premium Cotton T-Shirt");
            tshirt.setDescription("100% organic cotton t-shirt, comfortable and breathable");
            tshirt.setPrice(new BigDecimal("29.99"));
            tshirt.setOriginalPrice(new BigDecimal("39.99"));
            tshirt.setCategory("Clothing");
            tshirt.setImage("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500");
            tshirt.setStock(200);
            tshirt.setRating(new BigDecimal("4.5"));
            tshirt.setReviews(67);
            tshirt.setRole(Product.ProductRole.PUBLIC);
            tshirt.setActive(true);
            productRepository.save(tshirt);
            
            Product jeans = new Product();
            jeans.setName("Slim Fit Jeans");
            jeans.setDescription("Modern slim fit jeans with stretch denim");
            jeans.setPrice(new BigDecimal("79.99"));
            jeans.setCategory("Clothing");
            jeans.setImage("https://images.unsplash.com/photo-1542272604-787c3835535d?w=500");
            jeans.setStock(150);
            jeans.setRating(new BigDecimal("4.3"));
            jeans.setReviews(45);
            jeans.setRole(Product.ProductRole.PUBLIC);
            jeans.setActive(true);
            productRepository.save(jeans);
            
            // Books
            Product book = new Product();
            book.setName("The Art of Programming");
            book.setDescription("Comprehensive guide to modern programming practices");
            book.setPrice(new BigDecimal("49.99"));
            book.setOriginalPrice(new BigDecimal("69.99"));
            book.setCategory("Books");
            book.setImage("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500");
            book.setStock(75);
            book.setRating(new BigDecimal("4.7"));
            book.setReviews(34);
            book.setRole(Product.ProductRole.PUBLIC);
            book.setActive(true);
            productRepository.save(book);
            
            // Home & Garden
            Product plant = new Product();
            plant.setName("Indoor Plant - Monstera");
            plant.setDescription("Beautiful Monstera deliciosa plant, perfect for home decoration");
            plant.setPrice(new BigDecimal("39.99"));
            plant.setCategory("Home & Garden");
            plant.setImage("https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=500");
            plant.setStock(30);
            plant.setRating(new BigDecimal("4.6"));
            plant.setReviews(23);
            plant.setRole(Product.ProductRole.PUBLIC);
            plant.setActive(true);
            productRepository.save(plant);
            
            // Sports
            Product yogaMat = new Product();
            yogaMat.setName("Premium Yoga Mat");
            yogaMat.setDescription("Non-slip yoga mat with carrying strap, perfect for all types of yoga");
            yogaMat.setPrice(new BigDecimal("59.99"));
            yogaMat.setOriginalPrice(new BigDecimal("79.99"));
            yogaMat.setCategory("Sports");
            yogaMat.setImage("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500");
            yogaMat.setStock(80);
            yogaMat.setRating(new BigDecimal("4.4"));
            yogaMat.setReviews(56);
            yogaMat.setRole(Product.ProductRole.PUBLIC);
            yogaMat.setActive(true);
            productRepository.save(yogaMat);
            
            System.out.println("Products initialized successfully!");
        }
    }
}
