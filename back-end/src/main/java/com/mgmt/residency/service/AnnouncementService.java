package com.mgmt.residency.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mgmt.residency.constants.AppConstant;
import com.mgmt.residency.constants.NotificationType;
import com.mgmt.residency.constants.UsersRole;
import com.mgmt.residency.entity.Announcement;
import com.mgmt.residency.entity.AnnouncementViewStatus;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.exception.AppException;
import com.mgmt.residency.exception.NotFoundException;
import com.mgmt.residency.repository.AnnouncementRepository;
import com.mgmt.residency.repository.AnnouncementViewStatusRepository;
import com.mgmt.residency.repository.UserRepository;
import com.mgmt.residency.request.dto.AnnouncementRequestDto;
import com.mgmt.residency.response.dto.AnnouncementResponseDto;
import com.mgmt.residency.response.dto.UserResponseDto;

@Service
public class AnnouncementService {

	private static final Logger LOGGER = LoggerFactory.getLogger(AnnouncementService.class);

	@Autowired
	private AnnouncementRepository announcementRepo;

	@Autowired
	private UserRepository userRepo;

	@Autowired
	NotificationService notificationService;

	@Autowired
	AnnouncementViewStatusRepository announcementViewStatusRep;

	public Announcement createAnnouncement(AnnouncementRequestDto dto, String userId) {
		try {
			User createdBy = userRepo.findByIdAndRole(userId, UsersRole.ROLE_ADMIN.name());
			if (createdBy == null) {
				throw new NotFoundException("User not found or no permission to create announcements");
			}

			List<String> requestedUserIds = dto.getUserIds();
			List<User> selectedUsers = userRepo.findAllById(requestedUserIds);

			if (selectedUsers.size() != requestedUserIds.size()) {
				throw new NotFoundException("Some selected users were not found");
			}

			Announcement announcement = new Announcement();
			announcement.setTitle(dto.getTitle());
			announcement.setContent(dto.getContent());
			announcement.setCreatedBy(createdBy);
			announcement.setCreatedAt(LocalDateTime.now());
			announcement.setUpdatedAt(LocalDateTime.now());
			List<AnnouncementViewStatus> viewStatusList = selectedUsers.stream()
					.filter(user -> !user.getId().equals(userId)).map(user -> {
						AnnouncementViewStatus viewStatus = new AnnouncementViewStatus();
						viewStatus.setUser(user);
						viewStatus.setAnnouncement(announcement);
						viewStatus.setViewed(false);
						return viewStatus;
					}).collect(Collectors.toList());

			announcement.setAnnouncementViewStatus(viewStatusList);

			Announcement savedAnnouncement = announcementRepo.save(announcement);

			String message = String.format("%s<b>%s</b>", AppConstant.ANNOUNCEMENT_NOTIFICATION_MESSAGE,
					savedAnnouncement.getTitle());
			selectedUsers.stream().filter(user -> !user.getId().equals(userId))
					.forEach(user -> notificationService.sendNotification(createdBy, user, new StringBuilder(message),
							NotificationType.ANNOUNCEMENT.name()));

			return savedAnnouncement;

		} catch (Exception e) {
			LOGGER.error("Failed to create announcement: {}", e.getMessage(), e);
			throw new AppException("Something went wrong while creating announcement");
		}
	}

	public List<AnnouncementResponseDto> getAllAnnouncements(String userId, String role) {
		try {
			List<Announcement> announcements;

			if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
				announcements = announcementRepo.findAll();
			} else {
				announcements = announcementRepo.findAllByAnnouncementViewStatusUserId(userId);
			}

			if (announcements.isEmpty())
				return Collections.emptyList();

			List<AnnouncementResponseDto> responseList = new ArrayList<>();

			for (Announcement a : announcements) {
				AnnouncementResponseDto dto = new AnnouncementResponseDto();
				dto.setId(a.getId());
				dto.setTitle(a.getTitle());
				dto.setContent(a.getContent());
				dto.setCreatedAt(a.getCreatedAt());
				dto.setUpdatedAt(a.getUpdatedAt());

				UserResponseDto creatorDto = new UserResponseDto();
				creatorDto.setId(String.valueOf(a.getCreatedBy().getId()));
				creatorDto.setFirstName(a.getCreatedBy().getFirstName());
				creatorDto.setLastName(a.getCreatedBy().getLastName());
				creatorDto.setEmail(a.getCreatedBy().getEmail());
				dto.setCreatedBy(creatorDto);

				int views = (int) a.getAnnouncementViewStatus().stream().filter(AnnouncementViewStatus::isViewed)
						.count();
				dto.setTotalViews(views);

				if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
					List<AnnouncementResponseDto.ViewedUsers> viewedList = a.getAnnouncementViewStatus().stream()
							.filter(v -> v.isViewed() && v.getUser() != null).map(v -> {
								AnnouncementResponseDto.ViewedUsers viewed = new AnnouncementResponseDto.ViewedUsers();
								UserResponseDto viewerDto = new UserResponseDto();
								viewerDto.setId(v.getUser().getId());
								viewerDto.setFirstName(v.getUser().getFirstName());
								viewerDto.setLastName(v.getUser().getLastName());
								viewerDto.setEmail(v.getUser().getEmail());

								viewed.setViewedBy(viewerDto);
								viewed.setViewedAt(v.getViewedAt());
								return viewed;
							}).toList();

					dto.setViewedUsers(viewedList);
					List<UserResponseDto> allResponseDtos = a.getAnnouncementViewStatus().stream()
							.map(AnnouncementViewStatus::getUser).map(u -> {
								UserResponseDto dtoUser = new UserResponseDto();
								dtoUser.setId(u.getId());
								dtoUser.setFirstName(u.getFirstName());
								dtoUser.setLastName(u.getLastName());
								dtoUser.setEmail(u.getEmail());
								return dtoUser;
							}).collect(Collectors.toList());
					dto.setUsers(allResponseDtos);
				}

				responseList.add(dto);
			}

