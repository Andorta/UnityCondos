package com.mgmt.residency.response.dto;

import java.time.LocalDateTime;

public class TaskResponseDto {

	private Long id;
	private String title;
	private String description;
	private String status;
	private UserResponseDto assignedTo;
	private UserResponseDto assignedBy;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Double paymentAmount;

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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public UserResponseDto getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(UserResponseDto assignedTo) {
		this.assignedTo = assignedTo;
	}

	public UserResponseDto getAssignedBy() {
		return assignedBy;
	}

	public void setAssignedBy(UserResponseDto assignedBy) {
		this.assignedBy = assignedBy;
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

	public Double getPaymentAmount() {
		return paymentAmount;
	}

	public void setPaymentAmount(Double paymentAmount) {
		this.paymentAmount = paymentAmount;
	}
}
