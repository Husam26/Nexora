import { useState, useEffect } from 'react';
import * as invoiceApi from '../../api/invoice.api.js';

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.getInvoices();
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (data) => {
    const res = await invoiceApi.createInvoice(data);
    setInvoices(prev => [...prev, res.data]);
    return res.data;
  };

  const updateInvoiceStatus = async (id, status) => {
    const res = await invoiceApi.updateInvoiceStatus(id, status);
    setInvoices(prev => prev.map(invoice => invoice._id === id ? res.data : invoice));
    return res.data;
  };

  const deleteInvoice = async (id) => {
    await invoiceApi.deleteInvoice(id);
    setInvoices(prev => prev.filter(invoice => invoice._id !== id));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  };
}