package com.mgmt.residency.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mgmt.residency.entity.User;
import com.mgmt.residency.response.dto.DashboardSummaryDto;
import com.mgmt.residency.response.dto.GenericMessage;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/user")
@CrossOrigin("*")
@SecurityRequirement(name = "token")
public class UserController {

	private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

	@Autowired
	private UserService userService;

	@GetMapping
	public ResponseEntity<List<User>> getUsers(@RequestParam(name = "searchText", required = false) String searchText,
			@RequestParam(name = "roleType", required = false) String roleType,
			@RequestParam(name = "status", required = false) String status) {

		LOGGER.info("Fetching users with filters - searchText: {}, roleType: {}, status: {}", searchText, roleType,
				status);
		List<User> users = userService.getAllUsers(searchText, roleType, status);
		LOGGER.info("Fetched {} users", users.size());
		return ResponseEntity.ok(users);
	}

	@PatchMapping("/status")
	public ResponseEntity<GenericMessage> toggleUserStatus(@AuthenticationPrincipal UserDetailsImpl customUser,
			@RequestParam(name = "targetUserId") String targetUserId) {
		String loggedInUserId = customUser.getId();
		LOGGER.info("User ID {} requested status toggle for user ID {}", loggedInUserId, targetUserId);
		GenericMessage response = userService.toggleUserStatus(loggedInUserId, targetUserId);
		LOGGER.info("Status toggle response: {}", response.getMessage());
		return ResponseEntity.ok(response);
	}

	@GetMapping("/active")
	public ResponseEntity<List<User>> getActiveUsers(
			@RequestParam(value = "searchText", required = false) String searchText,
			@RequestParam(value = "role", required = false) String role,
			@RequestParam(value = "designation", required = false) String designation) {
		LOGGER.info("Fetching active users with searchText: {}, role: {}, designation: {}", searchText, role,
				designation);
		List<User> users = userService.getActiveUsers(searchText, role, designation);
		LOGGER.info("Fetched {} active users", users.size());
		return ResponseEntity.ok(users);
	}

	@GetMapping("/all")
	public ResponseEntity<List<User>> getAllUsers() {
		LOGGER.info("Fetching all users with role RESIDENT And ADMIN");
		List<User> residents = userService.getAllUsers();
		return ResponseEntity.ok(residents);
	}

	@GetMapping("/dashboard")
	public ResponseEntity<DashboardSummaryDto> getDashboardSummary(
			@AuthenticationPrincipal UserDetailsImpl customUser) {

		LOGGER.info("Received request to fetch dashboard summary for userId: {}, role: {}", customUser.getId(),
				customUser.getRole());

		DashboardSummaryDto summary = userService.getDashboardSummary(customUser.getId(), customUser.getRole());

		return ResponseEntity.ok(summary);
	}

}
