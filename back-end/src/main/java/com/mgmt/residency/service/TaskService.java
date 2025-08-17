package com.mgmt.residency.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mgmt.residency.constants.AppConstant;
import com.mgmt.residency.constants.NotificationType;
import com.mgmt.residency.constants.TaskStatus;
import com.mgmt.residency.constants.UsersRole;
import com.mgmt.residency.entity.Task;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.exception.AppException;
import com.mgmt.residency.exception.NotFoundException;
import com.mgmt.residency.repository.TaskRepository;
import com.mgmt.residency.repository.UserRepository;
import com.mgmt.residency.request.dto.TaskRequestDto;
import com.mgmt.residency.response.dto.DetailedTaskResponseDto;
import com.mgmt.residency.response.dto.TaskResponseDto;
import com.mgmt.residency.response.dto.UserResponseDto;

@Service
public class TaskService {

	@Autowired
	private TaskRepository taskRepo;

	@Autowired
	private UserRepository userRepo;

	@Autowired
	NotificationService notificationService;

	private static final Logger LOGGER = LoggerFactory.getLogger(TaskService.class);

	public Task createTask(TaskRequestDto dto, String assignedByUserId) {
		try {
			LOGGER.info("Creating task: title='{}', assignedById='{}', assignedToId='{}'", dto.getTitle(),
					dto.getAssignedToId(), assignedByUserId);

			User assignedBy = userRepo.findByIdAndRoleNot(assignedByUserId, UsersRole.ROLE_GUEST.name());
			if (assignedBy == null) {
				LOGGER.warn("AssignedBy user not found: id={}", assignedByUserId);
				throw new NotFoundException("AssignedBy user not found");
			}
			User assignedTo = null;
			if (!assignedByUserId.equals(dto.getAssignedToId())) {
				assignedTo = userRepo.findByIdAndRoleNot(dto.getAssignedToId(), UsersRole.ROLE_ADMIN.name());
				if (assignedTo == null) {
					LOGGER.warn("AssignedTo user not found or is ADMIN: id={}", dto.getAssignedToId());
					throw new NotFoundException("AssignedTo user not found");
				}
			} else {
				assignedTo = assignedBy;
			}

			Task task = new Task();
			task.setTitle(dto.getTitle());
			task.setDescription(dto.getDescription());
			task.setAssignedBy(assignedBy);
			task.setAssignedTo(assignedTo);
			task.setPaymentAmount(dto.getPaymentAmount());
			task.setCreatedAt(LocalDateTime.now());
			task.setUpdatedAt(LocalDateTime.now());
			task.setStatus(TaskStatus.PENDING.name());

			Task savedTask = taskRepo.save(task);
			LOGGER.info("Task created successfully: id={}, title='{}'", savedTask.getId(), savedTask.getTitle());

			if (!assignedBy.getId().equals(assignedTo.getId())) {
				StringBuilder message = new StringBuilder(AppConstant.TASK_ASSIGNMENT_NOTIFICATION_MESSAGE)
						.append(savedTask.getTitle());
				notificationService.sendNotification(assignedBy, assignedTo, message, NotificationType.TASK.name());
				LOGGER.debug("Notification sent to assigned user: id={}", assignedTo.getId());
			}

			return savedTask;

		} catch (Exception e) {
			e.printStackTrace();
			LOGGER.error("Failed to create task: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	public Task updateTask(Long taskId, TaskRequestDto dto, String assignedByUserId) {
		try {
			LOGGER.info("Updating task: id={}, title='{}'", taskId, dto.getTitle());

			Task existingTask = taskRepo.findTaskByIdAndAssignedByIdAndStatusNot(taskId, assignedByUserId,
					TaskStatus.COMPLETED.name());

			if (existingTask == null) {
				throw new NotFoundException("Task not found");
			}

			User assignedTo;
			String assignedToId = dto.getAssignedToId();

			if (!assignedToId.equals(assignedByUserId)) {
				assignedTo = userRepo.findByIdAndRoleNot(assignedToId, UsersRole.ROLE_ADMIN.name());
				if (assignedTo == null) {
					LOGGER.warn("AssignedTo user not found or is ADMIN: id={}", assignedToId);
					throw new NotFoundException("AssignedTo user not found");
				}
			} else {
				assignedTo = existingTask.getAssignedBy();
			}

			boolean updated = false;

			if (dto.getTitle() != null && !dto.getTitle().equals(existingTask.getTitle())) {
				existingTask.setTitle(dto.getTitle());
				updated = true;
			}

			if (dto.getDescription() != null && !dto.getDescription().equals(existingTask.getDescription())) {
				existingTask.setDescription(dto.getDescription());
				updated = true;
			}

			if (dto.getPaymentAmount() != null && dto.getPaymentAmount() != existingTask.getPaymentAmount()) {
				existingTask.setPaymentAmount(dto.getPaymentAmount());
				updated = true;
			}

			if (!existingTask.getAssignedTo().getId().equals(assignedTo.getId())) {
				existingTask.setAssignedTo(assignedTo);
				updated = true;
			}

			if (updated) {
				existingTask.setUpdatedAt(LocalDateTime.now());
				Task updatedTask = taskRepo.save(existingTask);
				LOGGER.info("Task updated successfully: id={}, title='{}'", updatedTask.getId(),
						updatedTask.getTitle());
				if (!existingTask.getAssignedBy().getId().equals(assignedTo.getId())
						&& !existingTask.getAssignedTo().getId().equals(assignedTo.getId())) {
					StringBuilder message = new StringBuilder(AppConstant.TASK_ASSIGNMENT_NOTIFICATION_MESSAGE)
							.append(updatedTask.getTitle());
					notificationService.sendNotification(existingTask.getAssignedBy(), assignedTo, message,
							NotificationType.TASK.name());
					LOGGER.debug("Notification sent to reassigned user: id={}", assignedTo.getId());
				}
				return updatedTask;
			} else {
				LOGGER.info("No changes detected for task: id={}", taskId);
				return existingTask;
			}

		} catch (Exception e) {
			LOGGER.error("Failed to update task: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	public Task updateTaskStatus(Long taskId, String userId, String newStatus) {
		try {
			Task task = taskRepo.findByIdAndAssignedByIdOrIdAndAssignedToId(taskId, userId, taskId, userId);

			if (task == null) {
				throw new AppException("Task not found.");
			}
			if (task.getStatus().equals(newStatus) || task.getStatus().equals(TaskStatus.COMPLETED.name())) {
				return task;
			}

			if (!isValidStatus(newStatus)) {
				throw new AppException("Invalid task status: " + newStatus);
			}

			task.setStatus(newStatus);
			task.setUpdatedAt(LocalDateTime.now());

			Task updatedTask = taskRepo.save(task);
			LOGGER.info("Task status updated: id={}, newStatus={}", taskId, newStatus);
			return updatedTask;

		} catch (Exception e) {
			LOGGER.error("Failed to update task status: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	private boolean isValidStatus(String status) {
		return TaskStatus.INPROGRESS.name().equals(status) || TaskStatus.COMPLETED.name().equals(status);
	}

	public void deleteTask(Long taskId, String assignedByUserId) {
		try {
			Task deleteTask = taskRepo.findTaskByIdAndAssignedByIdAndStatusNot(taskId, assignedByUserId,
					TaskStatus.COMPLETED.name());

			if (deleteTask == null) {
				throw new NotFoundException("Task not found");
			}
			taskRepo.delete(deleteTask);
			LOGGER.info("Task deleted successfully: id={}", taskId);
		} catch (Exception e) {
			LOGGER.error("Failed to delete task: {}", e.getMessage(), e);
			throw new AppException(e.getMessage());
		}
	}

	public DetailedTaskResponseDto getTasksForUser(String userId, String role, String titleOrAssignToName,
			String status) {
		try {
			List<Task> tasks = taskRepo.searchTasks(userId, titleOrAssignToName, status);

			if (tasks.isEmpty()) {
				return new DetailedTaskResponseDto();
			}

			List<TaskResponseDto> myTasks = new ArrayList<>();
			List<TaskResponseDto> assignedTasks = new ArrayList<>();

			for (Task task : tasks) {
				if (userId.equals(task.getAssignedTo().getId())) {
					myTasks.add(convertToDto(task));
				}
				if (userId.equals(task.getAssignedBy().getId())) {
					assignedTasks.add(convertToDto(task));
				}
			}

			Map<String, Integer> statusPriority = Map.of(TaskStatus.PENDING.name(), 1, TaskStatus.INPROGRESS.name(), 2,
					TaskStatus.COMPLETED.name(), 3);

			Comparator<TaskResponseDto> statusComparator = Comparator
					.comparingInt(task -> statusPriority.getOrDefault(task.getStatus(), Integer.MAX_VALUE));

			myTasks.sort(statusComparator);
			assignedTasks.sort(statusComparator);

			DetailedTaskResponseDto responseDto = new DetailedTaskResponseDto();
			switch (UsersRole.valueOf(role)) {
			case ROLE_ADMIN:
				responseDto.setAssignedTasks(assignedTasks);
				responseDto.setMyTasks(Collections.emptyList());
				break;
			case ROLE_GUEST:
				responseDto.setMyTasks(myTasks);
				responseDto.setAssignedTasks(Collections.emptyList());
				break;
			case ROLE_RESIDENT:
				responseDto.setMyTasks(myTasks);
				responseDto.setAssignedTasks(assignedTasks);
				break;
			}

			return responseDto;
		} catch (Exception e) {
			LOGGER.error("Failed to fetch tasks for user {}: {}", userId, e.getMessage(), e);
			throw new AppException("Unable to fetch tasks");
		}
	}

	private TaskResponseDto convertToDto(Task task) {
		TaskResponseDto dto = new TaskResponseDto();
		dto.setId(task.getId());
		dto.setTitle(task.getTitle());
		dto.setDescription(task.getDescription());
		dto.setStatus(task.getStatus());
		dto.setCreatedAt(task.getCreatedAt());
		dto.setUpdatedAt(task.getUpdatedAt());
		dto.setPaymentAmount(task.getPaymentAmount());

		if (task.getAssignedTo() != null) {
			UserResponseDto assignedTo = new UserResponseDto();
			assignedTo.setId(task.getAssignedTo().getId());
			assignedTo.setFirstName(task.getAssignedTo().getFirstName());
			assignedTo.setLastName(task.getAssignedTo().getLastName());
			assignedTo.setEmail(task.getAssignedTo().getEmail());
			dto.setAssignedTo(assignedTo);
		}

		if (task.getAssignedBy() != null) {
			UserResponseDto assignedBy = new UserResponseDto();
			assignedBy.setId(task.getAssignedBy().getId());
			assignedBy.setFirstName(task.getAssignedBy().getFirstName());
			assignedBy.setLastName(task.getAssignedBy().getLastName());
			assignedBy.setEmail(task.getAssignedBy().getEmail());
			dto.setAssignedBy(assignedBy);
		}

		return dto;
	}

	public List<Task> getCompletedTasks(String userId) {
		try {
			List<Task> tasks = taskRepo.findAllByStatusAndPaymentNull(TaskStatus.COMPLETED.name());
			return tasks != null ? tasks : Collections.emptyList();
		} catch (Exception e) {
			LOGGER.error("Failed to fetch completed tasks for userId {}: {}", userId, e.getMessage(), e);
			throw new AppException("Failed to fetch completed tasks");
		}
	}

}
