package com.mgmt.residency.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mgmt.residency.constants.PaymentType;
import com.mgmt.residency.constants.UserStatus;
import com.mgmt.residency.constants.UsersRole;
import com.mgmt.residency.entity.Payment;
import com.mgmt.residency.entity.Task;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.exception.AppException;
import com.mgmt.residency.repository.AnnouncementRepository;
import com.mgmt.residency.repository.PaymentRepository;
import com.mgmt.residency.repository.TaskRepository;
import com.mgmt.residency.repository.UserRepository;
import com.mgmt.residency.response.dto.DashboardSummaryDto;
import com.mgmt.residency.response.dto.GenericMessage;

@Service
public class UserService {

	private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);

	@Autowired
	private UserRepository userRepo;

	@Autowired
	private AnnouncementRepository announcementRepo;

	@Autowired
	private TaskRepository taskRepo;

	@Autowired
	private PaymentRepository paymentRepo;

	public List<User> getAllUsers(String searchText, String roleType, String status) {
		try {
			LOGGER.info("Fetching all users with searchText='{}', roleType='{}', status='{}'", searchText, roleType,
					status);
			if (searchText == null) {
				searchText = "";
			}

			if ("ALL".equalsIgnoreCase(roleType)) {
				roleType = null;
			}
			if ("ALL".equalsIgnoreCase(status)) {
				status = null;
			}

			return userRepo.searchUsers(searchText.trim(), roleType, status);
		} catch (Exception e) {
			LOGGER.error("Error fetching all users: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	public GenericMessage toggleUserStatus(String loggedInUserId, String targetUserId) {
		try {
			LOGGER.info("Toggling user status by admin userId: {}, targetUserId: {}", loggedInUserId, targetUserId);
			User adminUser = userRepo.findByIdAndRole(loggedInUserId, UsersRole.ROLE_ADMIN.name());
			if (adminUser == null) {
				LOGGER.warn("User {} is not ADMIN, cannot update status", loggedInUserId);
				throw new AppException("Only ADMIN users can update status");
			}

			User targetUser = userRepo.findById(targetUserId)
					.orElseThrow(() -> new AppException("Target user not found"));

			String currentStatus = targetUser.getStatus();

			String newStatus = UserStatus.ACTIVE.name().equalsIgnoreCase(currentStatus) ? UserStatus.INACTIVE.name()
					: UserStatus.ACTIVE.name();

			targetUser.setStatus(newStatus);

			userRepo.save(targetUser);
			LOGGER.info("User status updated to {} for userId {}", newStatus, targetUserId);

			GenericMessage response = new GenericMessage();
			response.setMessage("User status updated to " + newStatus);
			response.setTime(LocalDateTime.now());

			return response;

		} catch (Exception e) {
			LOGGER.error("Error toggling user status: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	public List<User> getActiveUsers(String searchText, String role, String designation) {
		try {
			LOGGER.info("Fetching active users with searchText='{}', role='{}', designation='{}'", searchText, role,
					designation);
			if (searchText == null || searchText.trim().isEmpty()) {
				searchText = null;
			}

			if ("ALL".equalsIgnoreCase(role)) {
				role = null;
			}

			if ("ALL".equalsIgnoreCase(designation)) {
				designation = null;
			}

			return userRepo.searchActiveUsersByKey(searchText, role, designation);
		} catch (Exception e) {
			LOGGER.error("Error fetching active users: {}", e.getMessage(), e);
			throw new AppException("Error fetching users: " + e.getMessage());
		}
	}

	public List<User> getAllUsers() {
		try {
			LOGGER.info("Fetching all active non-guest users");
			List<User> users = userRepo.findAllByRoleNotAndStatus(UsersRole.ROLE_GUEST.name(),
					UserStatus.ACTIVE.name());

			if (users == null || users.isEmpty()) {
				LOGGER.info("No active non-guest users found");
				return Collections.emptyList();
			}

			return users;

		} catch (Exception e) {
			LOGGER.error("Failed to fetch users: {}", e.getMessage(), e);
			throw new AppException("Failed to fetch users");
		}
	}

	public DashboardSummaryDto getDashboardSummary(String userId, String role) {
		DashboardSummaryDto dto = new DashboardSummaryDto();

		try {
			LOGGER.info("Fetching dashboard summary for userId: {}, role: {}", userId, role);
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime tenDaysAgo = now.minusDays(10);

			LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
			LocalDateTime endOfToday = startOfToday.plusDays(1).minusNanos(1);

			if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
				LOGGER.info("Fetching user analytics for admin");
				List<User> users = userRepo.findAllByCreatedAtAfter(tenDaysAgo);
				long totalUsers = users.size();
				long activeUsers = users.stream().filter(u -> UserStatus.ACTIVE.name().equalsIgnoreCase(u.getStatus()))
						.count();
				long inactiveUsers = totalUsers - activeUsers;

				DashboardSummaryDto.UserAnalyticsDto userAnalytics = new DashboardSummaryDto.UserAnalyticsDto();
				userAnalytics.setTotalUsers((int) totalUsers);
				userAnalytics.setActiveUsers((int) activeUsers);
				userAnalytics.setInactiveUsers((int) inactiveUsers);

				dto.setUserAnalytics(userAnalytics);
			}

			List<Task> tasks;
			if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
				LOGGER.info("Fetching all tasks for admin");
				tasks = taskRepo.findAllByCreatedAtAfter(tenDaysAgo);
			} else {
				LOGGER.info("Fetching tasks assigned or created by user: {}", userId);
				tasks = taskRepo.findAllByAssignedByIdOrAssignedToIdAndCreatedAtAfter(userId, userId, tenDaysAgo);
			}
			if (!tasks.isEmpty()) {
				Map<String, Long> statusCounts = tasks.stream()
						.collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));

				DashboardSummaryDto.TaskOverviewDto taskOverview = new DashboardSummaryDto.TaskOverviewDto();
				taskOverview.setCompleted(statusCounts.getOrDefault("COMPLETED", 0L).intValue());
				taskOverview.setPending(statusCounts.getOrDefault("PENDING", 0L).intValue());
				taskOverview.setInProgress(statusCounts.getOrDefault("INPROGRESS", 0L).intValue());
				dto.setTaskOverview(taskOverview);
			}
			int totalAnnouncements;
			if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
				LOGGER.info("Fetching announcements count for admin");
				totalAnnouncements = announcementRepo.countByCreatedAtAfter(tenDaysAgo);
			} else {
				LOGGER.info("Fetching announcements count for user: {}", userId);
				totalAnnouncements = announcementRepo.countByAnnouncementViewStatusUserIdAndCreatedAtAfter(userId,
						tenDaysAgo);
			}
			dto.setTotalAnnouncements(totalAnnouncements);

			if (UsersRole.ROLE_GUEST.name().equalsIgnoreCase(role)) {
				LOGGER.info("Fetching today's expenses for guest user: {}", userId);
				List<Payment> paymentsTodayForGuest = paymentRepo
						.findByCreatedAtBetweenAndTaskAssignedToId(startOfToday, endOfToday, userId);
				if (!paymentsTodayForGuest.isEmpty()) {
					double totalEarnings = paymentsTodayForGuest.stream()
							.filter(p -> PaymentType.EXPENSE.name().equals(p.getType()))
							.mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();

					dto.setTodayIncome(totalEarnings);
				}
			} else {
				LOGGER.info("Fetching today's income and expenses for user: {}", userId);
				List<Payment> paymentsToday = paymentRepo
						.findByCreatedAtBetweenAndCreatedByIdOrUsersUserId(startOfToday, endOfToday, userId, userId);

				double totalIncome = paymentsToday.stream().flatMap(payment -> payment.getUsers().stream())
						.filter(up -> up.getUser() != null && userId.equals(up.getUser().getId()))
						.mapToDouble(up -> up.getAmount() != null ? up.getAmount() : 0).sum();

				double totalExpense = paymentsToday.stream().filter(p -> PaymentType.EXPENSE.name().equals(p.getType()))
						.mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();

				dto.setTodayIncome(totalIncome);
				dto.setTodayExpenses(totalExpense);
			}
			LOGGER.info("Dashboard summary successfully fetched for userId: {}", userId);
			return dto;

		} catch (Exception e) {
			LOGGER.error("Failed to fetch dashboard summary for userId: {}, error: {}", userId, e.getMessage(), e);
			throw new AppException("Failed to fetch dashboard summary");
		}
	}
}
