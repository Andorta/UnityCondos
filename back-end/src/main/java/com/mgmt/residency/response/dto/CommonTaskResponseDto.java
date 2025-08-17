package com.mgmt.residency.response.dto;

import java.time.LocalDateTime;

public class CommonTaskResponseDto {

	private Long id;
	private String title;
	private String description;
	private UserResponseDto assignedBy;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Double paymentAmount;
	private LocalDateTime payTime;

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

	public LocalDateTime getPayTime() {
		return payTime;
	}

	public void setPayTime(LocalDateTime payTime) {
		this.payTime = payTime;
	}
	
}
