package com.mgmt.residency.response.dto;

import java.time.LocalDateTime;

public class NotificationDto {

	private long id;

	public UserNotificationResponseDto from;

	public UserNotificationResponseDto to;

	public String message;

	public boolean viewStatus;

	public LocalDateTime time;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public UserNotificationResponseDto getFrom() {
		return from;
	}

	public void setFrom(UserNotificationResponseDto from) {
		this.from = from;
	}

	public UserNotificationResponseDto getTo() {
		return to;
	}

	public void setTo(UserNotificationResponseDto to) {
		this.to = to;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public boolean isViewStatus() {
		return viewStatus;
	}

	public void setViewStatus(boolean viewStatus) {
		this.viewStatus = viewStatus;
	}

	public LocalDateTime getTime() {
		return time;
	}

	public void setTime(LocalDateTime time) {
		this.time = time;
	}

}
