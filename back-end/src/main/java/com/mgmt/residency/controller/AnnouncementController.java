package com.mgmt.residency.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mgmt.residency.entity.Announcement;
import com.mgmt.residency.request.dto.AnnouncementRequestDto;
import com.mgmt.residency.response.dto.AnnouncementResponseDto;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.service.AnnouncementService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/announcements")
@SecurityRequirement(name = "token")
@CrossOrigin("*")
public class AnnouncementController {

	private static final Logger LOGGER = LoggerFactory.getLogger(AnnouncementController.class);

	@Autowired
	private AnnouncementService announcementService;

	@PostMapping
	public ResponseEntity<Announcement> createAnnouncement(@Valid @RequestBody AnnouncementRequestDto dto,
			@AuthenticationPrincipal UserDetailsImpl customUser) {

		LOGGER.info("Creating announcement by userId: {}", customUser.getId());
		Announcement created = announcementService.createAnnouncement(dto, customUser.getId());
		LOGGER.info("Announcement created with ID: {}", created.getId());
		return new ResponseEntity<>(created, HttpStatus.CREATED);
	}

	@GetMapping
	public ResponseEntity<List<AnnouncementResponseDto>> getAllAnnouncements(
			@AuthenticationPrincipal UserDetailsImpl customUser) {
		LOGGER.info("Fetching all announcements");
		List<AnnouncementResponseDto> announcements = announcementService.getAllAnnouncements(customUser.getId(),
				customUser.getRole());
		LOGGER.info("Total announcements fetched: {}", announcements.size());
		return ResponseEntity.ok(announcements);
	}

	@GetMapping("/{announcementId}")
	public ResponseEntity<Announcement> getAndUpdateAnnouncementStatus(
			@PathVariable(name = "announcementId") Long announcementId,
			@AuthenticationPrincipal UserDetailsImpl customUser) {
		LOGGER.info("Updating announcement status. User ID: {}, Announcement ID: {}", customUser.getId(),
				announcementId);
		Announcement announcement = announcementService.getAndUpdateAnnouncementStatus(customUser.getId(),
				announcementId);
		LOGGER.debug("Announcement status updated. Title: {}, ID: {}", announcement.getTitle(), announcement.getId());
		return new ResponseEntity<>(announcement, HttpStatus.ACCEPTED);
	}

	@PutMapping("/{announcementId}")
	public ResponseEntity<Announcement> updateAnnouncement(@PathVariable(name = "announcementId") Long announcementId,
			@Valid @RequestBody AnnouncementRequestDto dto, @AuthenticationPrincipal UserDetailsImpl customUser) {

		LOGGER.info("Updating announcement ID: {} by user ID: {}", announcementId, customUser.getId());
		Announcement updated = announcementService.updateAnnouncement(announcementId, dto, customUser.getId());
		LOGGER.info("Announcement updated: {}", updated.getId());
		return new ResponseEntity<>(updated, HttpStatus.ACCEPTED);
	}

	@DeleteMapping("/{announcementId}")
	public ResponseEntity<String> deleteAnnouncement(@PathVariable(name = "announcementId") Long announcementId,
			@AuthenticationPrincipal UserDetailsImpl customUser) {
		LOGGER.info("Deleting announcement ID: {} by user ID: {}", announcementId, customUser.getId());
		announcementService.deleteAnnouncement(announcementId, customUser.getId());
		LOGGER.info("Announcement deleted successfully: {}", announcementId);
		return ResponseEntity.ok("Announcement deleted successfully.");
	}

}
