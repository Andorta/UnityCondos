package com.mgmt.residency.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mgmt.residency.constants.PaymentType;
import com.mgmt.residency.constants.TaskStatus;
import com.mgmt.residency.constants.UsersRole;
import com.mgmt.residency.entity.FileMetadata;
import com.mgmt.residency.entity.Payment;
import com.mgmt.residency.entity.PaymentSummary;
import com.mgmt.residency.entity.Task;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.entity.UserPayment;
import com.mgmt.residency.exception.AppException;
import com.mgmt.residency.exception.NotFoundException;
import com.mgmt.residency.repository.PaymentRepository;
import com.mgmt.residency.repository.PaymentSummaryRepository;
import com.mgmt.residency.repository.TaskRepository;
import com.mgmt.residency.repository.UserRepository;
import com.mgmt.residency.request.dto.ExpensePaymentRequestDto;
import com.mgmt.residency.request.dto.IncomePaymentRequestDto;
import com.mgmt.residency.response.dto.FileMetadataDto;
import com.mgmt.residency.response.dto.OverallPaymentDto;
import com.mgmt.residency.response.dto.PaymentDetailsResponseDto;
import com.mgmt.residency.response.dto.PaymentResponseDto;
import com.mgmt.residency.response.dto.TaskResponseDto;
import com.mgmt.residency.response.dto.UserPaymentDto;
import com.mgmt.residency.response.dto.UserResponseDto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
public class PaymentService {

	@Autowired
	private UserRepository userRepo;

	@Autowired
	private PaymentRepository paymentRepo;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private TaskRepository taskRepo;

	@Autowired
	private Validator validator;

	@Autowired
	private PaymentSummaryRepository paymentSummaryRepo;

	private static final Logger LOGGER = LoggerFactory.getLogger(PaymentService.class);

