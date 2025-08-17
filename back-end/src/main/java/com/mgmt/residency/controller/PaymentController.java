package com.mgmt.residency.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mgmt.residency.entity.Payment;
import com.mgmt.residency.request.dto.IncomePaymentRequestDto;
import com.mgmt.residency.response.dto.OverallPaymentDto;
import com.mgmt.residency.response.dto.PaymentDetailsResponseDto;
import com.mgmt.residency.response.dto.PaymentResponseDto;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.service.PaymentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/payment")
@SecurityRequirement(name = "token")
@CrossOrigin("*")
public class PaymentController {

	private static final Logger LOGGER = LoggerFactory.getLogger(PaymentController.class);

	@Autowired
	private PaymentService paymentService;

	@PostMapping("/expense")
	public ResponseEntity<Payment> createExpensePayment(@RequestPart("paymentDetails") String paymentDetails,
			@RequestPart("files") MultipartFile[] files, @AuthenticationPrincipal UserDetailsImpl userDetails) {

		LOGGER.info("Creating expense payment for userId: {}", userDetails.getId());

		Payment payment = paymentService.createExpensePayment(userDetails.getId(), paymentDetails, files);
		return ResponseEntity.status(HttpStatus.CREATED).body(payment);
	}

	@PostMapping("/income")
	public ResponseEntity<Payment> createIncomePayment(@RequestBody @Valid IncomePaymentRequestDto dto,
			@AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("Creating income payment for userId: {}", userDetails.getId());
		Payment payment = paymentService.createIncomePayment(userDetails.getId(), dto);
		return ResponseEntity.status(HttpStatus.CREATED).body(payment);
	}

	@GetMapping("/summary")
	public ResponseEntity<List<PaymentDetailsResponseDto>> getPaymentsGroupedByUserAndDay(
			@AuthenticationPrincipal UserDetailsImpl user) {

		LOGGER.info("Fetching grouped payment details for userId: {}, role: {}", user.getId(), user.getRole());

		return ResponseEntity.ok(paymentService.getPaymentsGroupedByUserAndDay(user.getId(), user.getRole()));
	}

	@GetMapping("/overview")
	public ResponseEntity<PaymentResponseDto> getPaymentOverview(@AuthenticationPrincipal UserDetailsImpl user) {

		LOGGER.info("Fetching payment overview for userId: {}", user.getId());
		PaymentResponseDto overview = paymentService.getPaymentOverview(user.getId(), user.getRole());
		return ResponseEntity.ok(overview);
	}

	@GetMapping("/combined")
	public ResponseEntity<List<OverallPaymentDto>> getCombinedPayments(@AuthenticationPrincipal UserDetailsImpl user) {

		List<OverallPaymentDto> payments = paymentService.getCombinedPayments(user.getId(), user.getRole());
		return ResponseEntity.ok(payments);
	}

}
