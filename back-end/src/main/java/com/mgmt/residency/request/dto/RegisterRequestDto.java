package com.mgmt.residency.request.dto;

import com.mgmt.residency.constants.AppConstant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequestDto {

	@NotBlank(message = "First name is required")
	@Pattern(regexp = AppConstant.FIRST_NAME_PATTERN, message = "First name should be between 2 and 50 characters and should not contain any numbers or special characters.")
	private String firstName;

	@NotBlank(message = "Last name is required")
	@Pattern(regexp = AppConstant.LAST_NAME_PATTERN, message = "Last name should be less than 50 characters and should not contain any numbers or special characters.")
	private String lastName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
	@Pattern(regexp = AppConstant.PASSWORD_PATTERN, message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
	private String password;

	@NotBlank(message = "Phone number is required")
	@Size(min = 5, max = 20, message = "Phone number must be between 5 and 20 characters")
	private String phoneNumber;

	@NotBlank(message = "Role is required")
	@Pattern(regexp = "ROLE_GUEST|ROLE_RESIDENT", message = "Role must be either ROLE_GUEST or ROLE_RESIDENT")
	private String role;

	private String residencyNumber;
	
	private String designation;

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getResidencyNumber() {
		return residencyNumber;
	}

	public void setResidencyNumber(String residencyNumber) {
		this.residencyNumber = residencyNumber;
	}

	public String getDesignation() {
		return designation;
	}

	public void setDesignation(String designation) {
		this.designation = designation;
	}

}
