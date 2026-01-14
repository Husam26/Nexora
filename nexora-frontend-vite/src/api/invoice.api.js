import axios from './axios.js';

export const getInvoices = () => axios.get('/invoices');

export const getInvoice = (id) => axios.get(`/invoices/${id}`);

export const createInvoice = (data) => axios.post('/invoices', data);

export const updateInvoiceStatus = (id, status) => axios.put(`/invoices/${id}/status`, { status });

export const deleteInvoice = (id) => axios.delete(`/invoices/${id}`);

export const chatWithInvoice = (data) => axios.post('/ai/invoice/chat', data);