package com.mgmt.residency.response.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PaymentDto {
	private Long id;
	private String type;
	private Double amount;
	private String description;
	private LocalDateTime createdAt;
	private List<UserPaymentDto> users;
	private List<FileMetadataDto> fileMetadatas;
	private TaskResponseDto task;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Double getAmount() {
		return amount;
	}

	public void setAmount(Double amount) {
		this.amount = amount;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public List<UserPaymentDto> getUsers() {
		return users;
	}

	public void setUsers(List<UserPaymentDto> users) {
		this.users = users;
	}

	public List<FileMetadataDto> getFileMetadatas() {
		return fileMetadatas;
	}

	public void setFileMetadatas(List<FileMetadataDto> fileMetadatas) {
		this.fileMetadatas = fileMetadatas;
	}

	public TaskResponseDto getTask() {
		return task;
	}

	public void setTask(TaskResponseDto task) {
		this.task = task;
	}

}