	public Payment createIncomePayment(String userId, IncomePaymentRequestDto dto) {
		try {
			User creator = userRepo.findByIdAndRoleNot(userId, UsersRole.ROLE_GUEST.name());
			if (creator == null)
				throw new NotFoundException("User not found");

			List<String> userIds = dto.getUserIds();
			if (userIds == null || userIds.isEmpty()) {
				throw new AppException("User list is required for income payment");
			}

			List<User> users = userRepo.findAllById(userIds);
			if (users.size() != userIds.size())
				throw new NotFoundException("Some users not found");

			Payment payment = new Payment();
			payment.setType(PaymentType.INCOME.name());
			payment.setAmount(dto.getAmount());
			payment.setDescription(dto.getDescription());
			payment.setCreatedBy(creator);
			payment.setCreatedAt(LocalDateTime.now());

			double perUserAmount = dto.getAmount() / users.size();
			List<UserPayment> userPayments = users.stream().map(user -> {
				UserPayment up = new UserPayment();
				up.setUser(user);
				up.setPayment(payment);
				up.setCreatedAt(LocalDateTime.now());
				up.setAmount(perUserAmount);
				return up;
			}).collect(Collectors.toList());

			payment.setUsers(userPayments);

			updateSummary(payment, dto.getAmount(), PaymentType.INCOME);

			paymentRepo.save(payment);
			return payment;

		} catch (Exception e) {
			LOGGER.error("Error creating income payment: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	public Payment createExpensePayment(String userId, String paymentDetails, MultipartFile[] files) {
		try {
			LOGGER.debug("Parsing expense payment details for userId: {}", userId);

			ExpensePaymentRequestDto dto = objectMapper.readValue(paymentDetails, ExpensePaymentRequestDto.class);

			Set<ConstraintViolation<ExpensePaymentRequestDto>> violations = validator.validate(dto);
			if (!violations.isEmpty()) {
				String errorMsg = violations.stream().map(ConstraintViolation::getMessage)
						.collect(Collectors.joining(", "));
				throw new AppException(errorMsg);
			}

			User creator = userRepo.findByIdAndRoleNot(userId, UsersRole.ROLE_GUEST.name());
			if (creator == null)
				throw new NotFoundException("User not found");

			if (files == null || files.length == 0 || Arrays.stream(files).allMatch(MultipartFile::isEmpty)) {
				throw new AppException("Receipt file is required for expense payment");
			}

			Payment payment = new Payment();
			payment.setType(PaymentType.EXPENSE.name());
			payment.setAmount(dto.getAmount());
			payment.setDescription(dto.getDescription());
			payment.setCreatedBy(creator);
			payment.setCreatedAt(LocalDateTime.now());

			if (dto.getTaskId() != null) {
				Task task = taskRepo.findByIdAndStatus(dto.getTaskId(), TaskStatus.COMPLETED.name());
				if (task == null)
					throw new AppException("Task not found");
				payment.setTask(task);
				task.setPayment(payment);
			}

			List<FileMetadata> metadataList = new ArrayList<>();
			for (MultipartFile file : files) {
				FileMetadata metadata = new FileMetadata();
				metadata.setFileName(file.getOriginalFilename());
				metadata.setFileType(file.getContentType());
				metadata.setFileSize(file.getSize());
				metadata.setReceiptFile(file.getBytes());
				metadataList.add(metadata);
			}
			payment.setFileMetadatas(metadataList);

			updateSummary(payment, dto.getAmount(), PaymentType.EXPENSE);

			paymentRepo.save(payment);
			LOGGER.info("Expense payment created successfully with ID: {}", payment.getId());
			return payment;

		} catch (Exception e) {
			LOGGER.error("Error creating expense payment: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	private void updateSummary(Payment payment, double amount, PaymentType type) {
		PaymentSummary summary = paymentSummaryRepo.findTopByOrderByCreatedAtDesc();
		if (summary == null) {
			summary = new PaymentSummary();
			summary.setCreatedAt(LocalDateTime.now());
			summary.setTotalIncome(0.0);
			summary.setTotalExpense(0.0);
			summary.setPayments(new ArrayList<>());
		}

		if (type == PaymentType.INCOME) {
			summary.setTotalIncome(summary.getTotalIncome() + amount);
		} else {
			summary.setTotalIncome(summary.getTotalIncome() - amount);
			summary.setTotalExpense(summary.getTotalExpense() + amount);
		}

		summary.setUpdatedAt(LocalDateTime.now());
		payment.setPaymentSummary(summary);
		summary.getPayments().add(payment);
	}

	private UserResponseDto toUserResponseDto(User user) {
		UserResponseDto dto = new UserResponseDto();
		dto.setId(user.getId());
		dto.setFirstName(user.getFirstName());
		dto.setLastName(user.getLastName());
		dto.setEmail(user.getEmail());
		return dto;
	}

	public List<PaymentDetailsResponseDto> getPaymentsGroupedByUserAndDay(String userId, String role) {
		LOGGER.info("Fetching payment details grouped by day for last 10 days. userId: {}, role: {}", userId, role);

		try {
			List<Payment> payments;

			if (UsersRole.ROLE_GUEST.name().equalsIgnoreCase(role)) {
				payments = paymentRepo.findByTypeAndTaskAssignedToId(PaymentType.EXPENSE.name(), userId);
			} else if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
				payments = paymentRepo.findAll();
			} else {
				payments = paymentRepo.findByCreatedByIdOrUsersUserId(userId, userId);
			}

			if (payments.isEmpty()) {
				return Collections.emptyList();
			}

			ZoneId zoneId = ZoneId.systemDefault();
			LocalDate today = LocalDate.now(zoneId);
			LocalDate fromDate = today.minusDays(9);

			List<Payment> recentPayments = payments.stream().filter(p -> {
				LocalDate paymentDate = p.getCreatedAt().atZone(zoneId).toLocalDate();
				return !paymentDate.isBefore(fromDate) && !paymentDate.isAfter(today);
			}).collect(Collectors.toList());

			Map<LocalDate, List<Payment>> paymentsByDate = recentPayments.stream()
					.collect(Collectors.groupingBy(p -> p.getCreatedAt().atZone(zoneId).toLocalDate()));

			List<PaymentDetailsResponseDto> results = new ArrayList<>();

			for (int i = 0; i < 10; i++) {
				LocalDate date = fromDate.plusDays(i);
				List<Payment> dayPayments = paymentsByDate.getOrDefault(date, Collections.emptyList());
				double totalIncome = 0.0;
				double totalExpense = 0.0;
				if (!dayPayments.isEmpty()) {
					if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
						totalIncome = dayPayments.stream().filter(p -> PaymentType.INCOME.name().equals(p.getType()))
								.mapToDouble(Payment::getAmount).sum();
						totalExpense = dayPayments.stream().filter(p -> PaymentType.EXPENSE.name().equals(p.getType()))
								.mapToDouble(Payment::getAmount).sum();
					} else if (UsersRole.ROLE_RESIDENT.name().equalsIgnoreCase(role)) {
						totalIncome = dayPayments.stream().filter(p -> PaymentType.INCOME.name().equals(p.getType()))
								.flatMap(p -> {
									if (p.getUsers() == null)
										return Stream.empty();
									return p.getUsers().stream()
											.filter(up -> up.getUser() != null && up.getUser().getId().equals(userId))
											.map(UserPayment::getAmount);
								}).mapToDouble(Double::doubleValue).sum();
						totalExpense = dayPayments.stream().filter(p -> PaymentType.EXPENSE.name().equals(p.getType()))
								.mapToDouble(Payment::getAmount).sum();
					} else {
						totalIncome = dayPayments.stream().filter(p -> PaymentType.EXPENSE.name().equals(p.getType()))
								.mapToDouble(Payment::getAmount).sum();
					}
				}
				PaymentDetailsResponseDto dto = new PaymentDetailsResponseDto();
				dto.setDate(date);
				dto.setTotalIncome(totalIncome);
				dto.setTotalExpense(totalExpense);

				results.add(dto);
			}

			return results;

		} catch (Exception e) {
			LOGGER.error("Failed to fetch payment details grouped by day: {}", e.getMessage(), e);
			throw new AppException("Failed to fetch payment details grouped by day");
		}
	}

	public PaymentResponseDto getPaymentOverview(String userId, String role) {
		LOGGER.info("Fetching payment overview for userId: {}, role: {}", userId, role);

		try {
			PaymentSummary summary = paymentSummaryRepo.findTopByOrderByCreatedAtDesc();
			if (summary == null) {
				LOGGER.info("No payment summary found.");
				return new PaymentResponseDto();
			}

			if (UsersRole.ROLE_GUEST.name().equalsIgnoreCase(role)) {
				List<Payment> payments = paymentRepo.findByTaskAssignedToId(userId);

				double totalIncome = payments.stream().mapToDouble(Payment::getAmount).sum();

				PaymentResponseDto dto = new PaymentResponseDto();
				dto.setTotalIncome(0.0);
				dto.setTotalExpense(0.0);
				dto.setUserTotalIncome(totalIncome);
				dto.setUserTotalExpense(0.0);

				LOGGER.info("Payment overview fetched successfully for guest userId: {}", userId);
				return dto;
			}

			List<Payment> payments = summary.getPayments().stream()
					.filter(p -> (p.getCreatedBy() != null && p.getCreatedBy().getId().equals(userId))
							|| (p.getUsers() != null && p.getUsers().stream()
									.anyMatch(up -> up.getUser() != null && up.getUser().getId().equals(userId))))
					.toList();

			double userTotalIncome = payments.stream().filter(p -> PaymentType.INCOME.name().equals(p.getType()))
					.mapToDouble(p -> {
						if (p.getUsers() == null)
							return 0.0;
						return p.getUsers().stream()
								.filter(up -> up.getUser() != null && up.getUser().getId().equals(userId))
								.mapToDouble(UserPayment::getAmount).sum();
					}).sum();

			double userTotalExpense = payments.stream().filter(p -> PaymentType.EXPENSE.name().equals(p.getType()))
					.mapToDouble(Payment::getAmount).sum();

			PaymentResponseDto dto = new PaymentResponseDto();
			dto.setTotalIncome(summary.getTotalIncome());
			dto.setTotalExpense(summary.getTotalExpense());
			dto.setUserTotalIncome(userTotalIncome);
			dto.setUserTotalExpense(userTotalExpense);

			LOGGER.info("Payment overview fetched successfully for userId: {}", userId);
			return dto;

		} catch (Exception e) {
			LOGGER.error("Failed to fetch payment overview for userId: {}", userId, e);
			throw new AppException("Failed to fetch payment overview");
		}
	}

	public List<OverallPaymentDto> getCombinedPayments(String userId, String role) {
		LOGGER.info("Fetching combined payments for userId: {} with role: {}", userId, role);

		try {
			List<Payment> payments;

			if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
				payments = paymentRepo.findAll();
			} else if (UsersRole.ROLE_GUEST.name().equalsIgnoreCase(role)) {
				payments = paymentRepo.findByTypeAndTaskAssignedToId(PaymentType.EXPENSE.name(), userId);
			} else {
				payments = paymentRepo.findByCreatedByIdOrUsersUserId(userId, userId);
			}

			if (UsersRole.ROLE_GUEST.name().equalsIgnoreCase(role)) {
				return payments.stream().map(payment -> {
					OverallPaymentDto dto = convertToOverallPaymentDto(payment, userId, role);
					return dto;
				}).sorted(Comparator.comparing(OverallPaymentDto::getCreatedAt).reversed())
						.collect(Collectors.toList());
			}

			List<OverallPaymentDto> incomeDtos = payments.stream()
					.filter(p -> PaymentType.INCOME.name().equals(p.getType()))
					.map(p -> convertToOverallPaymentDto(p, userId, role)).collect(Collectors.toList());

			List<OverallPaymentDto> expenseDtos = payments.stream()
					.filter(p -> PaymentType.EXPENSE.name().equals(p.getType()))
					.map(p -> convertToOverallPaymentDto(p, userId, role)).collect(Collectors.toList());

			List<OverallPaymentDto> combinedList = new ArrayList<>();
			combinedList.addAll(incomeDtos);
			combinedList.addAll(expenseDtos);

			combinedList.sort(Comparator.comparing(OverallPaymentDto::getCreatedAt).reversed());

			return combinedList;

		} catch (Exception e) {
			LOGGER.error("Failed to fetch combined payments for userId: {}", userId, e);
			throw new AppException("Failed to fetch combined payments");
		}
	}

	private OverallPaymentDto convertToOverallPaymentDto(Payment payment, String userid, String role) {
		OverallPaymentDto dto = new OverallPaymentDto();
		dto.setId(payment.getId());
		dto.setCreatedAt(payment.getCreatedAt());
		dto.setDescription(payment.getDescription());
		dto.setType(payment.getType());

		OverallPaymentDto.Attachments attachments = new OverallPaymentDto.Attachments();
		attachments.setTask(convertToTaskResponseDto(payment.getTask()));
		attachments.setFiles(payment.getFileMetadatas() == null ? List.of()
				: payment.getFileMetadatas().stream().map(this::convertToFileMetadataDto).collect(Collectors.toList()));
		dto.setAttachments(attachments);

		dto.setCreatedBy(toUserResponseDto(payment.getCreatedBy()));

		dto.setUsers(payment.getUsers() == null ? List.of()
				: payment.getUsers().stream().map(this::convertToUserPaymentDto).collect(Collectors.toList()));

		if (UsersRole.ROLE_GUEST.name().equalsIgnoreCase(role)) {
			dto.setType(PaymentType.INCOME.name());
			dto.setDebit(0.0);
			dto.setCredit(payment.getAmount());
		} else if (PaymentType.EXPENSE.name().equals(payment.getType())) {
			dto.setDebit(payment.getAmount());
			dto.setCredit(0.0);
		} else if (PaymentType.INCOME.name().equals(payment.getType())) {
			dto.setDebit(0.0);
			if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
				dto.setCredit(payment.getAmount());
			} else {
				UserPayment userPayment = payment.getUsers().stream()
						.filter(us -> us.getUser() != null && us.getUser().getId().equals(userid)).findFirst()
						.orElse(null);
				dto.setCredit(userPayment != null ? userPayment.getAmount() : 0.0);
			}
		} else {
			dto.setDebit(0.0);
			dto.setCredit(0.0);
		}

		return dto;
	}

