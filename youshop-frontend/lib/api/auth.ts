import axiosInstance from '@/lib/axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  address: string | null;
  phone: string | null;
  dateNaissance: string | null;
  photo: string | null;
  verificationEmail: boolean;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (credentials: RegisterCredentials): Promise<{ user: User }> => {
    const response = await axiosInstance.post('/auth/register', credentials);
    return response.data;
  },

  // Logout (single device)
  logout: async (refreshToken?: string) => {
    const response = await axiosInstance.post('/auth/logout', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Logout from all devices
  logoutAll: async () => {
    const response = await axiosInstance.post('/auth/logout-all');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  // Email verification
  validationEmail: async (email: string, code: string) => {
    const response = await axiosInstance.post('/auth/verify-code', { email, code });
    return response.data;
  },

  // Reset password
  resetPassword: async (email: string, newPassword: string, code: string) => {
    const response = await axiosInstance.post('/auth/resetPassword', { email, newPassword, code });
    return response.data;
  },

  // Request password reset code
  motPassOublie: async (email: string) => {
    const response = await axiosInstance.post('/auth/motPassOublie', { email });
    return response.data;
  },
};

export type { User, AuthResponse, LoginCredentials, RegisterCredentials };
