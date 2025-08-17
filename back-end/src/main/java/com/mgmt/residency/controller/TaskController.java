package com.mgmt.residency.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mgmt.residency.entity.Task;
import com.mgmt.residency.request.dto.TaskRequestDto;
import com.mgmt.residency.response.dto.DetailedTaskResponseDto;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.service.TaskService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/task")
@SecurityRequirement(name = "token")
@CrossOrigin("*")
public class TaskController {

	private static final Logger LOGGER = LoggerFactory.getLogger(TaskController.class);

	@Autowired
	private TaskService taskService;

	@PostMapping
	public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequestDto taskRequestDto,
			@AuthenticationPrincipal UserDetailsImpl customUser) {
		LOGGER.info("Creating task for userId: {}", customUser.getId());
		Task task = taskService.createTask(taskRequestDto, customUser.getId());
		LOGGER.debug("Task created: {}", task);
		return ResponseEntity.status(HttpStatus.CREATED).body(task);
	}

	@PutMapping("/{taskId}")
	public ResponseEntity<Task> updateTask(@PathVariable(name = "taskId") Long taskId,
			@Valid @RequestBody TaskRequestDto taskRequestDto, @AuthenticationPrincipal UserDetailsImpl customUser) {
		LOGGER.info("Updating taskId: {} for userId: {}", taskId, customUser.getId());
		Task task = taskService.updateTask(taskId, taskRequestDto, customUser.getId());
		LOGGER.debug("Task updated: {}", task);
		return ResponseEntity.ok(task);
	}

	@PutMapping("/{taskId}/{status}")
	public ResponseEntity<Task> updateStatus(@PathVariable(name = "taskId") Long taskId,
			@PathVariable(name = "status") String status, @AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("Updating status of taskId: {} to '{}' for userId: {}", taskId, status, userDetails.getId());
		Task updatedTask = taskService.updateTaskStatus(taskId, userDetails.getId(), status);
		LOGGER.debug("Task status updated: {}", updatedTask);
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(updatedTask);
	}

	@GetMapping
	public ResponseEntity<DetailedTaskResponseDto> getAllTasks(@AuthenticationPrincipal UserDetailsImpl userDetails,
			@RequestParam(name = "titleOrAssignToName", required = false) String titleOrAssignToName,
			@RequestParam(name = "status", required = false) String status) {

		LOGGER.info("Fetching all tasks for userId: {}, role: {}", userDetails.getId(), userDetails.getRole());
		DetailedTaskResponseDto response = taskService.getTasksForUser(userDetails.getId(), userDetails.getRole(),
				titleOrAssignToName, status);
		LOGGER.debug("Fetched tasks: {}", response);
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{taskId}")
	public ResponseEntity<String> deleteTask(@PathVariable(name = "taskId") Long taskId,
			@AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("Deleting taskId: {} for userId: {}", taskId, userDetails.getId());
		taskService.deleteTask(taskId, userDetails.getId());
		LOGGER.debug("Task deleted: {}", taskId);
		return ResponseEntity.ok("Task deleted successfully.");
	}



	@GetMapping("/completed-tasks")
	public ResponseEntity<List<Task>> getCompletedTasks(@AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("Fetching completed tasks for userId: {}", userDetails.getId());
		List<Task> tasks = taskService.getCompletedTasks(userDetails.getId());
		LOGGER.debug("Completed tasks fetched: {}", tasks.size());
		return ResponseEntity.ok(tasks);
	}

}
