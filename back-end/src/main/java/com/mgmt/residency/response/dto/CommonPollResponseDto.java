package com.mgmt.residency.response.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommonPollResponseDto {

	private Long pollId;

	private UserResponseDto userResponseDto;

	private String question;

	private List<String> options;

	private String selectedOption;

	private long voteCount;

	private LocalDateTime createdAt;

	private boolean isActive;

	private List<OptionResult> optionResults;

	public static class OptionResult {
		private String option;
		private double percentage;
		private List<UserResponseDto> voters;
		private long voteCount;

		public String getOption() {
			return option;
		}

		public void setOption(String option) {
			this.option = option;
		}

		public double getPercentage() {
			return percentage;
		}

		public void setPercentage(double percentage) {
			this.percentage = percentage;
		}

		public List<UserResponseDto> getVoters() {
			return voters;
		}

		public void setVoters(List<UserResponseDto> voters) {
			this.voters = voters;
		}

		public long getVoteCount() {
			return voteCount;
		}

		public void setVoteCount(long voteCount) {
			this.voteCount = voteCount;
		}
	}

	public List<OptionResult> getOptionResults() {
		return optionResults;
	}

	public void setOptionResults(List<OptionResult> optionResults) {
		this.optionResults = optionResults;
	}

	public Long getPollId() {
		return pollId;
	}

	public void setPollId(Long pollId) {
		this.pollId = pollId;
	}

	public UserResponseDto getUserResponseDto() {
		return userResponseDto;
	}

	public void setUserResponseDto(UserResponseDto userResponseDto) {
		this.userResponseDto = userResponseDto;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public List<String> getOptions() {
		return options;
	}

	public void setOptions(List<String> options) {
		this.options = options;
	}

	public long getVoteCount() {
		return voteCount;
	}

	public void setVoteCount(long voteCount) {
		this.voteCount = voteCount;
	}

	public String getSelectedOption() {
		return selectedOption;
	}

	public void setSelectedOption(String selectedOption) {
		this.selectedOption = selectedOption;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(boolean isActive) {
		this.isActive = isActive;
	}

}
