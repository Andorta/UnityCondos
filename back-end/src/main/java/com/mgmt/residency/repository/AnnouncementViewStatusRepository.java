package com.mgmt.residency.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mgmt.residency.entity.AnnouncementViewStatus;

@Repository
public interface AnnouncementViewStatusRepository extends JpaRepository<AnnouncementViewStatus, Long>{

	AnnouncementViewStatus findByAnnouncementIdAndUserId(Long announcementId, String userId);

	List<AnnouncementViewStatus> findAllByUserId(String userId);

}
