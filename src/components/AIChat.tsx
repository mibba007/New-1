import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, BrainCircuit } from 'lucide-react';
import { chatWithGemini } from '../services/ai';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'QAFSE ULTRA AI Chatbot initialized. How can I assist with your market analysis today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useFast, setUseFast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatWithGemini(newMessages, useThinking, useFast);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-zinc-800/60 rounded-2xl bg-[#121212] shadow-lg max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-zinc-800/60 bg-zinc-900/20 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-emerald-400" />
          <h2 className="font-bold text-zinc-100 text-lg">Terminal Chat</h2>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/60 hover:bg-zinc-800/50 transition-colors">
            <input 
              type="checkbox" 
              checked={useFast} 
              onChange={(e) => {
                setUseFast(e.target.checked);
                if (e.target.checked) setUseThinking(false);
              }}
              className="accent-emerald-500 w-4 h-4"
            />
            <Zap className={cn("w-4 h-4", useFast ? "text-yellow-400" : "text-zinc-500")} />
            <span className={useFast ? "text-zinc-200" : "text-zinc-500"}>Fast Mode</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/60 hover:bg-zinc-800/50 transition-colors">
            <input 
              type="checkbox" 
              checked={useThinking} 
              onChange={(e) => {
                setUseThinking(e.target.checked);
                if (e.target.checked) setUseFast(false);
              }}
              className="accent-emerald-500 w-4 h-4"
            />
            <BrainCircuit className={cn("w-4 h-4", useThinking ? "text-purple-400" : "text-zinc-500")} />
            <span className={useThinking ? "text-zinc-200" : "text-zinc-500"}>Deep Thinking</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0a0a0a]">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-4 max-w-[90%] sm:max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", msg.role === 'user' ? "bg-zinc-800" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={cn("p-4 rounded-2xl whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm", msg.role === 'user' ? "bg-zinc-800 text-zinc-100 rounded-tr-sm" : "bg-zinc-900/80 border border-zinc-800/60 text-zinc-300 rounded-tl-sm")}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/60 text-emerald-50 text-sm flex items-center gap-2 rounded-tl-sm shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sm:p-5 border-t border-zinc-800/60 bg-zinc-900/20">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter command (e.g., /analyze EUR/USD)..."
            className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl px-4 py-3 sm:py-4 text-[15px] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 sm:px-6 py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center shadow-md shadow-emerald-600/20 font-semibold"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
