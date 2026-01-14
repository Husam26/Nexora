import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  User,
  Calendar,
  Receipt,
  Percent,
  Tag,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";

export default function CreateInvoice() {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const initialFormState = {
    customer: { name: "", company: "", email: "" },
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    taxPercent: 0,
    discount: 0,
    items: [{ name: "", quantity: 1, price: 0 }],
  };

  const [form, setForm] = useState(initialFormState);

  const handleNumberInput = (value) => (value === "" ? 0 : parseFloat(value));

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { name: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    if (form.items.length > 1) {
      const items = form.items.filter((_, i) => i !== index);
      setForm({ ...form, items });
    }
  };

  const itemsWithTotal = form.items.map((item) => ({
    ...item,
    total: item.quantity * item.price,
  }));

  const subtotal = itemsWithTotal.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (form.taxPercent || 0)) / 100;
  const totalAmount = subtotal + taxAmount - (form.discount || 0);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const submitInvoice = async () => {
    if (!form.customer.name) return alert("Please enter customer name");
    if (!user?.id) return alert("User not logged in");

    try {
      setLoading(true);

      await axios.post(
        "/invoices",
        {
          customer: form.customer,
          items: itemsWithTotal,
          issueDate: form.issueDate,
          dueDate: form.dueDate || null,
          taxPercent: form.taxPercent,
          taxAmount,
          discount: form.discount,
          subtotal,
          totalAmount,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Invoice Created Successfully");

      // ✅ RESET FORM HERE
      setForm({
        ...initialFormState,
        issueDate: new Date().toISOString().split("T")[0], // ensure fresh date
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating invoice");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceWithAI = async () => {
    if (!aiPrompt.trim()) return alert("Enter invoice description");

    try {
      setAiLoading(true);

      const res = await axios.post(
        "/ai/invoice/generate",
        { prompt: aiPrompt },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const aiData = res.data;

      setForm({
        customer: {
          name: aiData.customer?.name || "",
          company: aiData.customer?.company || "",
          email: aiData.customer?.email || "",
        },
        items:
          aiData.items?.length > 0
            ? aiData.items
            : [{ name: "", quantity: 1, price: 0 }],
        taxPercent: aiData.taxPercent ?? 18,
        discount: aiData.discount ?? 0,
        issueDate: aiData.issueDate || new Date().toISOString().split("T")[0],
        dueDate: aiData.dueDate || "",
      });
    } catch (err) {
      console.error(err);
      alert("AI failed to generate invoice");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Premium Slim Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Create Invoice
            </span>
          </div>

          <button
            onClick={submitInvoice}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Create Invoice
          </button>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* AI Invoice Generator */}
          <div className="p-8 border-b border-slate-100 bg-indigo-50/40">
            <div className="flex items-center gap-2 mb-3 text-indigo-600">
              <FileText size={18} />
              <span className="text-xs font-black uppercase tracking-widest">
                Smart Invoice (AI)
              </span>
            </div>

            <div className="flex gap-3">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder='e.g. "Invoice for website development for ABC Pvt Ltd ₹50,000 + GST due in 15 days"'
                className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium"
              />

              <button
                onClick={generateInvoiceWithAI}
                disabled={aiLoading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden">
            {/* Customer & Dates Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-slate-100">
              <div className="p-10 border-r border-slate-100">
                <div className="flex items-center gap-2 mb-6 text-indigo-600">
                  <User size={18} strokeWidth={2.5} />
                  <span className="text-xs font-black uppercase tracking-[0.15em]">
                    Client Details
                  </span>
                </div>
                <div className="space-y-6">
                  <input
                    className="w-full text-3xl font-bold placeholder:text-slate-200 outline-none focus:placeholder:text-slate-100"
                    placeholder="Recipient Name"
                    value={form.customer.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer: { ...form.customer, name: e.target.value },
                      })
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="w-full px-0 py-2 text-sm font-medium border-b border-transparent focus:border-indigo-500 outline-none transition-all"
                      placeholder="Company Name"
                      value={form.customer.company}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customer: {
                            ...form.customer,
                            company: e.target.value,
                          },
                        })
                      }
                    />
                    <input
                      className="w-full px-0 py-2 text-sm font-medium border-b border-transparent focus:border-indigo-500 outline-none transition-all"
                      placeholder="Email Address"
                      value={form.customer.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customer: { ...form.customer, email: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50/30">
                <div className="flex items-center gap-2 mb-6 text-indigo-600">
                  <Calendar size={18} strokeWidth={2.5} />
                  <span className="text-xs font-black uppercase tracking-[0.15em]">
                    Invoice Timeline
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-500">
                      Issue Date
                    </span>
                    <input
                      type="date"
                      className="bg-transparent font-bold text-slate-900 outline-none group-hover:text-indigo-600 transition-colors"
                      value={form.issueDate}
                      onChange={(e) =>
                        setForm({ ...form, issueDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-500">
                      Due Date
                    </span>
                    <input
                      type="date"
                      className="bg-transparent font-bold text-slate-900 outline-none group-hover:text-indigo-600 transition-colors"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Ledger Table */}
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Receipt size={18} strokeWidth={2.5} />
                  <span className="text-xs font-black uppercase tracking-[0.15em]">
                    Line Items
                  </span>
                </div>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 px-4 pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Unit Price</div>
                  <div className="col-span-1"></div>
                </div>

                {form.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                  >
                    <div className="col-span-6">
                      <input
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 font-bold placeholder:text-slate-200"
                        placeholder="Project Development"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        className="w-full bg-slate-50 rounded-lg py-1.5 text-center text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            handleNumberInput(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          className="w-24 bg-transparent border-none focus:ring-0 p-0 text-right text-slate-900 font-black"
                          value={item.price === 0 ? "" : item.price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              handleNumberInput(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeItem(index)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section - Bento Style Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-slate-100">
              <div className="p-10 bg-slate-50/50 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-indigo-500">
                      <Percent size={14} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Taxation
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        className="w-full bg-transparent text-xl font-black text-slate-900 outline-none"
                        placeholder="0"
                        value={form.taxPercent === 0 ? "" : form.taxPercent}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            taxPercent: handleNumberInput(e.target.value),
                          })
                        }
                      />
                      <span className="font-black text-slate-300">%</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-indigo-500">
                      <Tag size={14} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Discount
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        className="w-full bg-transparent text-xl font-black text-slate-900 outline-none"
                        placeholder="0"
                        value={form.discount === 0 ? "" : form.discount}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            discount: handleNumberInput(e.target.value),
                          })
                        }
                      />
                      <span className="font-black text-slate-300">₹</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Totals Area */}
              <div className="p-10 bg-white border-l border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400">Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400">
                    Total Tax ({form.taxPercent}%)
                  </span>
                  <span className="font-bold text-slate-900">
                    +{formatCurrency(taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-100">
                  <span className="font-bold text-slate-400">
                    Discount Applied
                  </span>
                  <span className="font-bold text-emerald-600">
                    -{formatCurrency(form.discount)}
                  </span>
                </div>
                <div className="pt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1">
                      Grand Total
                    </p>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                      {formatCurrency(totalAmount)}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400">
                      Currency
                    </p>
                    <p className="text-xs font-black text-slate-900 uppercase">
                      INR (₹)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            Powered by Smart Invoicing Engine
          </p>
        </div>
      </main>
    </div>
  );
}
