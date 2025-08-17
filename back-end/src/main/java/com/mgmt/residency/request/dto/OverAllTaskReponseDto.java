package com.mgmt.residency.request.dto;

import java.util.List;

public class OverAllTaskReponseDto {

	private List<TaskDetail> taskDetails;

	public static class TaskDetail {

		private String status; //Pending , inprogerss, done

		private Long count;

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public Long getCount() {
			return count;
		}

		public void setCount(Long count) {
			this.count = count;
		}

	}

	public List<TaskDetail> getTaskDetails() {
		return taskDetails;
	}

	public void setTaskDetails(List<TaskDetail> taskDetails) {
		this.taskDetails = taskDetails;
	}

}
