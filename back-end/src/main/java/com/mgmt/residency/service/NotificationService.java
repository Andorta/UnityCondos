package com.mgmt.residency.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mgmt.residency.constants.AppConstant;
import com.mgmt.residency.entity.Notification;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.exception.AppException;
import com.mgmt.residency.repository.NotificationRepository;
import com.mgmt.residency.repository.UserRepository;
import com.mgmt.residency.response.dto.NotificationDto;
import com.mgmt.residency.response.dto.UserNotificationResponseDto;

@Service
public class NotificationService {

	@Autowired
	NotificationRepository notificationRepo;

	@Autowired
	UserRepository userRepo;

	@Autowired
	ObjectMapper mapper;

	@Autowired
	private SimpMessagingTemplate template;

	public void sendNotification(User fromUserId, User toUserId, StringBuilder message, String type) {
		try {

			UserNotificationResponseDto fromMemberResponse = new UserNotificationResponseDto();
			fromMemberResponse.setId(fromUserId.getId());
			fromMemberResponse.setName(fromUserId.getFirstName() + " " + fromUserId.getLastName());
			UserNotificationResponseDto toMemberResponse = new UserNotificationResponseDto();
			toMemberResponse.setId(toUserId.getId());
			toMemberResponse.setName(toUserId.getFirstName() + " " + toUserId.getLastName());

			NotificationDto notificationDto = new NotificationDto();

			notificationDto.setFrom(fromMemberResponse);

			notificationDto.setTo(toMemberResponse);

			notificationDto.setMessage(message.toString());

			notificationDto.setTime(LocalDateTime.now());

			String data = mapper.writeValueAsString(notificationDto);

			Notification notification = new Notification();
			notification.setSender(fromUserId);
			notification.setReceiver(toUserId);
			notification.setMessage(message.toString());
			notification.setDate(LocalDateTime.now());

			notificationRepo.save(notification);
			if (type.equals("POLL"))
				template.convertAndSend(AppConstant.SPECIFIC_USER_TOPIC, data);
			if (type.equals("ANNOUNCEMENT"))
				template.convertAndSend(AppConstant.ANNOUNCEMENT_TOPIC.replace("{USER_ID}", toUserId.getId()), data);
			if (type.equals("TASK"))
				template.convertAndSend(AppConstant.TASK_TOPIC.replace("{USER_ID}", toUserId.getId()), data);
		} catch (Exception e) {
			throw new AppException(e.getMessage());
		}
	}

	public List<NotificationDto> getAllNotification(String userId) {
		try {
			LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
			LocalDateTime currentDate = LocalDateTime.now();

			List<Notification> twoDayNotifications = notificationRepo
					.findByReceiverIdAndDateBetweenAndViewStatusTrueOrderByDateDesc(userId, twoDaysAgo, currentDate);

			LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
			List<Notification> sevenDayNotifications = notificationRepo
					.findByReceiverIdAndDateBetweenAndViewStatusFalseOrderByDateDesc(userId, sevenDaysAgo, currentDate);

			List<Notification> allNotifications = new ArrayList<>();
			allNotifications.addAll(twoDayNotifications);
			allNotifications.addAll(sevenDayNotifications);

			if (allNotifications.isEmpty())
				return Collections.emptyList();

			allNotifications = allNotifications.stream()
					.sorted(Comparator.comparing(Notification::isViewStatus)
							.thenComparing(Comparator.comparing(Notification::getDate).reversed()))
					.collect(Collectors.toList());
			List<NotificationDto> notificationDtos = allNotifications.stream().map(e -> {

				NotificationDto notificationDto = new NotificationDto();
				UserNotificationResponseDto fromMember = new UserNotificationResponseDto();

				fromMember.setId(e.getSender().getId());
				fromMember.setName(e.getSender().getFirstName() + " " + e.getSender().getLastName());
				notificationDto.setFrom(fromMember);

				UserNotificationResponseDto toMember = new UserNotificationResponseDto();
				toMember.setId(e.getReceiver().getId());
				toMember.setName(e.getReceiver().getFirstName() + " " + e.getReceiver().getLastName());

				notificationDto.setId(e.getId());
				notificationDto.setTo(toMember);
				notificationDto.setViewStatus(e.isViewStatus());
				notificationDto.setMessage(e.getMessage().toString());
				notificationDto.setTime(e.getDate());

				return notificationDto;
			}).collect(Collectors.toList());

			return notificationDtos;

		} catch (Exception e) {
			throw new AppException(e.getMessage());
		}
	}

	public List<NotificationDto> updateViewStatus(String loggedUser, long notificationId) {
		try {
			Notification notification = notificationRepo.findByReceiverIdAndId(loggedUser, notificationId);
			if (notification != null) {
				notification.setViewStatus(!notification.isViewStatus());
				notificationRepo.save(notification);
				return getAllNotification(loggedUser);
			}
			return null;
		}

		catch (Exception e) {
			throw new AppException(e.getMessage());
		}
	}

}
