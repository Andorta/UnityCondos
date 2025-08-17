package com.mgmt.residency.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mgmt.residency.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

	Notification findByReceiverIdAndId(String loggedUser, long notificationId);

	List<Notification> findByReceiverIdAndViewStatusAndDateBetweenOrderByDateDesc(String userId, boolean b,
			LocalDateTime twoDaysAgo, LocalDateTime currentDate);

	List<Notification> findByReceiverIdAndDateBetweenAndViewStatusTrueOrderByDateDesc(String userId,
			LocalDateTime twoDaysAgo, LocalDateTime currentDate);

	List<Notification> findByReceiverIdAndDateBetweenAndViewStatusFalseOrderByDateDesc(String userId,
			LocalDateTime sevenDaysAgo, LocalDateTime currentDate);

}
