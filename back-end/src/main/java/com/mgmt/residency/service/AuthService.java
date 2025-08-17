package com.mgmt.residency.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.mgmt.residency.constants.UserStatus;
import com.mgmt.residency.constants.UsersRole;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.exception.AlreadyExistsException;
import com.mgmt.residency.exception.AppException;
import com.mgmt.residency.exception.NotFoundException;
import com.mgmt.residency.repository.UserRepository;
import com.mgmt.residency.request.dto.LoginRequestDto;
import com.mgmt.residency.request.dto.RegisterRequestDto;
import com.mgmt.residency.response.dto.GenericMessage;
import com.mgmt.residency.response.dto.LoginResponseDto;
import com.mgmt.residency.security.JwtUtil;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.security.service.UserDetailsServiceImpl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Service
public class AuthService {

	private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);

	@Autowired
	UserRepository userRepo;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtUtil jwtTokenProvider;

	@Autowired
	UserDetailsServiceImpl userDetailsServiceImpl;

	public User registerUser(RegisterRequestDto registerDto) {
		try {
			if (userRepo.existsByEmail(registerDto.getEmail())) {
				LOGGER.error("Exception occurred during user registration. Email already exists. Email : {}",
						registerDto.getEmail());
				throw new AlreadyExistsException("Email already exists");
			}
			if (registerDto.getRole().equals(UsersRole.ROLE_RESIDENT.name())
					&& !StringUtils.hasText(registerDto.getResidencyNumber())) {
				throw new NotFoundException("Residency number is required");
			} else if (registerDto.getRole().equals(UsersRole.ROLE_GUEST.name())
					&& !StringUtils.hasText(registerDto.getDesignation())) {
				throw new NotFoundException("Designation is required");
			}
			User user = new User();
			user.setFirstName(registerDto.getFirstName().trim());
			user.setLastName(registerDto.getLastName().trim());
			user.setEmail(registerDto.getEmail());
			user.setPhoneNumber(registerDto.getPhoneNumber());
			user.setStatus(UserStatus.INACTIVE.name());
			user.setPassword(encoder.encode(registerDto.getPassword()));
			user.setCreatedAt(LocalDateTime.now());
			user.setModifiedAt(LocalDateTime.now());
			user.setRole(registerDto.getRole());

			if (registerDto.getRole().equals(UsersRole.ROLE_RESIDENT.name())) {
				user.setResidencyNumber(registerDto.getResidencyNumber());
			} else if (registerDto.getRole().equals(UsersRole.ROLE_GUEST.name())) {
				user.setDesignation(registerDto.getDesignation());
			}
			return userRepo.save(user);

		} catch (Exception e) {
			e.printStackTrace();
			LOGGER.error("Exception occurred while user registration. Error Message : {}", e.getMessage());
			throw new AppException(e.getMessage());
		}
	}

	public LoginResponseDto login(LoginRequestDto loginRequestDto, HttpServletResponse response) {
		try {
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(loginRequestDto.getEmail(), loginRequestDto.getPassword()));
			SecurityContextHolder.getContext().setAuthentication(authentication);
			UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

			String accessToken = jwtTokenProvider.generateAccessToken(userDetails);

			LoginResponseDto responseDto = new LoginResponseDto();
			responseDto.setId(userDetails.getId());
			responseDto.setFirstName(userDetails.getFirstName());
			responseDto.setLastName(userDetails.getLastName());
			responseDto.setEmail(userDetails.getEmail());
			responseDto.setPhoneNumber(userDetails.getPhone());
			responseDto.setAccessToken(accessToken);
			responseDto.setRole(userDetails.getRole());

			return responseDto;

		} catch (Exception e) {
			e.printStackTrace();
			LOGGER.error("Exception occurred during login attempt. Email : {}, Error Message : {}",
					loginRequestDto.getEmail(), e.getMessage());
			throw new AppException(e.getMessage());
		}

	}

	public GenericMessage logout(HttpServletRequest request, HttpServletResponse response) {

		HttpSession session = request.getSession(false);

		if (session != null) {
			session.invalidate();
		}

		SecurityContextHolder.clearContext();

		GenericMessage messageResponse = new GenericMessage();
		messageResponse.setMessage("Logout successful");
		messageResponse.setTime(LocalDateTime.now());

		return messageResponse;
	}
}
