import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  HelpCircle, 
  Lightbulb, 
  BrainCircuit, 
  Zap, 
  ChevronRight, 
  Loader2, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  Search,
  Trophy
} from 'lucide-react';
import { generateAiContent } from '../../services/mistralService';
import { cn } from '../../lib/utils';
import SeoContent from '../../components/SeoContent';

interface QaItem {
  question: string;
  answer: string;
  type: 'technical' | 'behavioral' | 'general';
}

export default function InterviewPrep() {
  const [role, setRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'technical' | 'behavioral' | 'general'>('technical');

  const handleGenerate = async () => {
    if (!role) return;
    setIsGenerating(true);
    setQuestions([]);

    const prompt = `
      You are an expert interview coach. Generate 9 diverse interview questions for the role: "${role}".
      Provide 3 of each category: 'technical', 'behavioral', and 'general'.
      For each question, provide a concise, high-impact "model answer" or coaching tip.
      
      Output strictly as a JSON list of objects:
      [
        { "question": "...", "answer": "...", "type": "technical" },
        ...
      ]
    `;

    try {
      const responseText = await generateAiContent(prompt, "You help candidates prepare for their dream jobs with high-quality interview drills.");
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
         setQuestions(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Format error");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to reach the coaching engine. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = questions.filter(q => q.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <header className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 shrink-0 mx-auto md:mx-0">
            <BrainCircuit size={28} />
          </div>
          <div className="text-center md:text-left">
             <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Interview Preparation</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Master your narrative with AI battle drills.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
             <input 
              type="text" 
              placeholder="e.g. Senior Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl text-sm font-bold focus:outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all border border-slate-200 dark:border-slate-800"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
             />
           </div>
           <button 
            onClick={handleGenerate}
            disabled={isGenerating || !role}
            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-xl min-h-[52px]"
           >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            {isGenerating ? 'Synthesizing...' : 'Generate drills'}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
           <TabButton 
            active={activeTab === 'technical'} 
            onClick={() => setActiveTab('technical')} 
            icon={Terminal} 
            title="Technical" 
            desc="Domain depth" 
           />
           <TabButton 
            active={activeTab === 'behavioral'} 
            onClick={() => setActiveTab('behavioral')} 
            icon={MessageSquare} 
            title="S.T.A.R." 
            desc="Soft skills" 
           />
           <TabButton 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
            icon={HelpCircle} 
            title="Classic" 
            desc="Screeners" 
           />
        </div>

        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             {questions.length === 0 ? (
               <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                key="empty"
                className="h-[300px] md:h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl md:rounded-[40px]"
               >
                 {isGenerating ? (
                   <div className="space-y-6">
                      <div className="flex items-center justify-center gap-1.5">
                        {[0, 1, 2].map(i => <div key={i} className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                      </div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Coaching engine loading...</h3>
                   </div>
                 ) : (
                   <>
                    <Sparkles size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Awaiting Command</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-wider">Input your role to begin simulation</p>
                   </>
                 )}
               </motion.div>
             ) : (
               <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                key="results"
                className="space-y-4"
               >
                  {filteredQuestions.map((q, i) => (
                    <motion.div key={i} layout>
                      <QaCard q={q} />
                    </motion.div>
                  ))}
                  
                  {filteredQuestions.length === 0 && (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      Select another category to see more questions.
                    </div>
                  )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      <SeoContent 
        title="AI Interview Preparation: Master Your Job Interviews"
        description="Walking into an interview can be intimidating, but preparation is your secret weapon. Our AI Interview Preparation tool acts as your personal career coach, generating high-impact 'battle drills' tailored to your specific role. By simulating real-world scenarios, our engine provides a balanced mix of Technical, Behavioral (S.T.A.R. method), and General screening questions. Each drill comes with a professional strategy and model answer, helping you refine your narrative and build the confidence needed to land your dream job at top-tier organizations."
        features={[
          "Role-Specific Simulation: Generate questions tailored to any job title, from Frontend Engineer to Product Manager.",
          "Tri-Category Drills: Get specialized practice in Technical domain depth, Behavioral soft skills, and General screening.",
          "S.T.A.R. Method Focus: Master the Situation, Task, Action, Result framework for behavioral questions.",
          "Professional Strategy: Every question includes a high-impact 'Model Answer' or coaching strategy.",
          "Intelligent AI Engine: Powered by advanced AI that understands industry-specific hiring standards.",
          "Unlimited Practice: Generate as many simulation rounds as you need to feel perfectly prepared."
        ]}
        steps={[
          "Enter the job title you are preparing for in the search bar (e.g., Senior Designer).",
          "Click 'Generate Drills' to start the AI coaching simulation.",
          "Use the category tabs to filter through Technical, Behavioral, and General questions.",
          "Click on any question to reveal the 'Strategy' and model answer panel.",
          "Practice your verbal delivery guided by the AI's professional strategies."
        ]}
        benefits={[
          "Reduce interview anxiety through repetitive simulation.",
          "Improve the structure and impact of your behavioral answers.",
          "Stay updated on modern technical interview trends.",
          "Refine your personal career narrative and unique value proposition.",
          "Free access to high-quality coaching without expensive consulting fees."
        ]}
        faq={[
          { q: "How does the AI know the right questions?", a: "Our AI is trained on thousands of real-world interview datasets and job descriptions to understand what hiring managers at elite companies are looking for." },
          { q: "What is the S.T.A.R. method?", a: "S.T.A.R. stands for Situation, Task, Action, and Result. It is the gold standard for answering behavioral interview questions effectively." },
          { q: "Is this tool specific to tech roles?", a: "While we have deep domain knowledge for tech, our AI is versatile and can generate relevant questions for any industry or professional role." },
          { q: "Can I use this for mock interviews?", a: "Absolutely. We recommend reading the questions aloud and recording your response, then comparing your answer to our AI's 'Strategy' section." },
          { q: "Is my personal data safe?", a: "We only use the job role you provide to generate questions in real-time. We do not store your practice sessions on our servers." }
        ]}
        ctaTitle="Master your next interview."
      />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, title, desc }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex lg:flex items-center gap-3 p-4 md:p-6 rounded-2xl md:rounded-[28px] border-2 transition-all text-left",
        active 
          ? "bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-400 shadow-xl shadow-indigo-500/5 scale-[1.02]" 
          : "bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      )}
    >
      <div className={cn(
        "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0",
        active ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-700 text-slate-400"
      )}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h4 className={cn("text-[11px] md:text-sm font-black uppercase tracking-wider transition-colors truncate", active ? "text-slate-900 dark:text-white" : "text-slate-400")}>{title}</h4>
        <p className="hidden xs:block text-[9px] md:text-[10px] font-bold text-slate-400 tracking-wide uppercase truncate">{desc}</p>
      </div>
    </button>
  );
}

function QaCard({ q }: { q: QaItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-8 text-left gap-4"
      >
        <div className="flex gap-3 md:gap-4 items-start">
           <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 font-black text-[10px] md:text-xs">?</span>
           <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight pt-0.5">{q.question}</h3>
        </div>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-slate-300 transition-all", isOpen ? "rotate-90 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500" : "")}>
           <ChevronRight size={20} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-indigo-50/10 dark:bg-indigo-900/5"
          >
            <div className="px-5 md:px-8 pb-6 md:pb-8 pt-0 ml-9 md:ml-12">
               <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-white dark:bg-slate-900 rounded-xl md:rounded-[24px] border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                    <Trophy size={14} className="md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Strategy</h5>
                    <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{q.answer}</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
