import axios from './axios.js';

export const getTasks = () => axios.get('/tasks');

export const getTask = (id) => axios.get(`/tasks/${id}`);

export const createTask = (data) => axios.post('/tasks', data);

export const updateTask = (id, data) => axios.put(`/tasks/${id}`, data);

export const deleteTask = (id) => axios.delete(`/tasks/${id}`);

export const closeTask = (id, data) => axios.put(`/tasks/${id}/close`, data);

export const sendInvoiceReminder = (id, data) => axios.post(`/tasks/${id}/send-invoice-reminder`, data);

export const analyzeTask = (data) => axios.post('/ai/analyze-task', data);

export const getUsers = () => axios.get('/users');

export const getAnalyticsOverview = () => axios.get('/analytics/overview');