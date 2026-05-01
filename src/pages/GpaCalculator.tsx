import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Rocket, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SeoContent from '../components/SeoContent';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: string;
}

const GRADE_VALUES: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0.0
};

export default function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', grade: 'A', credits: '3' }
  ]);
  const [cgpaData, setCgpaData] = useState({ prevGpa: '', prevCredits: '' });

  const addCourse = () => {
    setCourses([...courses, { id: Date.now().toString(), name: '', grade: 'A', credits: '3' }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length === 1) return;
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculateGpa = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(c => {
      const g = GRADE_VALUES[c.grade] || 0;
      const cr = parseFloat(c.credits) || 0;
      totalPoints += g * cr;
      totalCredits += cr;
    });

    const currentGpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    // CGPA Calculation
    const prevG = parseFloat(cgpaData.prevGpa) || 0;
    const prevC = parseFloat(cgpaData.prevCredits) || 0;
    const finalCgpa = (prevC + totalCredits) > 0 
      ? ((prevG * prevC) + totalPoints) / (prevC + totalCredits) 
      : currentGpa;

    return { currentGpa: currentGpa.toFixed(2), finalCgpa: finalCgpa.toFixed(2), totalCredits };
  };

  const { currentGpa, finalCgpa, totalCredits } = calculateGpa();

  return (
    <div className="tool-container">
      <header className="mb-12">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white transition-colors">
          <Calculator className="text-indigo-600 dark:text-indigo-400" /> GPA & CGPA Calculator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Professional academic performance tracking system.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 md:p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-700 dark:text-slate-200">Course List</h2>
              <button 
                onClick={addCourse}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus size={16} /> <span className="hidden sm:inline">Add Course</span><span className="sm:hidden">Add</span>
              </button>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              <AnimatePresence>
                {courses.map((course) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-50 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-800/20 group relative transition-colors"
                  >
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 px-1">Course Name</label>
                      <input 
                        placeholder="e.g. Advanced Mathematics"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 sm:w-32">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 px-1">Grade</label>
                        <select 
                          value={course.grade}
                          onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                          className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 appearance-none transition-colors"
                        >
                          {Object.keys(GRADE_VALUES).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 px-1">Credits</label>
                        <input 
                          type="number"
                          value={course.credits}
                          onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                          className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeCourse(course.id)}
                      className="absolute -top-2 -right-2 sm:static sm:mt-6 p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 sm:bg-transparent rounded-full shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-700 sm:border-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Rocket size={18} className="text-orange-500" /> Previous History (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-1">Cumulative GPA</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={cgpaData.prevGpa}
                  onChange={(e) => setCgpaData({...cgpaData, prevGpa: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-1">Completed Credits</label>
                <input 
                  type="number"
                  placeholder="0"
                  value={cgpaData.prevCredits}
                  onChange={(e) => setCgpaData({...cgpaData, prevCredits: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20">
              <div className="flex justify-between items-start mb-10 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto sm:mx-0">
                  <Calculator size={24} />
                </div>
                <button 
                  onClick={() => {
                    setCourses([{ id: '1', name: '', grade: 'A', credits: '3' }]);
                    setCgpaData({ prevGpa: '', prevCredits: '' });
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-8 text-center sm:text-left">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[2px] opacity-70 block mb-2">Semester GPA</label>
                  <div className="text-5xl md:text-6xl font-black tracking-tight">{currentGpa}</div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Final CGPA</span>
                    <span className="text-xl font-bold">{finalCgpa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Credits</span>
                    <span className="text-xl font-bold">{parseFloat(cgpaData.prevCredits || '0') + totalCredits}</span>
                  </div>
                </div>
              </div>
           </div>

           <div className="p-6 bg-slate-900 rounded-3xl text-white">
              <h4 className="text-sm font-bold mb-4 text-slate-400">Quick Tips</h4>
              <ul className="space-y-3">
                 <li className="text-xs text-slate-500 leading-relaxed">• Grade points are calculated on a standard 4.0 scale.</li>
                 <li className="text-xs text-slate-500 leading-relaxed">• Ensure all credits match your university's weighting.</li>
                 <li className="text-xs text-slate-500 leading-relaxed">• Target a 3.5+ for Dean's List inclusion.</li>
              </ul>
           </div>
        </div>
      </div>

      <SeoContent 
        title="Free GPA Calculator Online: Track Your Academic Success"
        description="Monitoring your academic performance starts with a clear understanding of your Grade Point Average. Our Free GPA & CGPA Calculator is a professional-grade tool designed for students who want to track their progress accurately. Whether you're calculating your current semester results or projecting your cumulative GPA across multiple years, our platform provides a simple, high-impact interface to manage your grades. We support the standard 4.0 scale used by most secondary and higher education institutions globally, helping you keep your eyes on the Dean's List."
        features={[
          "Semester GPA Calculation: Quickly determine your performance for the current term.",
          "Cumulative GPA Support: Factor in previous credits and GPA for a total overview.",
          "Standard 4.0 Scale: Pre-configured with standard academic grade point values (A+, A, etc.).",
          "Dynamic Course List: Add or remove courses with ease using our fluid interface.",
          "Real-time Results: Watch your GPA update instantly as you change grades or credits.",
          "Mobile Optimized: Track your grades on the go with our fully responsive design."
        ]}
        steps={[
          "Add your courses for the current semester using the 'Add Course' button.",
          "Select the grade you received and the number of credits for each course.",
          "Optionally enter your previous Cumulative GPA and completed credits.",
          "Review your real-time results in the professional 'Result Panel'.",
          "Use the 'Reset' button to start over for a different academic year."
        ]}
        benefits={[
          "Eliminate manual calculation errors.",
          "Keep track of your academic scholarship eligibility.",
          "Project your final grades before the semester ends.",
          "Stay organized throughout your college career.",
          "Free tool with no registration or data tracking."
        ]}
        faq={[
          { q: "How is GPA calculated?", a: "GPA is calculated by dividing the total number of grade points earned (grade value multiplied by credits) by the total number of credits attempted." },
          { q: "What grade scale do you use?", a: "We use a standard 4.0 scale where an 'A' is worth 4.0 points, a 'B' is worth 3.0, and so on. We also support +/- grades for higher precision." },
          { q: "Can I use this for university level?", a: "Yes, our calculator is suitable for high school, college, and university level GPA tracking." },
          { q: "What is the difference between GPA and CGPA?", a: "GPA (Grade Point Average) usually refers to a single semester, while CGPA (Cumulative Grade Point Average) is the average across your entire academic history." },
          { q: "Do I need to save my data?", a: "The tool works in real-time. For a permanent record, we recommend taking a screenshot or manually saving your results as we do not store your grades on our servers." }
        ]}
        ctaTitle="Achieve academic excellence."
      />
    </div>
  );
}
