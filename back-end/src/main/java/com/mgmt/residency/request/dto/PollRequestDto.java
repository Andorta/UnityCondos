package com.mgmt.residency.request.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public class PollRequestDto {

	@NotBlank(message = "Question is required")
	@Size(max = 200, message = "Question must not exceed 200 characters")
	private String question;

	@NotEmpty(message = "Options are required")
	@Size(min = 2, message = "At least 2 options are required")
	private List<@NotBlank(message = "Option must not be blank") String> options;

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
}
