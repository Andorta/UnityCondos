package com.mgmt.residency.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mgmt.residency.constants.AppConstant;
import com.mgmt.residency.constants.NotificationType;
import com.mgmt.residency.constants.UsersRole;
import com.mgmt.residency.entity.Poll;
import com.mgmt.residency.entity.User;
import com.mgmt.residency.entity.Vote;
import com.mgmt.residency.exception.AppException;
import com.mgmt.residency.exception.NotFoundException;
import com.mgmt.residency.repository.PollRepository;
import com.mgmt.residency.repository.UserRepository;
import com.mgmt.residency.repository.VoteRepository;
import com.mgmt.residency.request.dto.PollRequestDto;
import com.mgmt.residency.request.dto.VoteRequestDto;
import com.mgmt.residency.response.dto.CommonPollResponseDto;
import com.mgmt.residency.response.dto.CommonPollResponseDto.OptionResult;
import com.mgmt.residency.response.dto.UserResponseDto;

@Service
public class VotingService {

	@Autowired
	PollRepository pollRepository;

	@Autowired
	UserRepository userRepo;

	@Autowired
	VoteRepository voteRepo;

	@Autowired
	NotificationService notificationService;

	private static final Logger LOGGER = LoggerFactory.getLogger(VotingService.class);

	public Poll createPoll(PollRequestDto dto, String userId) {
		LOGGER.info("Creating poll by userId: {}", userId);
		try {
			User user = userRepo.findByIdAndRole(userId, UsersRole.ROLE_ADMIN.name());
			if (user == null) {
				throw new NotFoundException("User not found");
			}
			validatePollOptions(dto.getOptions());

			Poll poll = new Poll();
			poll.setQuestion(dto.getQuestion());
			poll.setOptions(dto.getOptions());
			poll.setCreatedAt(LocalDateTime.now());
			poll.setCreatedBy(user);
			poll.setActive(true);
			Poll save = pollRepository.save(poll);
			LOGGER.info("Poll created with question: {}", dto.getQuestion());

			String message = String.format("%s<b>%s</b>", AppConstant.POLL_NOTIFICATION_MESSAGE, save.getQuestion());

			List<User> selectedUsers = userRepo.findAllByRole(UsersRole.ROLE_RESIDENT.name());
			selectedUsers.stream().filter(u -> !u.getId().equals(userId)).forEach(u -> notificationService
					.sendNotification(user, u, new StringBuilder(message), NotificationType.POLL.name()));

			LOGGER.debug("Notifications sent to {} users", selectedUsers.size());

			return save;

		} catch (Exception e) {
			LOGGER.error("Error creating poll for userId: {}", userId, e);
			throw new AppException(e.getMessage());
		}
	}

	public Poll updatePoll(Long pollId, PollRequestDto dto, String adminId) {
		LOGGER.info("Updating pollId: {} by adminId: {}", pollId, adminId);
		try {
			Poll existingPoll = pollRepository.findByIdAndIsActiveAndCreatedById(pollId, true, adminId);
			if (existingPoll == null) {
				throw new NotFoundException("Poll not found or you don't have permission");
			}

			boolean isChanged = false;

			if (!existingPoll.getQuestion().equals(dto.getQuestion())) {
				existingPoll.setQuestion(dto.getQuestion());
				isChanged = true;
			}

			if (!existingPoll.getOptions().equals(dto.getOptions())) {
				validatePollOptions(dto.getOptions());
				existingPoll.setOptions(dto.getOptions());
				isChanged = true;
			}

			if (isChanged) {
				existingPoll.setUpdatedAt(LocalDateTime.now());
				LOGGER.info("Poll updated: {}", pollId);
				return pollRepository.save(existingPoll);
			}

			LOGGER.info("No changes found for pollId: {}", pollId);
			return existingPoll;

		} catch (Exception e) {
			LOGGER.error("Error updating pollId: {}", pollId, e);
			throw new AppException(e.getMessage());
		}
	}

