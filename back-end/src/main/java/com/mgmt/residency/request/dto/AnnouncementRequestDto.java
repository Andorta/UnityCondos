package com.mgmt.residency.request.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AnnouncementRequestDto {

	@NotBlank(message = "Title is required")
	@Size(max = 200, message = "Title must be at most 200 characters")
	private String title;

	@NotBlank(message = "Content is required")
	@Size(max = 1000, message = "Content must be at most 1000 characters")
	private String content;

	private List<String> userIds;

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public List<String> getUserIds() {
		return userIds;
	}

	public void setUserIds(List<String> userIds) {
		this.userIds = userIds;
	}
}
