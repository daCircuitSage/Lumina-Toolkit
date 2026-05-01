import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  isCollapsed?: boolean;
}

export default function Logo({ className, isCollapsed }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative group shrink-0">
        <div className="w-10 h-10 bg-lumina-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-lumina-blue/20 transform transition-transform group-hover:scale-105">
          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-xl font-black italic tracking-tighter">L</div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
          <Sparkles size={10} className="text-indigo-500 animate-pulse" />
        </div>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col leading-none">
          <span className="font-heading font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase italic">
            Lumina
          </span>
          <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mt-0.5">
            Toolkit
          </span>
        </div>
      )}
    </div>
  );
}
