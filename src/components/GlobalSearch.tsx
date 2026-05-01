import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, X, ArrowRight, Sparkles, Briefcase, Settings } from 'lucide-react';
import { TOOLS } from '../constants';
import { cn } from '../lib/utils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function GlobalSearch({ isOpen, onClose, onSelect }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = query.trim() === '' 
    ? [] 
    : TOOLS.filter(tool => 
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        (tool.category && tool.category.toLowerCase().includes(query.toLowerCase()))
      );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(filteredTools.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + Math.max(filteredTools.length, 1)) % Math.max(filteredTools.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          handleSelect(filteredTools[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] transition-all"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-[95vw] max-w-2xl sm:w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-3xl sm:rounded-3xl shadow-2xl z-[110] overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[85vh] sm:max-h-[80vh]"
          >
            <div className="flex items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800">
              <Search className="text-slate-400 mr-3 sm:mr-4" size={18} />
              <input
                ref={inputRef}
                type="text"
                placeholder="What tool do you need today?"
                className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-slate-900 dark:text-white placeholder-slate-400 font-medium"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
              />
              <div className="flex items-center gap-1.5 ml-2 sm:ml-4">
                <kbd className="px-1.5 sm:px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700 leading-none hidden sm:block">ESC</kbd>
                <button 
                  onClick={onClose}
                  className="sm:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto p-2 sm:p-3 custom-scrollbar">
              {query.trim() === '' ? (
                <div className="p-4 space-y-6">
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-4 px-2">Popular Tools</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {TOOLS.slice(1, 5).map(tool => (
                         <QuickActionButton key={tool.id} tool={tool} onClick={() => handleSelect(tool.id)} />
                       ))}
                     </div>
                   </div>
                   <div className="flex items-center justify-center py-10 text-center">
                      <div>
                        <div className="w-12 h-12 bg-lumina-blue/10 rounded-2xl flex items-center justify-center text-lumina-blue mx-auto mb-4">
                          <Command size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Ready for your command</p>
                        <p className="text-xs text-slate-400 mt-1">Start typing to find what you're looking for</p>
                      </div>
                   </div>
                </div>
              ) : filteredTools.length > 0 ? (
                <div className="space-y-1">
                  {filteredTools.map((tool, index) => {
                    const Icon = tool.icon;
                    const isActive = index === selectedIndex;
                    return (
                      <button
                        key={tool.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => handleSelect(tool.id)}
                        className={cn(
                          "w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all text-left group min-h-[44px] sm:min-h-auto",
                          isActive 
                            ? "bg-lumina-blue text-white shadow-xl shadow-lumina-blue/20 dark:shadow-none" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-lumina-blue"
                        )}>
                          <Icon size={18} className="sm:size-24" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("font-heading font-bold text-sm sm:text-base", isActive ? "text-white" : "text-slate-900 dark:text-white")}>
                            {tool.name}
                          </div>
                          <div className={cn("text-xs truncate", isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-400")}>
                            {tool.description}
                          </div>
                        </div>
                        {tool.category && (
                          <div className={cn(
                            "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border shrink-0 hidden sm:block",
                            isActive 
                              ? "bg-white/20 border-white/20 text-white" 
                              : "bg-lumina-blue/10 border-lumina-blue/10 text-lumina-blue"
                          )}>
                            {tool.category === 'Job Toolkit' ? 'Career' : tool.category}
                          </div>
                        )}
                        <ArrowRight size={16} className={cn("transition-transform group-hover:translate-x-1 shrink-0 hidden sm:block", isActive ? "opacity-100" : "opacity-0")} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-4">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No tools found</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different search term or category</p>
                </div>
              )}
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hidden sm:block">Enter</span>
                  <span className="sm:hidden">Tap to select</span>
                  <span className="hidden sm:block">Select</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hidden sm:block">↑↓</span>
                  <span className="sm:hidden">Swipe to navigate</span>
                  <span className="hidden sm:block">Navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-lumina-blue uppercase tracking-widest text-center sm:text-left">
                Lumina Intelligence Platform
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function QuickActionButton({ tool, onClick }: any) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-left group min-h-[44px]"
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-lumina-blue/10 flex items-center justify-center text-lumina-blue group-hover:scale-110 transition-transform shrink-0">
        <Icon size={16} className="sm:size-20" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-xs font-heading font-bold text-slate-900 dark:text-white truncate">{tool.name}</p>
        <p className="text-[9px] sm:text-[10px] text-slate-400 line-clamp-1">{tool.description}</p>
      </div>
    </button>
  );
}