	private TaskResponseDto convertToTaskResponseDto(Task task) {
		if (task == null)
			return null;

		TaskResponseDto dto = new TaskResponseDto();
		dto.setId(task.getId());
		dto.setTitle(task.getTitle());
		dto.setDescription(task.getDescription());
		dto.setStatus(task.getStatus());
		dto.setCreatedAt(task.getCreatedAt());
		dto.setUpdatedAt(task.getUpdatedAt());
		dto.setPaymentAmount(task.getPaymentAmount());

		if (task.getAssignedTo() != null) {
			dto.setAssignedTo(toUserResponseDto(task.getAssignedTo()));
		}
		if (task.getAssignedBy() != null) {
			dto.setAssignedBy(toUserResponseDto(task.getAssignedBy()));
		}

		return dto;
	}

	private UserPaymentDto convertToUserPaymentDto(UserPayment userPayment) {
		if (userPayment == null)
			return null;

		UserPaymentDto dto = new UserPaymentDto();
		dto.setId(userPayment.getId());
		dto.setAmount(userPayment.getAmount());
		dto.setCreatedAt(userPayment.getCreatedAt());

		if (userPayment.getUser() != null) {
			dto.setUser(toUserResponseDto(userPayment.getUser()));
		}

		return dto;
	}

	private FileMetadataDto convertToFileMetadataDto(FileMetadata fileMetadata) {
		if (fileMetadata == null)
			return null;

		FileMetadataDto dto = new FileMetadataDto();
		dto.setId(fileMetadata.getId());
		dto.setFileName(fileMetadata.getFileName());
		dto.setFileType(fileMetadata.getFileType());
		dto.setReceiptFile(fileMetadata.getReceiptFile());
		dto.setFileSize(fileMetadata.getFileSize());

		return dto;
	}

}
