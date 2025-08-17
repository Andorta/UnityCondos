
import api from './axiosInterceptor';

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('isAuthenticated');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUsers = async (searchText, roleType, status) => {
    try {
        const params = {};

        if (searchText) params.searchText = searchText;
        if (roleType) params.roleType = roleType;
        if (status) params.status = status;

        const response = await api.get('/user', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUserStatus = async (userId) => {
    try {
        const response = await api.patch('/user/status', null, {
            params: {
                targetUserId: userId
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createAnnouncement = async (payload) => {
    try {
        const response = await api.post('/announcements', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createPoll = async (payload) => {
    try {
        const response = await api.post('/voting/poll', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllPolls = async () => {
    try {
        const response = await api.get('/voting/polls');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePoll = async (pollId) => {
    try {
        const response = await api.delete(`/voting/${pollId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const updatePoll = async (pollId, payload) => {
    try {
        const response = await api.put(`/voting/poll/${pollId}`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const closePoll = async (pollId) => {
    try {
        const response = await api.put(`/voting/${pollId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const castVote = async (voteData) => {
    try {
        const response = await api.post('/voting', voteData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllNotifications = async () => {
    try {
        const response = await api.get('/notification');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const updateNotificationViewStatus = async (notificationId) => {
    try {
        const response = await api.put(`/notification/status/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error updating notification view status:', error);
        throw error;
    }
};

export const getActiveUsers = async (params) => {
    try {
        const response = await api.get('/user/active', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTask = async (taskData) => {
    try {
        const response = await api.post('/task', taskData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllTasks = async (filters = {}) => {
    try {
        const response = await api.get('/task', {
            params: filters, // { titleOrAssignToName, status }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const deleteTask = async (taskId) => {
    try {
        const response = await api.delete(`/task/${taskId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTask = async (taskId, taskData) => {
    try {
        const response = await api.put(`/task/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTaskStatus = async (taskId, status) => {
    try {
        const response = await api.put(`/task/${taskId}/${status}`, null, {
            params: { status }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllAnnouncements = async () => {
    try {
        const response = await api.get('/announcements');
        return response.data;
    } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
    }
};

export const deleteAnnouncement = async (announcementId) => {
    try {
        const response = await api.delete(`/announcements/${announcementId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting announcement ID ${announcementId}:`, error);
        throw error;
    }
};

export const updateAnnouncement = async (announcementId, updatedData) => {
    try {
        const response = await api.put(`/announcements/${announcementId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating announcement ID ${announcementId}:`, error);
        throw error;
    }
};

export async function getAnnouncementDetails(announcementId) {
    try {
        const response = await api.get(`/announcements/${announcementId}`);
        return response.data;
    } catch (error) {
        console.error("Error updating announcement status:", error);
        throw error;
    }
}

export const getTaskSummary = async () => {
    try {
        const response = await api.get('/task/summary');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserSummary = async () => {
    try {
        const response = await api.get('/user/summary');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getGroupedPaymentsByUser = async () => {
    try {
        const response = await api.get('/payment/summary');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAnnouncementSummary = async () => {
    try {
        const response = await api.get('/announcements/summary');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get('/user/all');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllPaymentStatistics = async () => {
    try {
        const response = await api.get('/payment/summary');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getDashboardData = async () => {
    try {
        const response = await api.get('/user/dashboard');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllResidents = async (params) => {
    try {
        const response = await api.get('/user/residents', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCompletedTasks = async () => {
    try {
        const response = await api.get('/task/completed-tasks');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getExpenseSummaryByUser = async () => {
    try {
        const response = await api.get('/payment/expense');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getIncomeSummaryByUser = async () => {
    try {
        const response = await api.get('/payment/income');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createIncomePayment = async (data) => {
    try {
        const response = await api.post('/payment/income', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createExpensePayment = async (data, files = []) => {
    try {
        const formData = new FormData();
        formData.append('paymentDetails', new Blob([JSON.stringify(data)], { type: 'application/json' }));

        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await api.post('/payment/expense', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPaymentsDetails = async () => {
    try {
        const response = await api.get('/payment/overview');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPaymentSummary = async () => {
    try {
        const response = await api.get('/payment/combined');
        return response.data;
    } catch (error) {
        throw error;
    }
};