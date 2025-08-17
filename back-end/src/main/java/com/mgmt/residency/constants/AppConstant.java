package com.mgmt.residency.constants;

public class AppConstant {

	public static final String FIRST_NAME_PATTERN = "^[a-zA-Z\\s]{3,50}$";

	public static final String LAST_NAME_PATTERN = "^[a-zA-Z\\s]{1,50}$";

	public static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$";

	public static final String SPECIFIC_USER_TOPIC = "/all/user";

	public static final String ANNOUNCEMENT_TOPIC = "/announcements/{USER_ID}";
	
	public static final String TASK_TOPIC = "/task/{USER_ID}";

	public static final String ANNOUNCEMENT_NOTIFICATION_MESSAGE = " created a new announcement, ";

	public static final String TASK_ASSIGNMENT_NOTIFICATION_MESSAGE = " created task for you, ";

	public static final String POLL_NOTIFICATION_MESSAGE = " created a poll for voting, ";

}
