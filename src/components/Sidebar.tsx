import React, { useState, useEffect } from 'react';
import { TOOLS } from '../constants';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { 
  ChevronRight, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Sparkles, 
  Briefcase, 
  MessageSquare, 
  Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeTool: string;
  onSelect: (id: string) => void;
  onSearchOpen: () => void;
}

export default function Sidebar({ activeTool, onSelect, onSearchOpen }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Close mobile sidebar on navigation
  const handleSelect = (id: string) => {
    onSelect(id);
    setIsMobileOpen(false);
  };

  // Close mobile sidebar on window resize if it was open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 flex items-center px-4 justify-between transition-colors">
        <Logo />
        <div className="flex items-center gap-2">
          <button 
            onClick={onSearchOpen}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent dark:border-slate-800"
          >
            <Search size={20} />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent dark:border-slate-800"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Content (Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-[70] md:hidden flex flex-col shadow-2xl transition-colors"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
              <Logo />
              <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
              <div>
                <p className="px-4 text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-3">General</p>
                <div className="space-y-1">
                  {TOOLS.filter(t => !t.category).map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleSelect(tool.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          isActive 
                            ? "bg-lumina-blue/10 text-lumina-blue font-medium" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-heading font-semibold tracking-tight">{tool.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="px-4 text-[10px] font-black uppercase tracking-[3px] text-lumina-blue mb-3 flex items-center gap-2">
                  <Briefcase size={12} /> Job Toolkit
                </p>
                <div className="space-y-1">
                  {TOOLS.filter(t => t.category === 'Job Toolkit').map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleSelect(tool.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          isActive 
                            ? "bg-lumina-blue/10 text-lumina-blue font-medium" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-heading font-semibold tracking-tight">{tool.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="px-4 text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-3 flex items-center gap-2">
                   System
                </p>
                <div className="space-y-1">
                  {TOOLS.filter(t => t.category === 'System').map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleSelect(tool.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          isActive 
                            ? "bg-lumina-blue/10 text-lumina-blue font-medium" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-heading font-semibold tracking-tight">{tool.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>

            <div className="p-4 border-t border-slate-50 dark:border-slate-800">
               <button 
                onClick={() => handleSelect('contact')}
                className="w-full py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
               >
                 <MessageSquare size={14} /> Contact Support
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        id="app-sidebar"
        initial={false}
        animate={{ width: isOpen ? 260 : 80 }}
        className={cn(
          "hidden md:flex fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex-col transition-all duration-300 overflow-hidden shadow-sm"
        )}
      >
        <div className="p-6 flex items-center justify-between shrink-0 h-20">
          <Logo isCollapsed={!isOpen} />
        </div>

        {/* Desktop Search Trigger */}
        <div className="px-4 mb-4 shrink-0">
          <button
            onClick={onSearchOpen}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm",
              !isOpen && "justify-center"
            )}
          >
            <Search size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
            {isOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span className="text-xs font-medium text-slate-400">Search tools...</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[9px] font-bold text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700 leading-none">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[9px] font-bold text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700 leading-none">K</kbd>
                </div>
              </div>
            )}
            {!isOpen && (
               <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-50 shadow-2xl border border-slate-800 font-black uppercase tracking-widest whitespace-nowrap">
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-slate-800"></div>
                Search (⌘K)
              </div>
            )}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-8 py-4 overflow-y-auto custom-scrollbar">
          <div>
            <div className={cn("text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[3px] px-2 mb-4 transition-all duration-300 flex items-center gap-2", !isOpen ? "opacity-0 invisible" : "opacity-100 visible")}>
              <Sparkles size={12} className="text-slate-300" /> Utility Tools
            </div>
            <div className="space-y-1">
              {TOOLS.filter(t => !t.category).map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                
                return (
                  <NavButton 
                    key={tool.id}
                    tool={tool}
                    isActive={isActive}
                    isOpen={isOpen}
                    onClick={() => handleSelect(tool.id)}
                  />
                );
              })}
            </div>
          </div>

          <div>
             <div className={cn("text-[10px] font-black text-indigo-500/60 dark:text-indigo-400/60 uppercase tracking-[3px] px-2 mb-4 transition-all duration-300 flex items-center gap-2", !isOpen ? "opacity-0 invisible" : "opacity-100 visible")}>
               <Briefcase size={12} /> Job Toolkit
             </div>
             <div className="space-y-1">
               {TOOLS.filter(t => t.category === 'Job Toolkit').map((tool) => {
                 const Icon = tool.icon;
                 const isActive = activeTool === tool.id;
                 
                 return (
                   <NavButton 
                    key={tool.id}
                    tool={tool}
                    isActive={isActive}
                    isOpen={isOpen}
                    onClick={() => handleSelect(tool.id)}
                   />
                 );
               })}
             </div>
          </div>

          <div>
             <div className={cn("text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[3px] px-2 mb-4 transition-all duration-300 flex items-center gap-2", !isOpen ? "opacity-0 invisible" : "opacity-100 visible")}>
               System
             </div>
             <div className="space-y-1">
               {TOOLS.filter(t => t.category === 'System').map((tool) => {
                 const Icon = tool.icon;
                 const isActive = activeTool === tool.id;
                 
                 return (
                   <NavButton 
                    key={tool.id}
                    tool={tool}
                    isActive={isActive}
                    isOpen={isOpen}
                    onClick={() => handleSelect(tool.id)}
                   />
                 );
               })}
             </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
           {isOpen && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-slate-950 dark:bg-slate-950 rounded-2xl p-4 text-white mb-4 border border-white/5"
             >
                <div className="flex items-center justify-between mb-3">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Settings</p>
                   <button 
                    onClick={toggleTheme}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                   >
                     {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                   </button>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Active
                </div>
                <button 
                  onClick={() => handleSelect('contact')}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                >
                  Support
                </button>
             </motion.div>
           )}
           <div className="flex items-center gap-2">
             <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex-1 flex items-center justify-center py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                <Menu size={18} />
             </button>
             {!isOpen && (
              <button 
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
             )}
           </div>
        </div>
      </motion.aside>
      
      {/* Spacer for desktop main content */}
      <motion.div 
        initial={false}
        animate={{ width: isOpen ? 260 : 80 }}
        className="hidden md:block transition-all duration-300 shrink-0" 
      />
    </>
  );
}

function NavButton({ tool, isActive, isOpen, onClick }: any) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
        isActive 
          ? "bg-lumina-blue/10 text-lumina-blue shadow-[0_1px_2px_rgba(0,0,0,0.05)]" 
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      <Icon size={20} className={cn(isActive ? "text-lumina-blue" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
      {isOpen && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-heading font-semibold tracking-tight whitespace-nowrap"
        >
          {tool.name}
        </motion.span>
      )}
      {isActive && isOpen && (
        <motion.div layoutId="active-indicator" className="ml-auto">
          <ChevronRight size={14} className="opacity-40" />
        </motion.div>
      )}
      {!isOpen && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-50 shadow-2xl border border-slate-800 font-black uppercase tracking-widest whitespace-nowrap">
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-slate-800"></div>
          {tool.name}
        </div>
      )}
    </button>
  );
}

