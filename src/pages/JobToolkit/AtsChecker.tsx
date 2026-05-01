import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Search, AlertCircle, CheckCircle2, 
  RefreshCcw, Loader2, BarChart3, ChevronRight, 
  Upload, X, FileUp, Zap
} from 'lucide-react';
import { generateAiContent } from '../../services/mistralService';
import { cn } from '../../lib/utils';
import SeoContent from '../../components/SeoContent';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function AtsChecker() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(' ') + '\n';
    }
    return text;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        setResume(text);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setResume(result.value);
      } else {
        alert('Unsupported file type. Please upload a PDF or DOCX file.');
        setFileName(null);
      }
    } catch (error) {
      console.error('Extraction Error:', error);
      alert('Failed to extract text from file.');
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume) return;
    setIsAnalyzing(true);
    setResult(null);

    const prompt = `
      Analyze the following resume content against the provided job description (if any).
      
      Resume:
      ${resume}
      
      Job Description:
      ${jobDescription || 'N/A'}
      
      Provide a highly structured JSON response with the following fields:
      - score: number (0-100)
      - keywordMatch: string[] (top 5 matched keywords)
      - missingKeywords: string[] (top 5 important missing keywords found in JD)
      - suggestions: string[] (3 specific improvement tips)
      - summary: string (2-sentence verdict)
    `;

    try {
      const responseText = await generateAiContent(prompt, "You are a senior recruitment specialist and ATS (Applicant Tracking System) expert. Your goal is to help candidates optimize their resumes for machine parsers and human recruiters.");
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <header className="mb-8 md:mb-10 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
          <BarChart3 size={12} /> Optimization Engine
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">ATS Score Checker</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Analyze your resume against machine algorithms.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between gap-2 px-1">
              <span className="flex items-center gap-2"><FileText size={16} className="text-emerald-500" /> Resume Source</span>
              {resume && (
                <button 
                  onClick={() => { setResume(''); setFileName(null); }}
                  className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-black text-[10px] uppercase tracking-widest"
                >
                  <X size={14} /> Clear Content
                </button>
              )}
            </label>
            
            {!resume ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative min-h-[220px] md:h-80 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-500/5 transition-all shadow-sm"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  accept=".pdf,.docx"
                  className="hidden" 
                />
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all mb-6">
                  {isExtracting ? <Loader2 size={36} className="animate-spin" /> : <Upload size={36} />}
                </div>
                <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-2">
                  {isExtracting ? 'Extracting text...' : 'Upload Resume'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">Select PDF or DOCX file. All data is processed locally in your browser.</p>
              </div>
            ) : (
              <div className="relative group">
                <textarea 
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste or edit your resume text here..."
                  className="w-full h-64 md:h-80 px-6 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-none dark:text-white leading-relaxed font-medium"
                />
                {fileName && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 max-w-[60%] px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-xl">
                    <FileUp size={12} className="text-emerald-400 shrink-0" /> 
                    <span className="truncate">{fileName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
             <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 px-1">
               <Search size={16} className="text-emerald-500" /> Job Description
             </label>
             <textarea 
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
               placeholder="Paste the target job description to verify keyword matching..."
               className="w-full h-40 md:h-48 px-6 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-none dark:text-white leading-relaxed font-medium"
             />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !resume}
            className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-black uppercase tracking-[3px] text-xs hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/10 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
              {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
              {isAnalyzing ? 'Analyzing Alignment...' : 'Start ATS Scan'}
            </span>
          </button>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 md:p-12 border-4 border-dashed border-slate-100 dark:border-slate-800/50 rounded-[48px] bg-slate-50/50 dark:bg-transparent"
              >
                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-200 dark:text-slate-800 mb-8 shadow-sm">
                  <BarChart3 size={48} />
                </div>
                <h3 className="text-xl font-black text-slate-400 dark:text-slate-700 uppercase tracking-[4px]">Awaiting Data</h3>
                <p className="text-slate-400 dark:text-slate-600 text-sm mt-3 font-medium max-w-[280px] leading-relaxed">Upload your professional credits to begin the real-time keyword alignment analysis.</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] shadow-2xl shadow-emerald-500/5"
              >
                <div className="relative w-28 h-28 mb-8">
                  <div className="absolute inset-0 border-4 border-emerald-50 dark:border-emerald-900/10 rounded-full" />
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <Zap size={40} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[4px] mb-4">Deep Scanning</h3>
                <div className="space-y-2">
                  <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">Parsing Structure</p>
                  <p className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">Cross-referencing domain keywords...</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none hidden lg:block">
                    <BarChart3 size={200} />
                  </div>
                  
                  <div className="flex flex-col items-center gap-8 mb-12">
                    <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={377} strokeDashoffset={377 - (377 * result.score) / 100} className="text-emerald-500 transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-widest">{result.score}%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alignment</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-[11px] font-black uppercase tracking-[5px] text-emerald-500 mb-4">Final Verdict</h4>
                      <p className="text-sm md:text-base font-bold text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">{result.summary}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-6 md:p-8 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[32px] border border-emerald-100 dark:border-emerald-900/20">
                      <h5 className="text-[10px] font-black uppercase tracking-[3px] text-emerald-600 dark:text-emerald-400 mb-5 flex items-center gap-3">
                        <CheckCircle2 size={16} /> Key Strengths
                      </h5>
                      <div className="flex flex-wrap gap-2.5">
                        {result.keywordMatch.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 md:p-8 bg-orange-50/50 dark:bg-orange-900/10 rounded-[32px] border border-orange-100 dark:border-orange-900/20">
                      <h5 className="text-[10px] font-black uppercase tracking-[3px] text-orange-600 dark:text-orange-400 mb-5 flex items-center gap-3">
                        <AlertCircle size={16} /> Critical Gaps
                      </h5>
                      <div className="flex flex-wrap gap-2.5">
                        {result.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 border border-orange-100 dark:border-orange-900/30 shadow-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12 bg-slate-900 dark:bg-slate-100 rounded-[48px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                  <h4 className="text-[10px] font-black uppercase tracking-[5px] text-slate-400 dark:text-slate-500 mb-8 flex items-center gap-3 relative z-10">
                    <ChevronRight size={18} className="text-emerald-500" /> Enhancement Roadmap
                  </h4>
                  <div className="space-y-6 relative z-10">
                    {result.suggestions.map((tip: string, i: number) => (
                      <div key={i} className="flex gap-6 items-start group/tip">
                        <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-white/10 dark:bg-slate-900/10 text-emerald-500 text-[12px] font-black flex items-center justify-center group-hover/tip:scale-110 transition-transform">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-300 dark:text-slate-600 font-bold leading-relaxed pt-1 flex-1">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SeoContent 
        title="ATS Score Checker Free Tool: Optimize Your Resume for Success"
        description="Understanding how your resume performs against Applicant Tracking Systems (ATS) is crucial in today's competitive job market. Our Free ATS Score Checker uses advanced algorithms to scan your resume just like a top-tier recruiter's software would. By comparing your skills and experience against specific job descriptions, we provide a detailed compatibility score, identify missing high-impact keywords, and offer actionable suggestions to help you bypass machine filters and reach the hiring manager's desk."
        features={[
          "Deep Keyword Analysis: Identify matched and missing keywords based on real job descriptions.",
          "File Support: Upload resumes directly in PDF or DOCX format for instant parsing.",
          "Compatibility Scoring: Get a clear percentage score of how well your resume matches the job.",
          "Actionable Insights: Receive specific tips to improve your resume structure and content.",
          "AI-Powered Verdict: Get a 2-sentence expert summary of your resume's current strength.",
          "Privacy First: Your resume content is processed securely and never stored on our servers."
        ]}
        steps={[
          "Upload your existing resume in PDF or Word format.",
          "Optionally paste the job description you are targeting.",
          "Click 'Check ATS Score' to trigger the deep scanning engine.",
          "Review your matched keywords and missing impact areas.",
          "Apply the suggested improvements to your resume for better results."
        ]}
        benefits={[
          "Bypass machine-based resume filters.",
          "Tailor your resume precisely to job requirements.",
          "Understand recruiter-side keyword priorities.",
          "Professional analysis in under 30 seconds.",
          "Increase your interview call-back rate."
        ]}
        faq={[
          { q: "What is an ATS score?", a: "An ATS score is a percentage that reflects how well your resume's text matches a job's specific requirements and keywords, as seen by Applicant Tracking Systems." },
          { q: "How can I improve my ATS score?", a: "You can improve your score by including exact keywords from the job description, using standard headings, and avoiding complex graphics that might confuse parsers." },
          { q: "Is the ATS Checker safe for my data?", a: "Yes, we process your information in real-time. Your resume data is used only for the current analysis session and is not saved or shared." },
          { q: "Does the tool support PDF resumes?", a: "Yes, our tool can extract and analyze text directly from both PDF and DOCX files for your convenience." },
          { q: "Do I need the job description to use it?", a: "While optional, providing a job description allows the tool to give you a much more accurate match score and specific keyword recommendations." }
        ]}
        ctaTitle="Be the candidate they can't ignore."
      />
    </div>
  );
}
