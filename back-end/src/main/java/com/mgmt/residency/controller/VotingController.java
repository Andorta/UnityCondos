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
import org.springframework.web.bind.annotation.RestController;

import com.mgmt.residency.entity.Poll;
import com.mgmt.residency.request.dto.PollRequestDto;
import com.mgmt.residency.request.dto.VoteRequestDto;
import com.mgmt.residency.response.dto.CommonPollResponseDto;
import com.mgmt.residency.security.service.UserDetailsImpl;
import com.mgmt.residency.service.VotingService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/voting")
@SecurityRequirement(name = "token")
@CrossOrigin("*")
public class VotingController {

	private static final Logger LOGGER = LoggerFactory.getLogger(VotingController.class);

	@Autowired
	private VotingService votingService;

	@PostMapping("/poll")
	public ResponseEntity<Poll> createPoll(@Valid @RequestBody PollRequestDto pollRequestDto,
			@AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("User [{}] is creating a new poll", userDetails.getId());
		Poll createdPoll = votingService.createPoll(pollRequestDto, userDetails.getId());
		LOGGER.info("Poll [{}] created successfully", createdPoll.getId());
		return ResponseEntity.status(HttpStatus.CREATED).body(createdPoll);
	}

	@PutMapping("/poll/{pollId}")
	public ResponseEntity<Poll> updatePoll(@PathVariable("pollId") Long pollId,
			@Valid @RequestBody PollRequestDto pollRequestDto, @AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("User [{}] is updating poll [{}]", userDetails.getId(), pollId);
		Poll updatedPoll = votingService.updatePoll(pollId, pollRequestDto, userDetails.getId());
		LOGGER.info("Poll [{}] updated successfully", updatedPoll.getId());
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(updatedPoll);
	}

	@GetMapping("/polls")
	public ResponseEntity<List<CommonPollResponseDto>> getAllPollsForUser(
			@AuthenticationPrincipal UserDetailsImpl userDetail) {
		LOGGER.info("User [{}] is fetching all polls", userDetail.getId());
		List<CommonPollResponseDto> polls = votingService.getAllPollsForUser(userDetail.getId(), userDetail.getRole());
		LOGGER.info("Fetched {} polls", polls.size());
		return ResponseEntity.ok(polls);
	}

	@PostMapping
	public ResponseEntity<String> castVote(@Valid @RequestBody VoteRequestDto voteRequestDto,
			@AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("User [{}] is casting vote for poll [{}]", userDetails.getId(), voteRequestDto.getPollId());
		votingService.castVote(voteRequestDto, userDetails.getId());
		LOGGER.info("Vote cast successfully by user [{}]", userDetails.getId());
		return ResponseEntity.status(HttpStatus.CREATED).body("Vote cast successfully");
	}

	@PutMapping("/{pollId}")
	public ResponseEntity<String> closePoll(@PathVariable(name = "pollId") Long pollId,
			@AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("User [{}] is closing poll [{}]", userDetails.getId(), pollId);
		votingService.closePoll(pollId, userDetails.getId());
		LOGGER.info("Poll [{}] closed successfully by user [{}]", pollId, userDetails.getId());
		return ResponseEntity.ok("Poll closed successfully");
	}

	@DeleteMapping("/{pollId}")
	public ResponseEntity<String> deletePoll(@PathVariable(name = "pollId") Long pollId,
			@AuthenticationPrincipal UserDetailsImpl userDetails) {
		LOGGER.info("User [{}] with role [{}] is deleting poll [{}]", userDetails.getId(), userDetails.getRole(),
				pollId);
		votingService.deletePoll(pollId, userDetails.getId());
		LOGGER.info("Poll [{}] deleted successfully by user [{}]", pollId, userDetails.getId());
		return ResponseEntity.ok("Poll deleted successfully");
	}

}
