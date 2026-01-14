import axios from './axios.js';

export const login = async (email, password) => {
  const res = await axios.post('/auth/login', { email, password });
  return res.data;
};

export const signup = async (userData) => {
  const res = await axios.post('/auth/signup', userData);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await axios.post('/auth/reset-password', { token, password });
  return res.data;
};

export const getAdminMembers = () => axios.get('/users/admin-members');

export const addMember = (data) => axios.post('/users', data);