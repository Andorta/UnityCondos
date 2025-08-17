package com.mgmt.residency.response.dto;

import java.util.List;

public class DetailedTaskResponseDto {

	private List<TaskResponseDto> myTasks;

	private List<TaskResponseDto> assignedTasks;

	public List<TaskResponseDto> getMyTasks() {
		return myTasks;
	}

	public void setMyTasks(List<TaskResponseDto> myTasks) {
		this.myTasks = myTasks;
	}

	public List<TaskResponseDto> getAssignedTasks() {
		return assignedTasks;
	}

	public void setAssignedTasks(List<TaskResponseDto> assignedTasks) {
		this.assignedTasks = assignedTasks;
	}

}
