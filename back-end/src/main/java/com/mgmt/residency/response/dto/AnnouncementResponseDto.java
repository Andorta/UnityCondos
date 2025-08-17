package com.mgmt.residency.response.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AnnouncementResponseDto {
	private Long id;
	private String title;
	private String content;
	private UserResponseDto createdBy;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private int totalViews;
	private List<UserResponseDto> users;
	private List<ViewedUsers> viewedUsers;

	public static class ViewedUsers {

		private UserResponseDto viewedBy;
		private LocalDateTime viewedAt;

		public UserResponseDto getViewedBy() {
			return viewedBy;
		}

		public void setViewedBy(UserResponseDto viewedBy) {
			this.viewedBy = viewedBy;
		}

		public LocalDateTime getViewedAt() {
			return viewedAt;
		}

		public void setViewedAt(LocalDateTime viewedAt) {
			this.viewedAt = viewedAt;
		}
	}

	public List<ViewedUsers> getViewedUsers() {
		return viewedUsers;
	}

	public void setViewedUsers(List<ViewedUsers> viewedUsers) {
		this.viewedUsers = viewedUsers;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

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

	public UserResponseDto getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(UserResponseDto createdBy) {
		this.createdBy = createdBy;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public int getTotalViews() {
		return totalViews;
	}

	public void setTotalViews(int totalViews) {
		this.totalViews = totalViews;
	}

	public List<UserResponseDto> getUsers() {
		return users;
	}

	public void setUsers(List<UserResponseDto> users) {
		this.users = users;
	}

}
