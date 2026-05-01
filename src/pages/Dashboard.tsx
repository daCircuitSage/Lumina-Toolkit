import React from 'react';
import { TOOLS } from '../constants';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Dashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const mainTools = TOOLS.filter(t => t.id !== 'dashboard');

  return (
    <div className="tool-container px-6 md:px-10 py-10 md:py-16">
      <header className="mb-12 md:mb-20 flex flex-col items-center md:items-start text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold mb-4"
        >
          <Sparkles size={14} />
          Welcome to Lumina Toolkit V1.0
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-slate-900 dark:text-white mb-4 max-w-3xl leading-[1.1]">
          Everything you need to <span className="text-lumina-blue glow-sm">create & succeed.</span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          The ultimate companion for students and content creators. 
          Streamline your workflow with AI-powered generators, professional builders, and precision tools.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {mainTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                <Icon size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {tool.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                Launch tool <ArrowRight size={14} />
              </div>
              
              {/* Subtle background decoration */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full opacity-50 dark:opacity-20 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors" />
            </motion.button>
          );
        })}
      </div>

      <footer className="mt-20 py-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
            <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold">L</span>
            </div>
            © 2026 Lumina Toolkit. Made for the next generation.
         </div>
         <div className="flex gap-6 text-sm text-slate-400 dark:text-slate-500">
           <button onClick={() => onNavigate('contact')} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Feedback</button>
           <button onClick={() => onNavigate('contact')} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Report Bug</button>
           <button onClick={() => onNavigate('contact')} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Request Feature</button>
         </div>
      </footer>
    </div>
  );
}
