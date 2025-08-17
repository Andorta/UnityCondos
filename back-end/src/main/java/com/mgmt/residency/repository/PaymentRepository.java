package com.mgmt.residency.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mgmt.residency.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

	List<Payment> findAllByCreatedById(String userId);

	Payment findByIdAndCreatedById(Long paymentId, String userId);

	List<Payment> findAllByOrderByCreatedAtDesc();

	List<Payment> findAllByCreatedByIdAndType(String userId, String name);

	List<Payment> findByType(String name);

	List<Payment> findByTypeAndCreatedById(String name, String userId);

	List<Payment> findByCreatedById(String userId);

	List<Payment> findByTaskAssignedToId(String taskAssignToId);

	List<Payment> findByTypeAndTaskAssignedToId(String name, String userId);

	List<Payment> findByCreatedByIdOrUsersUserId(String userId, String userId2);

	Payment findByTypeAndTaskAssignedToIdAndCreatedAt(String name, String userId, LocalDateTime now);

	List<Payment> findByCreatedAt(LocalDateTime now);

	List<Payment> findByCreatedAtAndTaskAssignedToId(LocalDateTime now, String userId);

	List<Payment> findByCreatedAtBetweenAndTaskAssignedToId(LocalDateTime startOfToday, LocalDateTime endOfToday,
			String userId);

	List<Payment> findByCreatedAtBetween(LocalDateTime startOfToday, LocalDateTime endOfToday);

	List<Payment> findByCreatedAtBetweenAndCreatedByIdOrUsersUserId(LocalDateTime startOfToday,
			LocalDateTime endOfToday, String userId, String userId2);


}