			responseList.sort(Comparator.comparing(AnnouncementResponseDto::getCreatedAt).reversed());
			return responseList;

		} catch (Exception e) {
			LOGGER.error("Failed to fetch announcements: {}", e.getMessage(), e);
			throw new AppException("Failed to get announcements");
		}
	}

	public Announcement getAndUpdateAnnouncementStatus(String userId, Long announcementId) {
		try {
			LOGGER.info("Updating announcement view status for userId: {}, announcementId: {}", userId, announcementId);

			Announcement announcement = announcementRepo.findById(announcementId)
					.orElseThrow(() -> new NotFoundException("Announcement not found"));

			if (!announcement.getCreatedBy().getId().equals(userId)) {
				AnnouncementViewStatus announcementViewStatus = announcement.getAnnouncementViewStatus().stream()
						.filter(avs -> avs.getUser() != null && userId.equals(avs.getUser().getId())).findFirst()
						.orElse(null);

				if (announcementViewStatus == null) {
					LOGGER.warn("No announcement view status found for userId: {}, announcementId: {}", userId,
							announcementId);
					throw new NotFoundException("Announcement view status not found");
				}

				announcementViewStatus.setViewed(true);
				announcementViewStatus.setViewedAt(LocalDateTime.now());
				announcementViewStatusRep.save(announcementViewStatus);

				LOGGER.debug("Updated viewed status to {} for userId: {}, announcementId: {}",
						announcementViewStatus.isViewed(), userId, announcementId);
			}
			return announcement;

		} catch (Exception e) {
			LOGGER.error("Failed to update announcement status for userId: {}, announcementId: {}. Error: {}", userId,
					announcementId, e.getMessage(), e);
			throw new AppException("Failed to get announcement");
		}
	}

	public Announcement updateAnnouncement(Long announcementId, AnnouncementRequestDto dto, String userId) {
		try {
			Announcement announcement = announcementRepo.findByIdAndCreatedById(announcementId, userId);
			if (announcement == null) {
				throw new AppException("Announcement not found or you are not allowed to update it");
			}

			boolean updated = false;
			if (dto.getTitle() != null && !dto.getTitle().equals(announcement.getTitle())) {
				announcement.setTitle(dto.getTitle());
				updated = true;
			}

			if (dto.getContent() != null && !dto.getContent().equals(announcement.getContent())) {
				announcement.setContent(dto.getContent());
				updated = true;
			}
			List<User> newlyAddedUsers = new ArrayList<>();
			if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
				Set<String> requestedUserIdSet = new HashSet<>(dto.getUserIds());
				Set<String> existingUserIds = announcement.getAnnouncementViewStatus().stream()
						.map(vs -> vs.getUser().getId()).collect(Collectors.toSet());

				if (!existingUserIds.equals(requestedUserIdSet)) {
					List<User> selectedUsers = userRepo.findAllById(dto.getUserIds());

					if (selectedUsers.size() != requestedUserIdSet.size()) {
						throw new NotFoundException("Some selected users were not found");
					}

					newlyAddedUsers = selectedUsers.stream()
							.filter(user -> !existingUserIds.contains(user.getId()) && !user.getId().equals(userId))
							.collect(Collectors.toList());

					if (!newlyAddedUsers.isEmpty()) {
						List<AnnouncementViewStatus> newViewStatusList = newlyAddedUsers.stream().map(user -> {
							AnnouncementViewStatus viewStatus = new AnnouncementViewStatus();
							viewStatus.setUser(user);
							viewStatus.setAnnouncement(announcement);
							viewStatus.setViewed(false);
							return viewStatus;
						}).collect(Collectors.toList());

						announcement.getAnnouncementViewStatus().addAll(newViewStatusList);
						updated = true;
					}
				}
			}

			if (updated) {
				announcement.setUpdatedAt(LocalDateTime.now());
				announcementRepo.save(announcement);

				if (!newlyAddedUsers.isEmpty()) {
					String message = String.format("%s<%s>", AppConstant.ANNOUNCEMENT_NOTIFICATION_MESSAGE,
							announcement.getTitle());
					for (User user : newlyAddedUsers) {
						notificationService.sendNotification(announcement.getCreatedBy(), user,
								new StringBuilder(message), NotificationType.ANNOUNCEMENT.name());
					}
				}
			}

			return announcement;

		} catch (Exception e) {
			LOGGER.error("Failed to update announcement: {}", e.getMessage(), e);
			throw new AppException("Failed to update announcement");
		}
	}

	public void deleteAnnouncement(Long announcementId, String userId) {
		try {
			Announcement announcement = announcementRepo.findByIdAndCreatedById(announcementId, userId);

			if (announcement == null) {
				throw new AppException("Announcement not found or You are not allowed to delete this announcement");
			}

			announcementRepo.delete(announcement);
			LOGGER.info("Announcement deleted successfully: id={}", announcementId);
		} catch (Exception e) {
			LOGGER.error("Failed to delete announcement: {}", e.getMessage(), e);
			throw new AppException("Failed to delete announcement");
		}
	}

}
