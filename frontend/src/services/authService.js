import axios from 'axios';

// Use API Gateway by default (matches backend routing: /api/users/**)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const BASE_URL = `${API_BASE_URL}/api/users`;

// ─── Attach token to every request automatically ───────────────
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Handle 401 globally (token expired) ───────────────────────
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Register ──────────────────────────────────────────────────
export const register = async (data) => {
  const response = await axios.post(`${BASE_URL}/register`, data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      userId:    response.data.userId,
      email:     response.data.email,
      firstName: response.data.firstName,
      lastName:  response.data.lastName,
      role:      response.data.role,
    }));
  }
  return response.data;
};

// ─── Login ─────────────────────────────────────────────────────
export const login = async (data) => {
  const response = await axios.post(`${BASE_URL}/login`, data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      userId:    response.data.userId,
      email:     response.data.email,
      firstName: response.data.firstName,
      lastName:  response.data.lastName,
      role:      response.data.role,
    }));
  }
  return response.data;
};

// ─── Logout ────────────────────────────────────────────────────
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ─── Get My Profile ────────────────────────────────────────────
export const getMyProfile = async () => {
  const response = await axios.get(`${BASE_URL}/me`);
  return response.data;
};

// ─── Update My Profile ─────────────────────────────────────────
export const updateMyProfile = async (data) => {
  const response = await axios.put(`${BASE_URL}/me`, data);
  return response.data;
};

// ─── Change Password ───────────────────────────────────────────
export const changePassword = async (data) => {
  const response = await axios.put(`${BASE_URL}/me/password`, data);
  return response.data;
};

// ─── Get User By ID (internal / admin use) ─────────────────────
export const getUserById = async (userId) => {
  const response = await axios.get(`${BASE_URL}/${userId}`);
  return response.data;
};

// ─── Get Current User from localStorage ────────────────────────
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// ─── Check if user is authenticated ────────────────────────────
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// ─── Get token ─────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('token');

// Aggregate default export for convenient import in AuthContext
const authService = {
  register,
  login,
  logout,
  getMyProfile,
  updateMyProfile,
  changePassword,
  getUserById,
  getCurrentUser,
  isAuthenticated,
  getToken,
};

export default authService;
