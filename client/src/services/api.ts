import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Enable sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for debugging (optional)
api.interceptors.request.use(
    (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log error details
        console.error('[API Error]:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;

// Auth API functions
export const authAPI = {
    register: async (data: { name: string; email: string; password: string }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Meeting API functions
export const meetingAPI = {
    create: async (data: {
        title: string;
        startTime?: string;
        description?: string;
        duration?: number;
        settings?: { waitingRoom: boolean; muteOnEntry: boolean };
        attendees?: { email: string }[];
    }) => {
        const response = await api.post('/meetings', data);
        return response.data;
    },

    join: async (data: { code: string }) => {
        const response = await api.post('/meetings/join', data);
        return response.data;
    },

    getMeeting: async (id: string) => {
        const response = await api.get(`/meetings/${id}`);
        return response.data;
    },

    getMyMeetings: async () => {
        const response = await api.get('/meetings/my');
        return response.data;
    },

    getTodayMeetings: async () => {
        const response = await api.get('/meetings/today');
        return response.data;
    },
};

// Admin API functions
export const adminAPI = {
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    updateUserRole: async (id: string, role: 'user' | 'admin') => {
        const response = await api.patch(`/admin/users/${id}/role`, { role });
        return response.data;
    },
};

// User Profile API functions
export const userAPI = {
    uploadAvatar: async (formData: FormData) => {
        const response = await api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateProfile: async (data: { name: string; bio?: string; title?: string }) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    updatePassword: async (data: any) => {
        const response = await api.put('/users/password', data);
        return response.data;
    },

    getSessions: async () => {
        const response = await api.get('/users/sessions');
        return response.data;
    },

    logoutAllSessions: async () => {
        const response = await api.delete('/users/sessions');
        return response.data;
    },
};
