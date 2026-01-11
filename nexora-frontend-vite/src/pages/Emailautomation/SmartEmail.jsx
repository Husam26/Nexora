import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Mail, Send, Clock, Loader2, Sparkles, User, Type, AlignLeft, ChevronDown, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartEmail() {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    context: "",
    tone: "professional",
    scheduledAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/automations/email", form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      setForm({ to: "", subject: "", context: "", tone: "professional", scheduledAt: "" });
    } catch (err) {
      alert("❌ Failed to schedule email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-12 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP NAV / HEADER */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Nexora AI</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Email Automation</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-600">AI Engine Ready</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: FORM SECTION (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Draft Email <Sparkles className="w-5 h-5 text-indigo-500" />
              </h2>

              <div className="space-y-5">
                {/* RECIPIENT */}
                <div className="group">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Recipient</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="to"
                      placeholder="client@example.com"
                      value={form.to}
                      onChange={handleChange}
                      className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* SUBJECT */}
                <div className="group">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Subject Line</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="subject"
                      placeholder="Project Update..."
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* CONTEXT */}
                <div className="group">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">What should the AI say?</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      name="context"
                      rows={4}
                      placeholder="Mention the new deadline and ask for feedback..."
                      value={form.context}
                      onChange={handleChange}
                      className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
                    />
                  </div>
                </div>

                {/* TONE & TIME */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Tone</label>
                    <div className="relative">
                      <select
                        name="tone"
                        value={form.tone}
                        onChange={handleChange}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none appearance-none font-bold text-slate-700"
                      >
                        <option value="professional">👔 Professional</option>
                        <option value="friendly">👋 Friendly</option>
                        <option value="formal">⚖️ Formal</option>
                        <option value="casual">🌴 Casual</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Schedule</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="datetime-local"
                        name="scheduledAt"
                        value={form.scheduledAt}
                        onChange={handleChange}
                        className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 text-indigo-400" />
                      Schedule Smart Email
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: LIVE PREVIEW (7 Cols) */}
          <div className="lg:col-span-7 sticky top-12">
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
              {/* Email Browser Header */}
              <div className="bg-slate-50 border-b border-slate-100 p-6">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-400 font-medium">To: <span className="text-slate-900">{form.to || "(No recipient)"}</span></p>
                  <p className="text-slate-400 font-medium">Subject: <span className="text-slate-900 font-bold">{form.subject || "(No subject)"}</span></p>
                </div>
              </div>

              {/* Email Body Preview */}
              <div className="p-10 flex-grow relative overflow-y-auto">
                <AnimatePresence mode="wait">
                  {form.context ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-slate max-w-none"
                    >
                      <p className="text-slate-800">Hello,</p>
                      <p className="text-slate-600 italic whitespace-pre-wrap leading-relaxed py-4 border-l-2 border-indigo-100 pl-4">
                        {form.context}
                        <span className="animate-pulse ml-1 text-indigo-500">|</span>
                      </p>
                      <p className="text-slate-800">
                        Best regards,<br />
                        <span className="font-bold text-indigo-600">Nexora AI Assistant</span>
                      </p>
                      
                      <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Tone: {form.tone}
                        </span>
                        {form.scheduledAt && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(form.scheduledAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                      <Mail className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-medium">Type in the context to see the draft live.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Success Overlay */}
              <AnimatePresence>
                {success && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                  >
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="p-4 bg-emerald-100 rounded-full mb-4"
                    >
                      <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-slate-900">Email Queued!</h3>
                    <p className="text-slate-500">The AI will polish and send this shortly.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-center mt-6 text-slate-400 text-sm font-medium">
              Powered by Nexora Neural Engine • v2.0
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}