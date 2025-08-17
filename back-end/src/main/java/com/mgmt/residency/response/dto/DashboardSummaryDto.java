package com.mgmt.residency.response.dto;

public class DashboardSummaryDto {

	private UserAnalyticsDto userAnalytics;

	private TaskOverviewDto taskOverview;

	private int totalAnnouncements;

	private Double todayIncome;

	private Double todayExpenses;

	public UserAnalyticsDto getUserAnalytics() {
		return userAnalytics;
	}

	public void setUserAnalytics(UserAnalyticsDto userAnalytics) {
		this.userAnalytics = userAnalytics;
	}

	public TaskOverviewDto getTaskOverview() {
		return taskOverview;
	}

	public void setTaskOverview(TaskOverviewDto taskOverview) {
		this.taskOverview = taskOverview;
	}

	public int getTotalAnnouncements() {
		return totalAnnouncements;
	}

	public void setTotalAnnouncements(int totalAnnouncements) {
		this.totalAnnouncements = totalAnnouncements;
	}


	public Double getTodayIncome() {
		return todayIncome;
	}

	public void setTodayIncome(Double todayIncome) {
		this.todayIncome = todayIncome;
	}

	public Double getTodayExpenses() {
		return todayExpenses;
	}

	public void setTodayExpenses(Double todayExpenses) {
		this.todayExpenses = todayExpenses;
	}

	public static class UserAnalyticsDto {

		private int totalUsers;

		private int activeUsers;

		private int inactiveUsers;

		public int getTotalUsers() {
			return totalUsers;
		}

		public void setTotalUsers(int totalUsers) {
			this.totalUsers = totalUsers;
		}

		public int getActiveUsers() {
			return activeUsers;
		}

		public void setActiveUsers(int activeUsers) {
			this.activeUsers = activeUsers;
		}

		public int getInactiveUsers() {
			return inactiveUsers;
		}

		public void setInactiveUsers(int inactiveUsers) {
			this.inactiveUsers = inactiveUsers;
		}

	}

	public static class TaskOverviewDto {

		private int completed;

		private int pending;

		private int inProgress;

		public int getCompleted() {
			return completed;
		}

		public void setCompleted(int completed) {
			this.completed = completed;
		}

		public int getPending() {
			return pending;
		}

		public void setPending(int pending) {
			this.pending = pending;
		}

		public int getInProgress() {
			return inProgress;
		}

		public void setInProgress(int inProgress) {
			this.inProgress = inProgress;
		}

	}

}
