package com.mgmt.residency.response.dto;

public class PaymentResponseDto {

	private double totalIncome;

	private double totalExpense;

	private double userTotalIncome;

	private double userTotalExpense;

	public double getTotalIncome() {
		return totalIncome;
	}

	public void setTotalIncome(double totalIncome) {
		this.totalIncome = totalIncome;
	}

	public double getTotalExpense() {
		return totalExpense;
	}

	public void setTotalExpense(double totalExpense) {
		this.totalExpense = totalExpense;
	}

	public double getUserTotalIncome() {
		return userTotalIncome;
	}

	public void setUserTotalIncome(double userTotalIncome) {
		this.userTotalIncome = userTotalIncome;
	}

	public double getUserTotalExpense() {
		return userTotalExpense;
	}

	public void setUserTotalExpense(double userTotalExpense) {
		this.userTotalExpense = userTotalExpense;
	}


}
