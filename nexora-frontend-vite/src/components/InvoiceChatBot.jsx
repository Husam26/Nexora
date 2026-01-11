import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import { MessageSquare, Send, X, Sparkles, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InvoiceChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    
    // Optimistic UI update
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Pass the existing history + the new message to the backend
      const res = await axios.post("/ai/invoice/chat", {
        message: userMsg.text,
        history: messages, // Backend will append current msg if needed, or we send context
      });

      const aiMsg = {
        role: "ai",
        text: res.data.answer || "I found the details.",
        data: res.data.data || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Nexora Intelligence is offline or encountered an error. 😕" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <motion.button
          layoutId="chat-box"
          whileHover={{ scale: 1.05, y: -4 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 z-[100] bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-3 border border-slate-800"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse border-2 border-slate-900" />
          </div>
          <span className="font-bold text-sm tracking-tight">Nexora AI</span>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="chat-box"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            className="fixed bottom-8 right-8 w-[90vw] max-w-[420px] h-[640px] max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base">Nexora Intelligence</h3>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    Finance Core Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-60">
                  <Bot className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="font-bold text-slate-900 text-lg">How can I assist?</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Try: "Check the due date " or "Total tax "
                  </p>
                </div>
              )}
              
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`text-sm p-4 font-medium max-w-[85%] rounded-[1.5rem] shadow-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                    }`}
                  >
                     {/* Render basic markdown-like bolding */}
                    <span dangerouslySetInnerHTML={{ 
                        __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                    }} />
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                    <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 w-max px-5 py-3 rounded-[1.5rem] rounded-bl-none border border-indigo-100">
                    <Sparkles size={16} className="animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Thinking...</span>
                    </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                <input
                  className="flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none text-slate-700 placeholder:text-slate-400"
                  placeholder="Ask about invoices..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}