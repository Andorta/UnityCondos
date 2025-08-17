package com.mgmt.residency.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mgmt.residency.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

	Task findTaskByIdAndAssignedById(Long taskId, String assignedByUserId);

	Task findTaskByIdAndAssignedByIdAndStatusNot(Long taskId, String assignedByUserId, String name);

	Task findByIdAndAssignedByIdOrIdAndAssignedToId(Long taskIdOne, String assignedByUserId, Long taskIdTwo,
			String assignedToUserId);

	List<Task> findAllByAssignedByIdOrAssignedToId(String assignedByUserId, String assignedToUserId);

	@Query("""
			    SELECT t FROM Task t
			    WHERE (t.assignedBy.id = :userId OR t.assignedTo.id = :userId)
			    AND (:status IS NULL OR LOWER(t.status) = LOWER(:status))
			    AND (
			        :titleOrAssignToName IS NULL OR
			        LOWER(t.title) LIKE LOWER(CONCAT('%', :titleOrAssignToName, '%')) OR
			        LOWER(t.assignedTo.firstName) LIKE LOWER(CONCAT('%', :titleOrAssignToName, '%')) OR
			        LOWER(t.assignedTo.lastName) LIKE LOWER(CONCAT('%', :titleOrAssignToName, '%')) OR
			        LOWER(CONCAT(t.assignedTo.firstName, ' ', t.assignedTo.lastName)) LIKE LOWER(CONCAT('%', :titleOrAssignToName, '%'))
			    )
			""")
	List<Task> searchTasks(@Param("userId") String userId, @Param("titleOrAssignToName") String titleOrAssignToName,
			@Param("status") String status);

	List<Task> findAllByStatus(String name);

	List<Task> findAllByStatusAndPaymentNull(String name);

	Task findByIdAndStatus(Long taskId, String name);

	List<Task> findAllByCreatedAtAfter(LocalDateTime tenDaysAgo);

	List<Task> findAllByAssignedByIdOrAssignedToIdAndCreatedAtAfter(String userId, String userId2,
			LocalDateTime tenDaysAgo);

}
