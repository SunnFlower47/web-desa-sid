'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Halo Warga Cibatu! Saya Asisten Digital Desa. Ada yang bisa saya bantu hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Update UI dulu
    const newUserMessage = { role: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Siapkan history untuk dikirim ke Laravel
    const history = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      text: msg.text
    }));

    try {
      const res = await api.post('/chat', {
        message: userMessage,
        history: history
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', text: res.data.message }]);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages(prev => [...prev, { role: 'model', text: "Maaf, asisten sedang mengalami gangguan. Silakan coba lagi nanti." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[calc(100vw-3rem)] sm:w-[350px] md:w-[400px] h-[500px] max-h-[calc(100vh-8rem)] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border-primary/20"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Asisten Desa Cibatu</h3>
                  <p className="text-[10px] text-white/70">Online • Didukung Gemini AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-md' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    {msg.role === 'model' ? (
                      <div className="markdown-content prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-1">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-xs text-slate-400 font-medium">Asisten sedang berpikir...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tulis pertanyaan Anda..."
                className="flex-1 text-sm bg-slate-100 text-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-primary text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {!isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -top-12 right-0 bg-white text-slate-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl border border-slate-100 whitespace-nowrap pointer-events-none"
            >
              Butuh Bantuan? Tanya AI!
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="chat-assistant-toggle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-900/40 flex items-center justify-center hover:scale-110 hover:bg-emerald-500 transition-all active:scale-95 z-10"
        >
          <div className="absolute -top-3 -right-3 px-2 py-1 bg-slate-900 text-[8px] font-black text-emerald-400 rounded-lg border border-emerald-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            AI POWERED
          </div>
          {isOpen ? <X size={28} /> : <Bot size={28} className="group-hover:rotate-12 transition-transform" />}
        </motion.button>
      </div>
    </div>
  );
}
