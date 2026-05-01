import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  User, 
  Building, 
  Briefcase, 
  Mail, 
  Sparkles,
  Download,
  Terminal,
  Eye,
  Type
} from 'lucide-react';
import { generateAiContent } from '../../services/mistralService';
import { cn } from '../../lib/utils';
import { jsPDF } from 'jspdf';
import SeoContent from '../../components/SeoContent';
import * as htmlToImage from 'html-to-image';

export default function CoverLetter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [letter, setLetter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const letterRef = React.useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    experience: '',
    tone: 'professional'
  });

  const handleGenerate = async () => {
    if (!formData.role || !formData.company) return;
    setIsGenerating(true);
    setLetter('');

    const prompt = `
      Create a highly professional and tailored cover letter for the following position:
      Role: ${formData.role}
      Company: ${formData.company}
      Relevant Experience: ${formData.experience}
      Tone: ${formData.tone}
      
      Requirements:
      - Use a modern, persuasive writing style.
      - Keep it under 300 words.
      - Do not include header address blocks, just start from "Dear Hiring Manager,"
      - Focus on how the experience directly benefits ${formData.company}.
    `;

    try {
      const response = await generateAiContent(prompt, "You are a world-class professional career writer who specializes in getting candidates interviews at top tech companies.");
      setLetter(response);
    } catch (error) {
      console.error(error);
      alert("AI generator is busy. Please try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (!letterRef.current || isExporting) return;
    setIsExporting(true);
    
    try {
      // Create a temporary element for PDF rendering to ensure A4 proportions
      const printArea = document.createElement('div');
      printArea.style.width = '794px'; // 210mm at 96 DPI
      printArea.style.padding = '60px';
      printArea.style.backgroundColor = 'white';
      printArea.style.color = '#1e293b';
      printArea.style.fontFamily = 'serif';
      printArea.style.fontSize = '14pt';
      printArea.style.lineHeight = '1.6';
      printArea.style.whiteSpace = 'pre-wrap';
      printArea.innerText = letter;
      
      document.body.appendChild(printArea);
      
      const dataUrl = await htmlToImage.toPng(printArea, {
        quality: 1.0,
        pixelRatio: 2
      });
      
      document.body.removeChild(printArea);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (printArea.offsetHeight * imgWidth) / printArea.offsetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Cover_Letter_${formData.company.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <header className="mb-8 md:mb-12 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
           <Mail size={12} /> Persuasion Lab
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Cover Letter AI</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl text-sm">Draft persuasive, tailored letters for elite roles in seconds.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-5 space-y-6 md:y-8">
           <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl md:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <InputGroup label="Target Role" value={formData.role} onChange={(v: string) => setFormData({...formData, role: v})} icon={Briefcase} placeholder="e.g. Product Manager" />
              <InputGroup label="Organization" value={formData.company} onChange={(v: string) => setFormData({...formData, company: v})} icon={Building} placeholder="e.g. Google" />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Core Highlights</label>
                <textarea 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="Summarize your top 3 achievements..."
                  className="w-full h-24 md:h-32 px-5 md:px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl text-sm focus:outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <ToneButton active={formData.tone === 'professional'} onClick={() => setFormData({...formData, tone: 'professional'})} label="Formal" />
                 <ToneButton active={formData.tone === 'enthusiastic'} onClick={() => setFormData({...formData, tone: 'enthusiastic'})} label="Witty" />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !formData.role || !formData.company}
                className="w-full py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/20 min-h-[52px]"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGenerating ? 'Drafting Genius...' : 'Generate Letter'}
              </button>
           </div>
        </div>

        <div className="lg:col-span-7">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl md:rounded-[44px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[44px] shadow-sm min-h-[400px] md:min-h-[600px] overflow-hidden flex flex-col">
                 <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-1.5 md:gap-2">
                       <button onClick={() => setIsEditing(!isEditing)} className={cn("p-2 rounded-lg transition-all", isEditing ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-800")}>
                         <Type size={18} />
                       </button>
                       {letter && (
                         <button onClick={copyToClipboard} className="p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">
                           {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                         </button>
                       )}
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-300">Intelligent Preview</div>
                       {letter && <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>}
                       {letter && (
                         <button 
                          onClick={handleExportPdf}
                          disabled={isExporting}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:opacity-70 transition-all disabled:opacity-30"
                         >
                           {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                           <span className="hidden xs:inline">Save PDF</span>
                         </button>
                       )}
                    </div>
                 </div>

                 <div className="flex-1 p-6 md:p-10 font-serif leading-relaxed text-slate-700 dark:text-slate-300 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                       {!letter && !isGenerating && (
                         <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none py-20"
                         >
                            <FileText size={64} strokeWidth={1} className="mb-4" />
                            <h3 className="text-sm font-black uppercase tracking-[4px]">Empty Draft</h3>
                            <p className="text-[10px] font-bold uppercase mt-2">Fill the form to begin</p>
                         </motion.div>
                       )}
                       
                       {isGenerating && (
                         <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="space-y-6 animate-pulse"
                         >
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-24"></div>
                            <div className="space-y-3">
                              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
                              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
                              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6"></div>
                            </div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2"></div>
                         </motion.div>
                       )}

                       {letter && (
                         <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="relative h-full"
                         >
                            {isEditing ? (
                              <textarea 
                                value={letter}
                                onChange={(e) => setLetter(e.target.value)}
                                className="w-full h-full min-h-[400px] bg-transparent focus:outline-none resize-none leading-relaxed text-base"
                              />
                            ) : (
                              <div ref={letterRef} className="whitespace-pre-wrap text-base md:text-lg">
                                {letter}
                              </div>
                            )}
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>

                 <div className="px-6 md:px-8 py-4 md:py-5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Smart Resume Agent v1.0</div>
                    <div className="flex gap-4">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{letter.split(/\s+/).length} Words</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <SeoContent 
        title="Free AI Cover Letter Generator: Land Your Dream Job"
        description="A great cover letter can be the difference between getting an interview and being ignored. Our AI Cover Letter Generator helps you craft persuasive, tailored, and high-impact letters in seconds. By analyzing your target role, the organization, and your key achievements, our intelligent writing assistant produces a professional letter that speaks directly to the hiring manager's needs. Whether you need a formal tone for a corporate role or something more witty for a creative position, we've got you covered."
        features={[
          "AI-Powered Writing: Generate professional content tailored to your specific role and company.",
          "Customizable Tones: Choose between Formal and Witty to match the company's culture.",
          "Live Editor: Refine and edit the AI-generated content directly in your browser.",
          "PDF Export: Download your finished cover letter as a print-ready PDF file.",
          "Smart Highlights: Focus on your top 3 achievements to maximize impact.",
          "Fast & Free: Create as many variations as you need without any cost or sign-up."
        ]}
        steps={[
          "Enter your target role and the company you are applying to.",
          "Summarize your core highlights or achievements in the text box.",
          "Choose your preferred tone (Formal/Formal vs Witty/Enthusiastic).",
          "Click 'Generate Letter' to watch the AI draft your unique letter.",
          "Edit the result if needed and export it as a professional PDF."
        ]}
        benefits={[
          "Save hours of writer's block.",
          "Tailor every application with minimal effort.",
          "Mirror the company's culture with different tones.",
          "Maintain consistent professional formatting.",
          "Impress recruiters with high-quality writing."
        ]}
        faq={[
          { q: "Is the AI cover letter unique?", a: "Yes, our generator uses advanced AI to create unique content every time based on the specific role, company, and experience you provide." },
          { q: "Can I edit the generated letter?", a: "Absolutely. You can click the 'Edit' icon in the preview panel to manually adjust the text before saving or exporting." },
          { q: "How many letters can I generate?", a: "There is no limit on how many cover letters you can generate. Use it for every job application to maximize your chances!" },
          { q: "Is it free to download the PDF?", a: "Yes, the AI generation and the PDF export features are both completely free to use." },
          { q: "Does the AI protect my privacy?", a: "Your input data is processed in real-time to generate your letter and is not permanently stored on our servers." }
        ]}
        ctaTitle="Persuade your next employer."
      />
    </div>
  );
}

function InputGroup({ label, value, onChange, icon: Icon, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-2">
        <Icon size={12} className="text-slate-300" /> {label}
      </label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all text-slate-900 dark:text-white"
      />
    </div>
  );
}

function ToneButton({ active, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
        active 
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg" 
          : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-300"
      )}
    >
      {label}
    </button>
  );
}
