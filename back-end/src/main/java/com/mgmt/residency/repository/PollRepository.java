package com.mgmt.residency.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mgmt.residency.entity.Poll;

public interface PollRepository extends JpaRepository<Poll, Long> {

	List<Poll> findAllByIsActive(boolean isActive);

	Poll findByIdAndVotesVotedByIdNot(Long pollId, String userId);

	Poll findByIdAndIsActive(Long pollId, boolean isActive);

	Poll findByIdAndIsActiveAndCreatedById(Long pollId, boolean isActive, String adminId);

	Poll findByIdAndVotesVotedByIdNotAndIsActive(Long pollId, String userId, boolean isActive);

	Poll findByIdAndCreatedById(Long pollId, String userId);

}
