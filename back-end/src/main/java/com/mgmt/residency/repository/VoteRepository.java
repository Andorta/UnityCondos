package com.mgmt.residency.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mgmt.residency.entity.Vote;

public interface VoteRepository  extends JpaRepository<Vote, Long>{

}
