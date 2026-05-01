import React, { useState } from 'react';
import { Youtube, Sparkles, Copy, Check, Loader2, Lightbulb, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { generateYoutubeTitles } from '../services/mistralService';
import SeoContent from '../components/SeoContent';

export default function YoutubeTitles() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('General');
  const [tone, setTone] = useState('High CTR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setResults([]);

    try {
      const titles = await generateYoutubeTitles(topic, audience, tone);
      setResults(titles);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to generate titles');
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
    <div className="tool-container max-w-5xl px-4 sm:px-6">
       <div className="flex flex-col lg:flex-row gap-8 md:gap-12 pb-20 md:pb-0">
          {/* Controls Side */}
          <div className="lg:w-1/3">
             <header className="mb-8 md:mb-10 text-center lg:text-left">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto lg:mx-0">
                   <Youtube size={28} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3 tracking-tight">AI Title Engine</h1>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto lg:mx-0">
                   Get high-clickrate titles powered by SEO intelligence and psychological triggers.
                </p>
             </header>

                 <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1">Video Topic</label>
                  <input 
                    placeholder="e.g. iPhone 15 Pro Review"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1">Target Audience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['General', 'Tech-Savvy', 'Beginners', 'Experts'].map(a => (
                      <button 
                        key={a}
                        onClick={() => setAudience(a)}
                        className={cn(
                          "px-3 py-2 text-[11px] font-bold rounded-lg border transition-all",
                          audience === a 
                            ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1">Title Vibe</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 appearance-none transition-colors"
                  >
                    <option value="High CTR">High CTR (Engagement)</option>
                    <option value="Clickbait (Soft)">Soft Clickbait</option>
                    <option value="Instructional">Tutorial/How-to</option>
                    <option value="Storytelling">Adventure/Story</option>
                    <option value="Controversial">Hot Take</option>
                  </select>
                </div>

                 <button 
                  disabled={!topic || isGenerating}
                  onClick={generate}
                  className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-indigo-500/20"
                >
                  {isGenerating ? <Loader2 className="animate-spin text-white" /> : <Sparkles size={20} />}
                  Generate Titles
                </button>

                <div className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hidden sm:block transition-colors">
                   <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 md:mb-3 flex items-center gap-2">
                     <Lightbulb size={12} className="text-yellow-400" /> Pro Insight
                   </h5>
                   <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                     "The first 3 seconds of your title decide 90% of your CTR. Always front-load your most important keyword."
                   </p>
                </div>
             </div>
          </div>

          {/* Results Side */}
          <div className="lg:w-2/3 min-h-[400px] md:min-h-[500px]">
             <div className="p-1 border border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-950 h-full overflow-hidden flex flex-col shadow-sm transition-colors">
                <div className="px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-t-3xl transition-colors">
                   <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Search size={16} className="text-slate-400 dark:text-slate-500" /> All Titles
                   </h4>
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded tracking-widest">
                      {results.length} IDEAS
                   </span>
                </div>

                <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-3">
                   <AnimatePresence>
                      {results.map((title, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 md:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between group"
                        >
                           <span className="text-slate-800 dark:text-slate-200 font-medium text-xs md:text-sm lg:text-base leading-snug flex-1">{title}</span>
                           <button 
                             onClick={() => copyToClipboard(title, idx)}
                             className="p-2 ml-3 md:ml-4 text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg md:rounded-xl transition-all shrink-0 border border-transparent dark:border-slate-800"
                           >
                             {copiedIndex === idx ? <Check size={18} /> : <Copy size={16} md:size={18} />}
                           </button>
                        </motion.div>
                      ))}
                   </AnimatePresence>

                   {results.length === 0 && !isGenerating && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16 md:py-24">
                        <Youtube size={64} className="opacity-10 mb-4" />
                        <p className="text-xs md:text-sm font-bold opacity-30">Titles will appear here</p>
                      </div>
                   )}

                   {isGenerating && (
                      <div className="py-16 md:py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-xs md:text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Generating viral hooks...</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
       </div>
        <SeoContent 
          className="mt-20 lg:mt-32"
          title="YouTube Title Generator: Optimize Your CTR with AI"
          description="In the world of YouTube, your title is the most important factor for getting clicks. Our AI YouTube Title Generator helps you create attention-grabbing, SEO-optimized titles that stop the scroll and drive views. Using deep psychological drivers and keyword research patterns, our engine provides 10 unique variations for every topic. Whether you need an instructional tutorial title or a storytelling adventure hook, we help you master the art of the 'Front-Loaded' keyword to maximize your channel's growth."
          features={[
            "CTR Mastery: Titles engineered to trigger psychological curiosity and clicks.",
            "Audience Segmentation: Tailored titles for Tech-Savvy, Beginners, or Experts.",
            "Vibe Control: Choose from High CTR, Storytelling, Controversial, or Instructional.",
            "SEO Enrichment: Automatically includes high-impact keywords for better search ranking.",
            "Bulk Idea Generation: Get 10 viral-ready options with a single click.",
            "Zero Daily Limits: Generate as many title ideas as you need to find the perfect one."
          ]}
          steps={[
            "Enter your main video topic or current focus (e.g., iPhone 15 Review).",
            "Select your specific target audience to match their reading style.",
            "Pick a 'Title Vibe' that fits your video's content and marketing goal.",
            "Click 'Generate Titles' to receive a list of 10 optimized hooks.",
            "Copy the best title and see your click-through rate improve."
          ]}
          benefits={[
            "Stop wasting time overthinking your video titles.",
            "Increase your video reach by appearing in search results.",
            "Learn proven title patterns used by top-tier creators.",
            "Keep your channel consistent with professional hooks.",
            "A Completely free tool with no sign-up or credit card required."
          ]}
          faq={[
            { q: "Is this tool free for creators?", a: "Yes, our YouTube Title Generator is 100% free for all creators, from beginners to professional channels." },
            { q: "What does CTR mean?", a: "CTR stands for Click-Through Rate. It is the percentage of people who click on your video after seeing the thumbnail and title." },
            { q: "Are these titles search-optimized?", a: "Yes, the AI prioritizes placing important keywords at the beginning of the title to help with YouTube Search rankings." },
            { q: "Can I use 'Clickbait' titles?", a: "We offer 'Soft Clickbait' options which are highly engaging but honest, avoiding the negative 'spammy' feel of traditional clickbait." },
            { q: "Does the AI support multiple languages?", a: "Currently, our engine is optimized for English, but it can generate titles in major world languages if the input topic is provided in that language." }
          ]}
          ctaTitle="Build a channel that gets noticed."
        />
      </div>
    );
}
