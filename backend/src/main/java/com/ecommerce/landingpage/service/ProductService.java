package com.ecommerce.landingpage.service;

import com.ecommerce.landingpage.dto.ProductDto;
import com.ecommerce.landingpage.exception.ResourceNotFoundException;
import com.ecommerce.landingpage.model.Product;
import com.ecommerce.landingpage.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public Page<ProductDto> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable)
                .map(ProductDto::new);
    }
    
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product is not active");
        }
        
        return new ProductDto(product);
    }
    
    public ProductDto createProduct(ProductDto productDto) {
        Product product = new Product();
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        product.setOriginalPrice(productDto.getOriginalPrice());
        product.setCategory(productDto.getCategory());
        product.setImage(productDto.getImage());
        product.setStock(productDto.getStock());
        product.setRating(productDto.getRating() != null ? productDto.getRating() : BigDecimal.ZERO);
        product.setReviews(productDto.getReviews() != null ? productDto.getReviews() : 0);
        product.setRole(Product.ProductRole.valueOf(productDto.getRole() != null ? productDto.getRole() : "PUBLIC"));
        product.setActive(true);
        
        Product savedProduct = productRepository.save(product);
        return new ProductDto(savedProduct);
    }
    
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        if (productDto.getName() != null) {
            product.setName(productDto.getName());
        }
        
        if (productDto.getDescription() != null) {
            product.setDescription(productDto.getDescription());
        }
        
        if (productDto.getPrice() != null) {
            product.setPrice(productDto.getPrice());
        }
        
        if (productDto.getOriginalPrice() != null) {
            product.setOriginalPrice(productDto.getOriginalPrice());
        }
        
        if (productDto.getCategory() != null) {
            product.setCategory(productDto.getCategory());
        }
        
        if (productDto.getImage() != null) {
            product.setImage(productDto.getImage());
        }
        
        if (productDto.getStock() != null) {
            product.setStock(productDto.getStock());
        }
        
        if (productDto.getRating() != null) {
            product.setRating(productDto.getRating());
        }
        
        if (productDto.getReviews() != null) {
            product.setReviews(productDto.getReviews());
        }
        
        if (productDto.getRole() != null) {
            product.setRole(Product.ProductRole.valueOf(productDto.getRole()));
        }
        
        Product updatedProduct = productRepository.save(product);
        return new ProductDto(updatedProduct);
    }
    
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        product.setActive(false);
        productRepository.save(product);
    }
    
    public Page<ProductDto> getProductsByCategory(String category, Pageable pageable) {
        return productRepository.findByCategoryAndActiveTrue(category, pageable)
                .map(ProductDto::new);
    }
    
    public Page<ProductDto> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByActiveTrueAndPriceBetween(minPrice, maxPrice, pageable)
                .map(ProductDto::new);
    }
    
    public Page<ProductDto> searchProducts(String category, BigDecimal minPrice, BigDecimal maxPrice, 
                                         String searchTerm, Pageable pageable) {
        return productRepository.findProductsWithFilters(category, minPrice, maxPrice, searchTerm, pageable)
                .map(ProductDto::new);
    }
    
    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }
    
    public Page<ProductDto> getInStockProducts(Pageable pageable) {
        return productRepository.findByActiveTrueAndStockGreaterThan(0, pageable)
                .map(ProductDto::new);
    }
    
    public Page<ProductDto> getTopRatedProducts(Pageable pageable) {
        return productRepository.findTopRatedProducts(pageable)
                .map(ProductDto::new);
    }
    
    public Page<ProductDto> getDiscountedProducts(Pageable pageable) {
        return productRepository.findDiscountedProducts(pageable)
                .map(ProductDto::new);
    }
}
