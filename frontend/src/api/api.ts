// import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const fetchWithToken = async (url: string, options: RequestInit = {}) => {
  // const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  return fetch(url, { ...options, headers });
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

interface LoginResponse {
  username: string;
  message: string;
  status: string;
}

interface RegisterResponse {
  message: string;
  status: string;
  id?: number;
  username?: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  status: string;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/user-managements/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    return handleResponse(response);
  },

  register: async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/user-managements/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, username: email, password }),
    });
    return handleResponse(response);
  },

  // User Profile
  getProfile: async (): Promise<UserProfile> => {
    // Use the first user as a placeholder since backend has no security
    const response = await fetchWithToken(`${API_BASE_URL}/user-managements/list?page=0&size=1`);
    const data = await handleResponse(response);
    return data.users[0];
  },

  updateProfile: async (data: { name: string }): Promise<UserProfile> => {
    const profile = await api.getProfile();
    const response = await fetchWithToken(`${API_BASE_URL}/user-managements/${profile.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: data.name }),
    });
    return handleResponse(response);
  },

  deleteAccount: async (): Promise<void> => {
    const profile = await api.getProfile();
    const response = await fetchWithToken(`${API_BASE_URL}/user-managements/${profile.id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
}; 