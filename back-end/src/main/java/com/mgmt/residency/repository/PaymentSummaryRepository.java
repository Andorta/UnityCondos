package com.mgmt.residency.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mgmt.residency.entity.PaymentSummary;

@Repository
public interface PaymentSummaryRepository extends JpaRepository<PaymentSummary, Long> {

	PaymentSummary findTopByOrderByCreatedAtDesc();

	List<PaymentSummary> findAllByOrderByCreatedAtDesc();

	PaymentSummary findByPaymentsCreatedByIdAndPaymentsType(String userId, String name);

	PaymentSummary findByPaymentsType(String name);

}
