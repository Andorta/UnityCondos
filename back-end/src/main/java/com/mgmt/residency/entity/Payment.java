package com.mgmt.residency.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "payments")
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "type", nullable = false, length = 20)
	private String type;

	@Column(name = "amount", nullable = false)
	private Double amount;

	@Size(max = 255)
	private String description;

	@OneToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	private List<FileMetadata> fileMetadatas;

	@ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	private User createdBy;

	@OneToMany(mappedBy = "payment", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	private List<UserPayment> users;

	@OneToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	private Task task;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
	
	@JsonIgnore
	@ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	private PaymentSummary paymentSummary;

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

	public List<FileMetadata> getFileMetadatas() {
		return fileMetadatas;
	}

	public void setFileMetadatas(List<FileMetadata> fileMetadatas) {
		this.fileMetadatas = fileMetadatas;
	}

	public User getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(User createdBy) {
		this.createdBy = createdBy;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public List<UserPayment> getUsers() {
		return users;
	}

	public void setUsers(List<UserPayment> users) {
		this.users = users;
	}

	public Task getTask() {
		return task;
	}

	public void setTask(Task task) {
		this.task = task;
	}

	public PaymentSummary getPaymentSummary() {
		return paymentSummary;
	}

	public void setPaymentSummary(PaymentSummary paymentSummary) {
		this.paymentSummary = paymentSummary;
	}

}