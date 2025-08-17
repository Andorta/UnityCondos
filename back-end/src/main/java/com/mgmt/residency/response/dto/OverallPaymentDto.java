package com.mgmt.residency.response.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OverallPaymentDto {

	private Long id;

	private LocalDateTime createdAt;

	private String description;

	private Attachments attachments;

	private UserResponseDto createdBy;

	private String type;

	private List<UserPaymentDto> users;

	private Double debit;

	private Double credit;

	public static class Attachments {
		private TaskResponseDto task;
		private List<FileMetadataDto> files;

		public TaskResponseDto getTask() {
			return task;
		}

		public void setTask(TaskResponseDto task) {
			this.task = task;
		}

		public List<FileMetadataDto> getFiles() {
			return files;
		}

		public void setFiles(List<FileMetadataDto> files) {
			this.files = files;
		}
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Attachments getAttachments() {
		return attachments;
	}

	public void setAttachments(Attachments attachments) {
		this.attachments = attachments;
	}

	public UserResponseDto getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(UserResponseDto createdBy) {
		this.createdBy = createdBy;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public List<UserPaymentDto> getUsers() {
		return users;
	}

	public void setUsers(List<UserPaymentDto> users) {
		this.users = users;
	}

	public Double getDebit() {
		return debit;
	}

	public void setDebit(Double debit) {
		this.debit = debit;
	}

	public Double getCredit() {
		return credit;
	}

	public void setCredit(Double credit) {
		this.credit = credit;
	}
}
