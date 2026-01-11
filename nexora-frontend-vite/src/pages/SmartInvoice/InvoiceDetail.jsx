import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js";
import { 
  ChevronLeft, 
  Printer, 
  Download, 
  User, 
  Building2, 
  Mail, 
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from "lucide-react";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch {
      alert("Invoice not found");
      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      await axios.put(`/invoices/${id}/status`, { status });
      setInvoice({ ...invoice, status });
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val || 0);

  /* ================= PRINT / PDF LOGIC ================= */
  
  const openPrintWindow = () => {
    const win = window.open("", "", "width=900,height=650");
    win.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice?.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; }
            .print-wrap { width: 100%; max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="print-wrap">${printRef.current.innerHTML}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const downloadInvoice = () => {
    const element = printRef.current;
    const opt = {
      margin: [0.5, 0.5], // Top and side margins
      filename: `invoice_${invoice.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        width: 790 // Fixed width to prevent cutting
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
  
  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-28 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        
        {/* ================= NAVIGATION ================= */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
          >
            <ChevronLeft size={16} /> Back to Ledger
          </motion.button>

          <div className="flex gap-3">
            <button onClick={openPrintWindow} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <Printer size={18} />
            </button>
            <button onClick={downloadInvoice} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* ================= MAIN UI VOUCHER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative"
        >
          <div className={`py-3 px-10 text-center text-[10px] font-black uppercase tracking-[0.5em] ${
            invoice.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'
          }`}>
            {invoice.status === 'paid' ? 'Transaction Settled & Verified' : 'Payment Directive Pending'}
          </div>

          <div className="p-10 md:p-16">
            <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-xl">
                    <User size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{invoice.customer?.name}</h1>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Recipient</span>
                  </div>
                </div>
                <div className="space-y-2 pl-2">
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-medium"><Building2 size={16} /> {invoice.customer?.company || "N/A"}</div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-medium"><Mail size={16} /> {invoice.customer?.email}</div>
                </div>
              </div>

              <div className="md:text-right">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Invoice Timeline</p>
                  <div className="space-y-2">
                    <div className="flex items-center md:justify-end gap-3">
                      <span className="text-xs text-slate-400 font-bold">Issued</span>
                      <span className="text-sm font-black text-slate-800">{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center md:justify-end gap-3">
                      <span className="text-xs text-slate-400 font-bold">Maturity</span>
                      <span className="text-sm font-black text-indigo-600">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Receipt className="text-indigo-600" size={20} />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Service Itemization</h2>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="space-y-2">
                {invoice.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 px-6 py-5 rounded-2xl bg-slate-50/50 border border-slate-100 items-center">
                    <div className="col-span-6 font-black text-slate-800">{item.name}</div>
                    <div className="col-span-2 text-center font-bold text-slate-500">×{item.quantity}</div>
                    <div className="col-span-4 text-right font-black text-slate-900">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-t border-slate-100 pt-12">
              <div>
                {invoice.status !== "paid" ? (
                  <button onClick={() => updateStatus("paid")} disabled={updating} className="bg-emerald-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                    {updating ? "..." : <CreditCard size={18} />} Authorize Payment
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-8 py-5 bg-slate-900 rounded-[1.5rem]">
                    <ShieldCheck className="text-indigo-400" size={20} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Payment Cleared</span>
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Subtotal</span>
                  <span className="font-bold text-slate-600">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {/* ALWAYS SHOW TAX */}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Tax ({invoice.taxPercent}%)</span>
                  <span className="font-bold text-slate-600">+{formatCurrency(invoice.taxAmount)}</span>
                </div>
                {/* ALWAYS SHOW DISCOUNT */}
                <div className="flex justify-between text-sm pb-4 border-b border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Discount</span>
                  <span className="font-bold text-emerald-500">-{formatCurrency(invoice.discount)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= HIDDEN PRINT SECTION (FIXED WIDTH) ================= */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={printRef} style={{ 
          width: "790px", 
          padding: "40px", 
          background: "#fff", 
          color: "#111", 
          boxSizing: "border-box",
          fontFamily: "Arial, sans-serif"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "4px solid #111", paddingBottom: "20px", marginBottom: "30px" }}>
            <div>
              <h1 style={{ fontSize: "40px", margin: 0, fontWeight: "900" }}>INVOICE</h1>
              <p style={{ color: "#666" }}>Ref: #{invoice.id}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: 0 }}>{invoice.customer?.company || "TaskAI Protocol"}</h2>
              <p style={{ margin: 0 }}>Date: {new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", marginBottom: "10px" }}>Recipient</h3>
            <p style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>{invoice.customer?.name}</p>
            <p style={{ margin: "2px 0" }}>{invoice.customer?.email}</p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #eee", fontSize: "12px", textTransform: "uppercase" }}>Description</th>
                <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #eee", fontSize: "12px", textTransform: "uppercase" }}>Qty</th>
                <th style={{ padding: "15px", textAlign: "right", borderBottom: "2px solid #eee", fontSize: "12px", textTransform: "uppercase" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "15px", borderBottom: "1px solid #eee", fontWeight: "bold" }}>{item.name}</td>
                  <td style={{ padding: "15px", borderBottom: "1px solid #eee", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "15px", borderBottom: "1px solid #eee", textAlign: "right" }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginLeft: "auto", width: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: "#666" }}>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {/* PDF: ALWAYS SHOW TAX */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: "#666" }}>Tax ({invoice.taxPercent}%)</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            {/* PDF: ALWAYS SHOW DISCOUNT */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", color: "#10b981" }}>
              <span>Discount</span>
              <span>-{formatCurrency(invoice.discount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", marginTop: "10px", borderTop: "2px solid #111", fontWeight: "900", fontSize: "20px" }}>
              <span>TOTAL</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          <div style={{ marginTop: "60px", textAlign: "center", fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "2px" }}>
            System Generated Invoice • TaskAI Secure Financial Protocol
          </div>
        </div>
      </div>
    </div>
  );
}