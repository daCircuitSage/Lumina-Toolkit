import React, { useState } from 'react';
import { Calendar, RefreshCw, Star, Info } from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays, addYears, isAfter, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import SeoContent from '../components/SeoContent';

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const now = new Date();

    if (isAfter(birth, now)) {
      alert("Birth date cannot be in the future!");
      return;
    }

    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;
    
    // Exact days calculation
    const birthdayThisYear = addYears(birth, years);
    const lastBirthday = isBefore(birthdayThisYear, now) ? birthdayThisYear : addYears(birth, years - 1);
    const days = differenceInDays(now, lastBirthday);

    // Next birthday countdown
    let nextBirthday = addYears(birth, years + (isBefore(birthdayThisYear, now) ? 1 : 0));
    const nextDays = differenceInDays(nextBirthday, now);

    setResult({ years, months, days, nextDays, birthDay: format(birth, 'EEEE') });
  };

  return (
    <div className="tool-container pb-20">
      <div className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl glass-card p-6 md:p-10 shadow-2xl shadow-indigo-500/5"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 md:mb-10 text-center sm:text-left">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Calendar size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Age Calculator</h1>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Precision age & life milestones engine</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px] px-1">Birth Date Selection</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  onBlur={calculate}
                  className="w-full h-14 md:h-16 px-5 md:px-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-lg md:text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={calculate}
              disabled={!dob}
              className="w-full h-14 md:h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={!dob ? "" : "animate-spin-slow"} />
              Calculate My Age
            </button>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4"
                >
                  <div className="p-6 md:p-8 bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[3px] mb-2">Total Chronological Age</div>
                        <div className="text-4xl md:text-5xl font-black flex items-baseline justify-center md:justify-start gap-3">
                          {result.years} <span className="text-sm font-bold opacity-70 uppercase tracking-widest">Yrs</span>
                          {result.months > 0 && <>{result.months} <span className="text-sm font-bold opacity-70 uppercase tracking-widest">Mo</span></>}
                        </div>
                        <p className="text-xs font-bold text-indigo-100 mt-2 opacity-80">
                          {result.days} days since your last birthday
                        </p>
                      </div>
                      <div className="w-px h-12 bg-white/10 hidden md:block" />
                      <div className="text-center md:text-right">
                        <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[3px] mb-2">Birth Weekday</div>
                        <div className="text-xl md:text-2xl font-black">{result.birthDay}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-[28px] bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] mb-3 flex items-center gap-2">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" /> Countdown
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{result.nextDays} <span className="text-[10px] font-bold text-slate-400 uppercase">Days Left</span></div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Until your next birthday</p>
                    </div>

                    <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-[28px] bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] mb-3 flex items-center gap-2">
                        <Info size={14} className="text-indigo-500" /> Life stats
                      </div>
                      <div className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                        You have lived approximately <span className="text-slate-900 dark:text-white font-black">{(result.years * 365 + result.days).toLocaleString()}</span> days on Earth.
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 p-6 md:p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[32px] flex items-center justify-center text-center border-2 border-dashed border-slate-100 dark:border-slate-800"
                >
                   <div className="space-y-2">
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Ready to calculate?</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                       Input your birth data above to begin
                     </p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <SeoContent 
        className="mt-12 md:mt-20 max-w-4xl mx-auto px-4"
        title="Free Chronological Age Calculator: Exact Age in Years, Months, Days"
        description="Knowing your exact age shouldn't requires complex mental math. Our Free Chronological Age Calculator provides a fast, precise, and user-friendly way to determine your current age down to the day. Beyond just years, our tool breaks down your biological timeline into months and days, giving you a comprehensive view of your life milestones. We also include a 'Next Birthday' countdown and total days lived, making it the perfect utility for everything from official document filing to birthday planning."
        features={[
          "Precise Calculation: Get your exact age in years, months, and days.",
          "Birthday Countdown: See exactly how many days are left until your next big celebration.",
          "Life Stats: Discover the total approximate number of days you have lived since birth.",
          "Weekday Identification: Find out which day of the week you were born on (e.g., Monday, Friday).",
          "Future Date Protection: Intelligent validation ensures birth dates cannot be set in the future.",
          "Responsive Design: Works perfectly on mobile, tablet, and desktop browsers."
        ]}
        steps={[
          "Select your Year, Month, and Day of birth using the calendar picker.",
          "Click the 'Calculate Age' button to trigger the precision engine.",
          "Review the 'Total Age' panel for your years and months breakdown.",
          "Check the 'Next Birthday' card to start your countdown.",
          "Explore the 'Life Stats' section for interesting biological milestones."
        ]}
        benefits={[
          "Fast and accurate results instantly.",
          "User-friendly interface with bold, clear typography.",
          "Great for filling out forms or insurance documents.",
          "100% free with no sign-ups or hidden trackers.",
          "Helps you plan your next birthday event perfectly."
        ]}
        faq={[
          { q: "How accurate is the age calculation?", a: "Our calculator uses the 'date-fns' library, which handles leap years and month length variations with high precision." },
          { q: "Is my birth date saved?", a: "No, your data is processed locally in your browser and is never stored on our servers." },
          { q: "Can I use this for official purposes?", a: "Yes, this tool provides the standard chronological age used in most legal and official documents." },
          { q: "What are 'Life Stats'?", a: "They show interesting metrics like the approximate total number of days you've been on Earth." },
          { q: "Does it work on my phone?", a: "Absolutely. Our Age Calculator is fully responsive and optimized for mobile devices." }
        ]}
        ctaTitle="Celebrate every milestone."
      />
    </div>
  );
}
