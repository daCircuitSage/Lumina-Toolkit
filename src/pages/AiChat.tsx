import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Sparkles,
  MessageSquare,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { chatWithAi } from '../services/mistralService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session_${Math.random().toString(36).substring(7)}`);

  // Auto-scroll to bottom with behavior: smooth
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const aiResponse = await chatWithAi(userMessage.content, history);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse || 'No response from AI',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'I encountered an error. Please check your connection or try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bot size={20} md:size={22} />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white leading-tight">AI Assistant</h1>
            <div className="flex items-center gap-1.5 line-clamp-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gemini Engine</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={clearHistory}
          className="p-2 text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          title="Clear session history"
        >
          <Trash2 size={18} md:size={20} />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto w-full px-4 md:px-8 py-6 space-y-6 md:space-y-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-950"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 px-4 py-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles size={32} md:size={40} className="animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">What's on your mind?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-sm mx-auto">
                  I can help you build resumes, optimize PDF workflows, or explain complex code.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "Help me write a professional summary",
                  "Explain how PDF merging works",
                  "What skills are needed for a designer role?",
                  "Give me 5 motivational quotes"
                ].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left text-sm text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{suggestion}</span>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-10 pb-8">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3 md:gap-4",
                      message.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      message.role === 'user' 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                        : "bg-indigo-600 text-white"
                    )}>
                      {message.role === 'user' ? <User size={16} md:size={20} /> : <Bot size={16} md:size={20} />}
                    </div>
                    <div className={cn(
                      "flex flex-col space-y-1.5 max-w-[85%] sm:max-w-[80%] md:max-w-[70%]",
                      message.role === 'user' ? "items-end text-right" : "items-start text-left"
                    )}>
                      <div className={cn(
                        "px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap break-words",
                        message.role === 'user'
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                      )}>
                        {message.content}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 md:gap-4"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 dark:shadow-none">
                    <Bot size={16} md:size={20} />
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <footer className="p-4 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 sticky bottom-0">
        <div className="relative group max-w-4xl mx-auto w-full">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
            className="w-full h-12 md:h-16 pl-5 pr-14 md:pl-6 md:pr-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-3xl text-sm md:text-base focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 shadow-sm transition-all text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 bottom-1.5 w-10 md:w-16 bg-indigo-600 text-white rounded-lg md:rounded-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-indigo-200 dark:shadow-none"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} md:size={20} />}
          </button>
        </div>
        <p className="text-center mt-3 text-[9px] md:text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">
          AI generated content • session id: {sessionId.current.split('_')[1]}
        </p>
      </footer>
    </div>
  );
}