	public void castVote(VoteRequestDto dto, String userId) {
		LOGGER.info("Casting vote for pollId: {} by userId: {}", dto.getPollId(), userId);
		try {
			User user = userRepo.findByIdAndRole(userId, UsersRole.ROLE_RESIDENT.name());
			if (user == null) {
				throw new NotFoundException("User not found");
			}

			Poll poll = pollRepository.findByIdAndIsActive(dto.getPollId(), true);
			if (poll == null) {
				throw new AppException("Poll not found or is closed");
			}

			if (!poll.getOptions().contains(dto.getSelectedOption())) {
				throw new AppException("Invalid option selected");
			}

			Vote vote = poll.getVotes().stream().filter(voteObj -> voteObj.getVotedBy().getId().equals(userId))
					.findFirst().orElse(null);

			if (vote != null) {
				vote.setSelectedOption(dto.getSelectedOption());
				LOGGER.info("Vote updated successfully for pollId: {} by userId: {}", dto.getPollId(), userId);
			} else {
				vote = new Vote();
				vote.setPoll(poll);
				vote.setVotedBy(user);
				vote.setSelectedOption(dto.getSelectedOption());
				LOGGER.info("Vote cast successfully for pollId: {} by userId: {}", dto.getPollId(), userId);
			}
			voteRepo.save(vote);
		} catch (Exception e) {
			LOGGER.error("Failed to cast vote for pollId: {} by userId: {}", dto.getPollId(), userId, e);
			throw new AppException("Failed to cast vote: " + e.getMessage());
		}
	}

	public void closePoll(Long pollId, String adminId) {
		LOGGER.info("Closing pollId: {} by adminId: {}", pollId, adminId);
		try {
			Poll poll = pollRepository.findByIdAndIsActiveAndCreatedById(pollId, true, adminId);
			if (poll == null) {
				throw new NotFoundException("Poll not found or you don't have permission");
			}
			poll.setActive(false);
			pollRepository.save(poll);
			LOGGER.info("Poll closed successfully: {}", pollId);
		} catch (Exception e) {
			LOGGER.error("Error closing pollId: {}", pollId, e);
			throw new AppException(e.getMessage());
		}
	}

	public List<CommonPollResponseDto> getAllPollsForUser(String userId, String role) {
		try {
			List<Poll> polls = pollRepository.findAll();

			if (polls.isEmpty()) {
				return Collections.emptyList();
			}

			return polls.stream().sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt())).map(poll -> {
				CommonPollResponseDto dto = new CommonPollResponseDto();
				dto.setPollId(poll.getId());
				dto.setQuestion(poll.getQuestion());
				dto.setOptions(poll.getOptions());
				dto.setVoteCount(poll.getVotes().size());
				dto.setUserResponseDto(mapToUserResponseDto(poll.getCreatedBy()));
				dto.setCreatedAt(poll.getCreatedAt());
				dto.setIsActive(poll.isActive());

				Optional<Vote> vote = poll.getVotes().stream()
						.filter(v -> v.getVotedBy() != null && v.getVotedBy().getId().equals(userId)).findFirst();

				dto.setSelectedOption(vote.map(Vote::getSelectedOption).orElse(null));

				if (UsersRole.ROLE_ADMIN.name().equalsIgnoreCase(role)) {
					dto.setOptionResults(buildOptionResults(poll));
				}

				return dto;
			}).collect(Collectors.toList());

		} catch (Exception ex) {
			throw new AppException(ex.getMessage());
		}
	}

	private List<OptionResult> buildOptionResults(Poll poll) {
		List<Vote> votes = poll.getVotes();

		long totalVotes = votes.size();

		return poll.getOptions().stream().map(option -> {
			List<UserResponseDto> voters = votes.stream().filter(v -> v.getSelectedOption().equals(option))
					.map(v -> mapToUserResponseDto(v.getVotedBy())).collect(Collectors.toList());

			long voteCount = voters.size();
			double percentage = totalVotes == 0 ? 0.0 : ((double) voteCount / totalVotes) * 100;

			CommonPollResponseDto.OptionResult result = new CommonPollResponseDto.OptionResult();
			result.setOption(option);
			result.setVoteCount(voteCount);
			result.setPercentage(percentage);
			result.setVoters(voters);

			return result;
		}).collect(Collectors.toList());
	}

	private UserResponseDto mapToUserResponseDto(User user) {
		if (user == null)
			return null;

		UserResponseDto dto = new UserResponseDto();
		dto.setId(user.getId().toString());
		dto.setFirstName(user.getFirstName());
		dto.setLastName(user.getLastName());
		dto.setEmail(user.getEmail());
		return dto;
	}

	public void deletePoll(Long pollId, String userId) {
		try {
			Poll deletePoll = pollRepository.findByIdAndCreatedById(pollId, userId);
			if (deletePoll == null) {
				throw new NotFoundException("Poll not found or you don't have permission");
			}
			if (!deletePoll.getVotes().isEmpty()) {
				throw new AppException("Poll has votes. you are not allowed to delete it.");
			}
			pollRepository.delete(deletePoll);

		} catch (Exception ex) {
			throw new AppException(ex.getMessage());
		}
	}

	private void validatePollOptions(List<String> options) {

		Set<String> unique = new HashSet<>();
		for (String option : options) {
			String normalized = option.trim().toLowerCase();
			if (!unique.add(normalized)) {
				throw new AppException("Duplicate option found: " + option);
			}
		}
	}

}
