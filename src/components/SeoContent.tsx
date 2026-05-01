import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, HelpCircle, ArrowRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface SeoSectionProps {
  title: string;
  description: string;
  features: string[];
  steps: string[];
  benefits: string[];
  faq: { q: string; a: string }[];
  ctaTitle: string;
  className?: string;
}

export default function SeoContent({
  title,
  description,
  features,
  steps,
  benefits,
  faq,
  ctaTitle,
  className
}: SeoSectionProps) {
  return (
    <section className={cn("max-w-6xl mx-auto px-4 py-20 border-t border-slate-100 dark:border-slate-800 mt-20", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          {/* Intro */}
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
              {title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {description}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Star className="text-indigo-500" size={20} /> Key Features
              </h3>
              <ul className="space-y-4">
                {features.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <ArrowRight className="text-indigo-500" size={20} /> How It Works
              </h3>
              <div className="space-y-4">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="text-indigo-500" size={24} /> Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faq.map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">{item.q}</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-2xl shadow-indigo-500/20">
            <h3 className="text-2xl font-black tracking-tight mb-4">{ctaTitle}</h3>
            <ul className="space-y-4 mb-8">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm font-bold text-indigo-100">
                  <CheckCircle2 size={18} className="text-indigo-300 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all active:scale-95"
            >
              Start Using Tool Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
