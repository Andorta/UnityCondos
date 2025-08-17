package com.mgmt.residency.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mgmt.residency.entity.User;
import com.mgmt.residency.request.dto.LoginRequestDto;
import com.mgmt.residency.request.dto.RegisterRequestDto;
import com.mgmt.residency.response.dto.GenericMessage;
import com.mgmt.residency.response.dto.LoginResponseDto;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/auth")
@CrossOrigin("*")
public class AuthController {

	private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

	@Autowired
	AuthService authService;

	@PostMapping("/register")
	public ResponseEntity<User> register(@Valid @RequestBody RegisterRequestDto registerMemberDto) {
		LOGGER.info("Registering new user with email : {}", registerMemberDto.getEmail());
		User user = authService.registerUser(registerMemberDto);
		LOGGER.info("User registered successfully with ID : {}", user.getId());
		return new ResponseEntity<>(user, HttpStatus.CREATED);
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginDto,
			HttpServletResponse response) {
		LOGGER.info("Attempting to login user with email : {}", loginDto.getEmail());
		LoginResponseDto loginResponse = authService.login(loginDto, response);
		LOGGER.info("User logged in successfully with email : {}", loginDto.getEmail());
		return new ResponseEntity<>(loginResponse, HttpStatus.CREATED);
	}

	@PostMapping("/logout")
	public ResponseEntity<GenericMessage> logout(HttpServletRequest request, HttpServletResponse response,
			@AuthenticationPrincipal UserDetailsImpl customUser) {

		String loggedUserId = customUser.getId();
		LOGGER.info("Attempting to log out user ID: {}", loggedUserId);
		GenericMessage logoutResponse = authService.logout(request, response);
		LOGGER.info("User logged out successfully with user ID: {}", loggedUserId);
		return new ResponseEntity<>(logoutResponse, HttpStatus.CREATED);
	}

}
