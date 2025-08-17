package com.mgmt.residency.response.dto;

import java.util.List;

public class PollResultResponseDto {
	private Long pollId;
	private String question;
	private List<OptionResult> options;

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

	public Long getPollId() {
		return pollId;
	}

	public void setPollId(Long pollId) {
		this.pollId = pollId;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public List<OptionResult> getOptions() {
		return options;
	}

	public void setOptions(List<OptionResult> options) {
		this.options = options;
	}
}
