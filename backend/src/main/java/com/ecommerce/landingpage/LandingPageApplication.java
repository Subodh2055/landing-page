package com.ecommerce.landingpage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LandingPageApplication {

    public static void main(String[] args) {
        SpringApplication.run(LandingPageApplication.class, args);
    }
}
