package com.mgmt.residency.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mgmt.residency.entity.Announcement;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

	Announcement findByIdAndCreatedById(Long announcementId, String userId);

	List<Announcement> findAllByOrderByCreatedAtDesc();

	List<Announcement> findAllByAnnouncementViewStatusUserId(String userId);

	int countByCreatedAtAfter(LocalDateTime tenDaysAgo);

	int countByAnnouncementViewStatusUserIdAndCreatedAtAfter(String userId, LocalDateTime tenDaysAgo);

}
