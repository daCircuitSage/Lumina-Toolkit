import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Trophy,
  Search,
  ExternalLink,
  ChevronDown,
  Building2,
  Calendar,
  MoreVertical,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import SeoContent from '../../components/SeoContent';

type JobStatus = 'applied' | 'interview' | 'rejected' | 'offer';

interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  date: string;
  notes: string;
}

const STATUS_CONFIG: Record<JobStatus, { label: string, icon: any, colors: string }> = {
  applied: { label: 'Applied', icon: Clock, colors: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  interview: { label: 'Interviewing', icon: Plus, colors: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 font-bold' },
  rejected: { label: 'Declined', icon: XCircle, colors: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 opacity-70' },
  offer: { label: 'Offer Received', icon: Trophy, colors: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10' }
};

export default function JobTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Job>>({
    company: '',
    role: '',
    status: 'applied',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const savedJobs = localStorage.getItem('career_jobs');
    if (savedJobs) setJobs(JSON.parse(savedJobs));
  }, []);

  const saveJobs = (updatedJobs: Job[]) => {
    setJobs(updatedJobs);
    localStorage.setItem('career_jobs', JSON.stringify(updatedJobs));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      const updated = jobs.map(j => j.id === editingJob.id ? { ...j, ...formData } as Job : j);
      saveJobs(updated);
    } else {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData as Omit<Job, 'id'>
      };
      saveJobs([newJob, ...jobs]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    setFormData({ company: '', role: '', status: 'applied', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setFormData(job);
    setIsModalOpen(true);
  };

  const deleteJob = (id: string) => {
    if (confirm('Verify: Remove this application from tracking?')) {
      saveJobs(jobs.filter(j => j.id !== id));
    }
  };

  const filteredJobs = jobs
    .filter(j => filter === 'all' || j.status === filter)
    .filter(j => j.company.toLowerCase().includes(searchQuery.toLowerCase()) || j.role.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
             <Trophy size={12} /> Career Pipeline
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Job Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your hunt. Track every application from sent to signed.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl"
        >
          <Plus size={18} /> Log Application
        </button>
      </header>

      {/* Stats Quick Look */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center">
        {(Object.keys(STATUS_CONFIG) as JobStatus[]).map(status => (
          <div key={status} className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className={cn("inline-flex p-3 rounded-2xl mb-4", STATUS_CONFIG[status].colors)}>
              {React.createElement(STATUS_CONFIG[status].icon, { size: 20 })}
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{jobs.filter(j => j.status === status).length}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{STATUS_CONFIG[status].label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-2 sm:p-4 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1 group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
             <input 
              type="text" 
              placeholder="Filter by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl text-sm font-medium focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:bg-white dark:focus:bg-slate-800 transition-all border border-slate-100 dark:border-slate-700"
             />
           </div>
           <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-700">
             <button 
              onClick={() => setFilter('all')}
              className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}
             >
               All
             </button>
             {(Object.keys(STATUS_CONFIG) as JobStatus[]).map(s => (
               <button 
                key={s}
                onClick={() => setFilter(s)}
                className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === s ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}
               >
                 {s}
               </button>
             ))}
           </div>
        </div>

        <div className="space-y-4 overflow-hidden">
          {filteredJobs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Filter size={32} />
              </div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching applications</h3>
              <p className="text-xs text-slate-400 mt-2">Adjust your filters or add a new record.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">
                      <th className="px-6 pb-2">Role & Company</th>
                      <th className="px-6 pb-2">Status</th>
                      <th className="px-6 pb-2">Date Applied</th>
                      <th className="px-6 pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <motion.tr 
                        layout
                        key={job.id}
                        className="bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                      >
                        <td className="px-6 py-5 rounded-l-[32px] border-y border-l border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                              <Building2 size={18} className="text-slate-400" />
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 dark:text-white">{job.role}</div>
                              <div className="text-[10px] font-bold text-slate-400">{job.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                          <div className={cn("inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest items-center gap-1.5", STATUS_CONFIG[job.status].colors)}>
                            {React.createElement(STATUS_CONFIG[job.status].icon, { size: 12 })}
                            {STATUS_CONFIG[job.status].label}
                          </div>
                        </td>
                        <td className="px-6 py-5 border-y border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{job.date}</div>
                        </td>
                        <td className="px-6 py-5 rounded-r-[32px] border-y border-r border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-900 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(job)} className="p-2 text-slate-300 hover:text-blue-500 rounded-lg transition-all"><Edit3 size={16} /></button>
                            <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
                {filteredJobs.map((job) => (
                  <motion.div 
                    layout
                    key={job.id}
                    className="group p-6 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 rounded-[32px] border border-slate-100/50 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          <Building2 size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{job.role}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.company}</span>
                        </div>
                      </div>
                      <div className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest", STATUS_CONFIG[job.status].colors)}>
                        {STATUS_CONFIG[job.status].label}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> {job.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(job)} className="p-2 text-slate-300 hover:text-blue-500 transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl z-[70] overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <header className="mb-4">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Application Details</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: {formData.status}</p>
                </header>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Company" value={formData.company!} onChange={(v) => setFormData({...formData, company: v})} />
                    <Field label="Role" value={formData.role!} onChange={(v) => setFormData({...formData, role: v})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Status</label>
                       <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as JobStatus})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all text-slate-900 dark:text-white appearance-none border border-slate-100 dark:border-slate-700"
                       >
                         {(Object.keys(STATUS_CONFIG) as JobStatus[]).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                       </select>
                    </div>
                    <Field label="Date" type="date" value={formData.date!} onChange={(v) => setFormData({...formData, date: v})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Notes</label>
                    <textarea 
                     value={formData.notes}
                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
                     className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 min-h-[100px] resize-none"
                     placeholder="Reminders, contact names, link to JD..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 text-xs font-black uppercase tracking-widest text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-2xl hover:opacity-90 transition-all shadow-xl">Complete Record</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SeoContent 
        title="Free Job Tracker Online: Organize Your Career Hunt"
        description="Searching for a job is a full-time job in itself. Our Free Job Tracker is designed to help you organize your career pipeline and master the application process from sent to signed. Stop relying on messy spreadsheets or memory. With our intuitive interface, you can log every application, track interview statuses, manage follow-up dates, and celebrate when you finally receive that offer. Our career pipeline overview gives you instant clarity on your progress, helping you stay motivated and focused on landing your next role."
        features={[
          "Application Pipeline: Track status from Applied, Interviewing, to Offer Received.",
          "Real-time Stats: Get a bird's-eye view of your hunt with our visual dashboard.",
          "Detailed Records: Save company names, roles, application dates, and personal notes.",
          "Search & Filter: Quickly find specific applications or filter by status like 'Offer'.",
          "Local Storage: Your data stays on your machine, ensuring 100% privacy and accessibility.",
          "Mobile Ready: Manage your job hunt anytime, anywhere with our fully responsive UI."
        ]}
        steps={[
          "Click 'Log Application' to open the new entry modal.",
          "Enter the company name, role title, and current status.",
          "Add notes about the job description or specific interviewer names.",
          "Use the dashboard stats to see where you need to focus your efforts.",
          "Update statuses as you progress from interviews to the final offer."
        ]}
        benefits={[
          "Never miss a follow-up date again.",
          "Visualize your progress to stay motivated.",
          "Identify which roles or industries are working best for you.",
          "Professional organization for serious career seekers.",
          "Free tool with no account creation or monthly fees."
        ]}
        faq={[
          { q: "Is my data private?", a: "Yes, our tracker uses browser 'localStorage'. This means your job data is saved exclusively on your own device and never touches our servers." },
          { q: "How many jobs can I track?", a: "There is no limit. You can track hundreds of applications without any performance issues." },
          { q: "Can I use this on multiple devices?", a: "Because we use local storage for privacy, data is currently specific to the device and browser you are using." },
          { q: "What should I put in the notes?", a: "We recommend adding the link to the original job description, names of recruiters, and any specific questions they asked during interviews." },
          { q: "Is it free to use forever?", a: "Yes, the Job Tracker is a core part of our free tool suite and will always be available without a subscription." }
        ]}
        ctaTitle="Take control of your hunt."
      />
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all text-slate-900 dark:text-white"
        required
      />
    </div>
  );
}
