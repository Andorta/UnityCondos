package com.mgmt.residency.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mgmt.residency.response.dto.NotificationDto;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.service.NotificationService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/notification")
@SecurityRequirement(name = "token")
@CrossOrigin("*")
public class NotificationController {

	@Autowired
	NotificationService notificationService;

	@GetMapping
	public ResponseEntity<List<NotificationDto>> getAllNotifications(
			@AuthenticationPrincipal UserDetailsImpl customUser) {
		List<NotificationDto> Notifications = notificationService.getAllNotification(customUser.getId());
		return new ResponseEntity<List<NotificationDto>>(Notifications, HttpStatus.OK);
	}

	@PutMapping("/status/{notificationId}")
	public ResponseEntity<List<NotificationDto>> updateViewStatus(@PathVariable("notificationId") long notificationId,
			@AuthenticationPrincipal UserDetailsImpl customUser) {
		List<NotificationDto> Notifications = notificationService.updateViewStatus(customUser.getId(), notificationId);
		return new ResponseEntity<List<NotificationDto>>(Notifications, HttpStatus.OK);
	}

}
