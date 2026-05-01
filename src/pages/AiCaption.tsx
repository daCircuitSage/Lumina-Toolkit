import React, { useState } from 'react';
import { MessageSquare, Sparkles, Copy, Check, Loader2, Wand2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { generateCaptions } from '../services/mistralService';
import SeoContent from '../components/SeoContent';

export default function AiCaption() {
  const [input, setInput] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Engaging');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = async () => {
    if (!input) return;
    setIsGenerating(true);
    setResults([]);

    try {
      const captions = await generateCaptions(platform, tone, input);
      setResults(captions);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to generate results');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="tool-container max-w-4xl px-4 sm:px-6">
      <header className="mb-8 md:mb-12 text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-colors">
           <MessageSquare size={28} className="md:size-32" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 md:mb-3">AI Caption Generator</h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Create viral-ready captions for your social media posts in seconds.</p>
      </header>

      <div className="space-y-6 md:space-y-8">
        <div className="glass-card p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Target Platform</label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full h-12 md:h-14 px-4 md:px-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-indigo-500 appearance-none transition-colors"
              >
                {['Instagram', 'LinkedIn', 'Twitter (X)', 'TikTok', 'Facebook'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Desired Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full h-12 md:h-14 px-4 md:px-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-indigo-500 appearance-none transition-colors"
              >
                {['Engaging', 'Professional', 'Funny', 'Minimalist', 'Inspiring', 'Provocative'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 mb-6 md:mb-8">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">What is your post about?</label>
            <textarea 
              placeholder="e.g. A photo of my desk setup with the new MacBook and some plants around it..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 md:px-6 py-4 md:py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl md:rounded-2xl text-sm md:text-base focus:outline-none focus:border-indigo-500 min-h-[100px] md:min-h-[120px] resize-none transition-colors"
            />
          </div>

          <button 
            disabled={!input || isGenerating}
            onClick={generate}
            className="w-full h-14 md:h-16 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
            {isGenerating ? 'Analyzing Content...' : 'Generate Magic Captions'}
          </button>
        </div>

        <div className="space-y-4 pb-20">
          <AnimatePresence>
            {results.map((caption, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl shadow-sm hover:border-indigo-200 transition-colors relative group"
              >
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <button 
                     onClick={() => copyToClipboard(caption, idx)}
                     className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg md:rounded-xl transition-all border border-transparent dark:border-slate-700"
                  >
                    {copiedIndex === idx ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[2px] mb-3 md:mb-4">Option 0{idx + 1}</div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed pr-10 md:pr-12 text-sm md:text-lg whitespace-pre-wrap">{caption}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isGenerating && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-300">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p className="text-sm font-medium animate-pulse">Consulting the AI copywriter...</p>
            </div>
          )}
        </div>
      </div>

      <SeoContent 
        className="mt-0"
        title="AI Social Media Caption Generator: Boost Your Engagement"
        description="Struggling to find the right words for your latest post? Our AI Social Media Caption Generator is here to help you craft viral-ready captions in seconds. Whether you're posting on Instagram, LinkedIn, TikTok, or Twitter (X), our move-beyond-generic writing engine understands platform nuances and audience psychology. Stop staring at a blank screen and start generating high-engagement captions that resonate with your followers and drive real interaction."
        features={[
          "Platform Optimization: Tailored content for Instagram, LinkedIn, TikTok, and more.",
          "Emotional Tones: Choose from Engaging, Professional, Funny, Minimalist, or Inspiring.",
          "Bulk Generation: Get multiple creative variations for every post concept.",
          "Natural Language: AI that writes like a human, not a robot.",
          "Instant Copy: One-click copying to quickly move your content to social apps.",
          "Free Forever: No subscriptions or hidden fees to generate your best content."
        ]}
        steps={[
          "Select your target social media platform (e.g., Instagram).",
          "Choose the desired tone of voice (e.g., Funny or Inspiring).",
          "Briefly describe what your post is about in the text area.",
          "Click 'Generate Magic Captions' to see instant AI results.",
          "Copy your favorite option and watch your engagement grow."
        ]}
        benefits={[
          "Be consistent with your posting schedule.",
          "Save hours of creative brainstorming.",
          "Improve your social media reach and impact.",
          "Sound professional or funny without the stress.",
          "Focus on creating great visuals while we handle copy."
        ]}
        faq={[
          { q: "Which platforms are supported?", a: "We support Instagram, LinkedIn, Twitter (X), TikTok, and Facebook, with more being added constantly." },
          { q: "Can the AI use emojis?", a: "Yes, our AI copywriter naturally includes relevant emojis to make your captions pop and improve engagement." },
          { q: "Is the content original?", a: "Absolutely. Every caption is generated in real-time, ensuring unique content for every user input." },
          { q: "How long are the captions?", a: "The length varies based on the platform you select. LinkedIn captions are more detailed, while Twitter and Instagram are more concise." },
          { q: "Is it really free?", a: "Yes, the AI Caption Generator is 100% free with no daily limits on how many captions you can create." }
        ]}
        ctaTitle="Stop overthinking, start posting."
      />
    </div>
  );
}
