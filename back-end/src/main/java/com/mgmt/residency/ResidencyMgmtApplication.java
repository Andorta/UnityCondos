package com.mgmt.residency;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.mgmt.residency.constants.UserStatus;
import com.mgmt.residency.constants.UsersRole;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.repository.UserRepository;

@SpringBootApplication
public class ResidencyMgmtApplication {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResidencyMgmtApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ResidencyMgmtApplication.class, args);
    }

    @Bean
    public CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.email}") String email,
            @Value("${admin.password}") String rawPassword,
            @Value("${admin.firstName}") String firstName,
            @Value("${admin.lastName}") String lastName,
            @Value("${admin.phone}") String phone
    ) {
        return args -> {
            boolean adminExists = userRepository.existsByRole(UsersRole.ROLE_ADMIN.name());
            if (!adminExists) {
                User admin = new User();
                admin.setEmail(email);
                admin.setPassword(passwordEncoder.encode(rawPassword));
                admin.setFirstName(firstName);
                admin.setLastName(lastName);
                admin.setPhoneNumber(phone);
                admin.setRole(UsersRole.ROLE_ADMIN.name());
                admin.setStatus(UserStatus.ACTIVE.name());
                admin.setCreatedAt(LocalDateTime.now());
                admin.setModifiedAt(LocalDateTime.now());

                userRepository.save(admin);
                LOGGER.info("Default admin user created with email: {}", email);
            } else {
                LOGGER.info("Admin user already exists.");
            }
        };
    }
}
