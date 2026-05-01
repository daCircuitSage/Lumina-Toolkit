import React, { useState, useRef, useLayoutEffect } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  User, 
  Briefcase, 
  Wrench, 
  Eye,
  Edit3,
  Loader2,
  Layout,
  Palette,
  ChevronUp,
  ChevronDown,
  Camera,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Github,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SeoContent from '../components/SeoContent';

type TemplateId = 'modern' | 'ats' | 'minimal' | 'creative' | 'corporate' | 'elegant' | 'techno' | 'executive' | 'designer' | 'hybrid';

interface SectionConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

interface ResumeData {
  settings: {
    primaryColor: string;
    fontFamily: string;
    fontSize: number; // 0, 1, 2 for Small, Medium, Large
    lineHeight: number;
    margins: number;
  };
  sections: SectionConfig[];
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
    photo?: string;
  };
  experience: Array<{
    id: string;
    role: string;
    company: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    period: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    link: string;
    description: string;
    image?: string;
  }>;
  skills: string[];
}

const INITIAL_DATA: ResumeData = {
  settings: {
    primaryColor: '#6366f1', // Indigo 500
    fontFamily: 'font-sans',
    fontSize: 1,
    lineHeight: 1.5,
    margins: 40,
  },
  sections: [
    { id: 'personal', name: 'Identity', visible: true, order: 0 },
    { id: 'summary', name: 'Profile', visible: true, order: 1 },
    { id: 'experience', name: 'Experience', visible: true, order: 2 },
    { id: 'projects', name: 'Projects', visible: true, order: 3 },
    { id: 'education', name: 'Education', visible: true, order: 4 },
    { id: 'skills', name: 'Skills', visible: true, order: 5 },
  ],
  personal: {
    fullName: 'Alex River',
    email: 'alex@example.com',
    phone: '+1 234 567 890',
    location: 'San Francisco, CA',
    website: 'alexriver.design',
    summary: 'Creative problem solver with 5 years of experience building digital products. specialized in crafting visual identities and interactive experiences.',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop'
  },
  experience: [
    {
      id: '1',
      role: 'Senior Product Designer',
      company: 'TechFlow',
      period: '2021 - Present',
      description: 'Led the design of a new mobile app that reached 1M+ downloads. Developed design systems and improved user retention by 25%.'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'Lumina Dashboard',
      link: 'lumina.io',
      description: 'A comprehensive analytics suite for SaaS startups, focusing on real-time data visualization.',
      image: 'https://images.unsplash.com/photo-1551288049-bbda48658a7d?w=800&q=80'
    }
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. in Computer Science',
      school: 'Stanford University',
      period: '2016 - 2020'
    }
  ],
  skills: ['React', 'TypeScript', 'UI/UX Design', 'Figma', 'Node.js', 'AWS', 'Python']
};

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'templates'>('content');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const componentRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Scaling Engine
  useLayoutEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      
      const containerWidth = previewContainerRef.current.offsetWidth;
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 768; // Changed from 1024 to 768 for better mobile detection
      
      const horizontalPadding = isMobile ? 16 : 64; // Reduced padding for mobile
      const availableWidth = containerWidth - horizontalPadding;
      const resumeA4Width = 794; 
      
      let newScale = availableWidth / resumeA4Width;
      
      // Better mobile scaling
      if (isMobile) {
        if (newScale > 0.8) newScale = 0.8; // Smaller max scale on mobile
        if (newScale < 0.25) newScale = 0.25; // Allow smaller scale on very small screens
      } else {
        if (newScale > 1.1) newScale = 1.1;
        if (newScale < 0.3) newScale = 0.3;
      }
      
      setScale(newScale);
    };

    updateScale();
    const timer = setTimeout(updateScale, 100);
    
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [viewMode]);

  // Load draft on mount
  useLayoutEffect(() => {
    const savedDraft = localStorage.getItem('resume_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setData(prev => ({
          ...INITIAL_DATA,
          ...parsed,
          settings: { ...INITIAL_DATA.settings, ...parsed.settings },
          personal: { ...INITIAL_DATA.personal, ...parsed.personal },
          // Ensure arrays exist
          sections: parsed.sections || INITIAL_DATA.sections,
          experience: parsed.experience || INITIAL_DATA.experience,
          education: parsed.education || INITIAL_DATA.education,
          projects: parsed.projects || INITIAL_DATA.projects,
          skills: parsed.skills || INITIAL_DATA.skills,
        }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    localStorage.setItem('resume_draft', JSON.stringify(data));
    alert('Draft saved successfully!');
  };

  const handleExportPdf = async () => {
    if (!componentRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const element = componentRef.current;
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  // State Update Helpers
  const updateSettings = (field: keyof typeof data.settings, value: any) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: value }
    }));
  };

  const updatePersonal = (field: keyof typeof data.personal, value: string) => {
    setData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonal('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), role: '', company: '', period: '', description: '' }]
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now().toString(), name: '', link: '', description: '' }]
    }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), degree: '', school: '', period: '' }]
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const addSkill = (skill: string) => {
    if (!skill || data.skills.includes(skill)) return;
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
  };

  const removeSkill = (skill: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const toggleSection = (id: string) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === data.sections.length - 1)) return;
    const newSections = [...data.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setData(prev => ({ ...prev, sections: newSections }));
  };

  const templates: { id: TemplateId, name: string, description: string }[] = [
    { id: 'modern', name: 'Modern', description: 'Clean, bold, and high-impact design.' },
    { id: 'ats', name: 'ATS Friendly', description: 'Simple, readable, and parser-optimized.' },
    { id: 'minimal', name: 'Minimal', description: 'Ultra-clean with focus on typography.' },
    { id: 'creative', name: 'Creative', description: 'Distinctive accents for designers and artists.' },
    { id: 'corporate', name: 'Corporate', description: 'Traditional, serif-driven, and authoritative.' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated layout with centered headers.' },
    { id: 'techno', name: 'Techno', description: 'Cyber-inspired design for developers.' },
    { id: 'executive', name: 'Executive', description: 'Premium feel for high-level individuals.' },
    { id: 'designer', name: 'Designer', description: 'Perfect for showcasing portfolio work.' },
    { id: 'hybrid', name: 'Hybrid', description: 'Best of both modern and classic styles.' }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] md:h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Mobile Sticky Navigation */}
      <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shrink-0">
        <button 
          onClick={() => setViewMode('editor')}
          className={cn(
            "flex-1 py-4 text-xs font-black uppercase tracking-[2px] flex items-center justify-center gap-2 transition-all relative",
            viewMode === 'editor' 
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" 
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          <Edit3 size={14} /> 
          <span>Edit</span>
          {viewMode === 'editor' && (
            <motion.div layoutId="activeMobileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
        <button 
          onClick={() => setViewMode('preview')}
          className={cn(
            "flex-1 py-4 text-xs font-black uppercase tracking-[2px] flex items-center justify-center gap-2 transition-all relative",
            viewMode === 'preview' 
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" 
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          <Eye size={14} /> 
          <span>Preview</span>
          {viewMode === 'preview' && (
            <motion.div layoutId="activeMobileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
      </div>

      {/* Editor Panel */}
      <div className={cn(
        "w-full lg:w-1/2 h-full overflow-y-auto custom-scrollbar transition-all duration-300 border-r border-slate-200 dark:border-slate-800",
        viewMode === 'preview' ? "hidden lg:block" : "block lg:block"
      )}>
        {/* Tab Navigation */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex px-4 sm:px-6 lg:px-10 overflow-x-auto">
          {[
            { id: 'content', label: 'Content', icon: Edit3 },
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'templates', label: 'Templates', icon: Layout },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-6 py-5 text-xs font-black uppercase tracking-[2px] transition-all relative whitespace-nowrap",
                activeTab === tab.id 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-4 lg:p-6 lg:p-16 max-w-3xl mx-auto lg:mx-0 lg:max-w-none">
          <AnimatePresence mode="wait">
            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <header className="mb-10">
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Resume Templates</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Choose a foundation for your professional story.</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={cn(
                        "flex flex-col text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden group",
                        selectedTemplate === t.id 
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400" 
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900"
                      )}
                    >
                      <div className={cn(
                        "w-full h-32 mb-4 rounded-xl border border-dashed flex items-center justify-center transition-all",
                        selectedTemplate === t.id ? "bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
                      )}>
                        <Layout size={32} className={selectedTemplate === t.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-200 dark:text-slate-800"} />
                      </div>
                      <span className={cn(
                        "text-sm font-black uppercase tracking-widest mb-1",
                        selectedTemplate === t.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
                      )}>{t.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t.description}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-12"
              >
                <header>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Design Customization</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Fine-tune the aesthetics to match your brand.</p>
                </header>

                <div className="space-y-8">
                  {/* Color Picker */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 px-1">Primary Theme Color</label>
                    <div className="flex flex-wrap gap-3">
                      {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#0f172a'].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSettings('primaryColor', color)}
                          className={cn(
                            "w-10 h-10 rounded-full transition-all ring-offset-4 dark:ring-offset-slate-950",
                            data.settings.primaryColor === color ? "ring-2 ring-indigo-500 scale-110" : "hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font Setting */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 px-1">Typography Style</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'font-sans', name: 'Inter (Sans)', description: 'Modern & readable' },
                        { id: 'font-serif', name: 'Merriweather', description: 'Classic & authoritative' },
                        { id: 'font-mono', name: 'JetBrains', description: 'Technical & clean' },
                        { id: 'font-outfit', name: 'Outfit', description: 'Friendly & geometric' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => updateSettings('fontFamily', f.id)}
                          className={cn(
                            "p-3 sm:p-4 text-left rounded-2xl border-2 transition-all",
                            data.settings.fontFamily === f.id ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                          )}
                        >
                          <span className={cn("block text-xs sm:text-sm font-bold mb-1", f.id)}>{f.name}</span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest">{f.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Page Margins</label>
                        <span className="text-[10px] font-black text-indigo-500">{data.settings.margins}px</span>
                      </div>
                      <input 
                        type="range" min="20" max="80" step="5"
                        value={data.settings.margins} onChange={(e) => updateSettings('margins', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Line Height</label>
                        <span className="text-[10px] font-black text-indigo-500">{data.settings.lineHeight}</span>
                      </div>
                      <input 
                        type="range" min="1.1" max="2" step="0.1"
                        value={data.settings.lineHeight} onChange={(e) => updateSettings('lineHeight', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Section Management */}
                  <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 block px-1">Section Arrangement</label>
                    <div className="space-y-3">
                      {(data.sections || []).map((section, index) => (
                        <div 
                          key={section.id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group transition-all hover:border-indigo-200 dark:hover:border-indigo-900"
                        >
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleSection(section.id)}
                              className={cn(
                                "flex items-center justify-center w-5 h-5 rounded border transition-all",
                                section.visible ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700 hover:border-indigo-400"
                              )}
                            >
                              {section.visible && <Plus size={14} className="rotate-45" />}
                            </button>
                            <span className={cn("text-xs font-black uppercase tracking-widest transition-all", !section.visible && "opacity-40")}>
                               {section.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg disabled:opacity-0"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button 
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === data.sections.length - 1}
                              className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg disabled:opacity-0"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-12"
              >
                <header className="mb-3 sm:mb-4">
                   <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Content Builder</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Write the data for your dynamic resume sections.</p>
                </header>

                <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                  <Section icon={User} title="Identity">
                    <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
                      <div className="relative group shrink-0">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all hover:border-indigo-500 cursor-pointer group"
                        >
                          {data.personal.photo ? (
                            <div className="relative w-full h-full">
                              <img src={data.personal.photo} alt="Profile" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={16} className="sm:size-20 lg:size-24 text-white" />
                              </div>
                            </div>
                          ) : (
                            <Camera size={20} className="sm:size-24 lg:size-32 text-slate-300" />
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <input 
                          type="text" 
                          placeholder="Image URL (Optional)" 
                          value={data.personal.photo} 
                          onChange={(e) => updatePersonal('photo', e.target.value)}
                          className="absolute -bottom-2 -left-3 -right-3 sm:-left-4 sm:-right-4 lg:-left-4 lg:-right-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full px-2 sm:px-3 lg:px-4 py-1.5 text-[7px] sm:text-[8px] lg:text-[9px] font-black uppercase tracking-widest shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all focus:outline-none focus:ring-2 ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full">
                        <Input label="Full Name" value={data.personal.fullName} onChange={(v: string) => updatePersonal('fullName', v)} />
                        <Input label="Email Address" value={data.personal.email} onChange={(v: string) => updatePersonal('email', v)} />
                        <Input label="Phone Number" value={data.personal.phone} onChange={(v: string) => updatePersonal('phone', v)} />
                        <Input label="Location" value={data.personal.location} onChange={(v: string) => updatePersonal('location', v)} />
                      </div>
                    </div>
                    <Textarea 
                      label="Professional Bio" 
                      value={data.personal.summary} 
                      onChange={(v: string) => updatePersonal('summary', v)} 
                      rows={4}
                    />
                  </Section>

                  <Section 
                    icon={Briefcase} 
                    title="Experience" 
                    action={
                      <button onClick={addExperience} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Plus size={16} /> Add Position
                      </button>
                    }
                  >
                    <div className="space-y-4 sm:space-y-6">
                      <AnimatePresence>
                        {(data.experience || []).map((exp) => (
                          <motion.div 
                            key={exp.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative group p-3 sm:p-4 lg:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl lg:rounded-3xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-sm"
                          >
                            <button onClick={() => removeExperience(exp.id)} className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 p-1.5 sm:p-2 text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors">
                              <Trash2 size={12} className="sm:size-14 lg:size-16" />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                              <Input label="Role" value={exp.role} onChange={(v: string) => updateExperience(exp.id, 'role', v)} />
                              <Input label="Company" value={exp.company} onChange={(v: string) => updateExperience(exp.id, 'company', v)} />
                            </div>
                            <Input label="Period" value={exp.period} onChange={(v: string) => updateExperience(exp.id, 'period', v)} />
                            <Textarea label="Accomplishments" value={exp.description} onChange={(v: string) => updateExperience(exp.id, 'description', v)} rows={3} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </Section>

                  <Section 
                    icon={Layout} 
                    title="Projects" 
                    action={
                      <button onClick={addProject} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Plus size={16} /> Add Project
                      </button>
                    }
                  >
                    <div className="space-y-4 sm:space-y-6">
                      <AnimatePresence>
                        {(data.projects || []).map((proj) => (
                          <motion.div 
                            key={proj.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative group p-3 sm:p-4 lg:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl lg:rounded-3xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-sm"
                          >
                            <button onClick={() => removeProject(proj.id)} className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 p-1.5 sm:p-2 text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors">
                              <Trash2 size={12} className="sm:size-14 lg:size-16" />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                              <Input label="Project Name" value={proj.name} onChange={(v: string) => updateProject(proj.id, 'name', v)} />
                              <Input label="Reference Link" value={proj.link} onChange={(v: string) => updateProject(proj.id, 'link', v)} />
                            </div>
                            <Textarea label="Project Impact" value={proj.description} onChange={(v: string) => updateProject(proj.id, 'description', v)} rows={2} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </Section>

                  <Section icon={Wrench} title="Skills">
                     <div className="flex flex-wrap gap-1.5 sm:gap-2">
                       {(data.skills || []).map((skill, i) => (
                         <span key={i} className="group px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl lg:rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                           {skill}
                           <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-500 transition-colors">
                             <Plus size={10} className="sm:size-12 lg:size-14 rotate-45" />
                           </button>
                         </span>
                       ))}
                       <input 
                         type="text"
                         placeholder="New Skill..."
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             addSkill(e.currentTarget.value);
                             e.currentTarget.value = '';
                           }
                         }}
                         className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl lg:rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 focus:text-slate-900 focus:border-indigo-500 transition-all bg-transparent focus:outline-none w-24 sm:w-28 lg:w-32"
                       />
                     </div>
                  </Section>

                  <Section icon={BookOpen} title="Education" action={
                    <button onClick={addEducation} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                      <Plus size={16} /> Add School
                    </button>
                  }>
                    <div className="space-y-4 sm:space-y-6">
                      <AnimatePresence>
                        {(data.education || []).map((edu) => (
                          <motion.div key={edu.id} className="relative group p-3 sm:p-4 lg:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl lg:rounded-3xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                            <button onClick={() => removeEducation(edu.id)} className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 p-1.5 sm:p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={12} className="sm:size-14 lg:size-16" /></button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                              <Input label="Degree" value={edu.degree} onChange={(v: string) => updateEducation(edu.id, 'degree', v)} />
                              <Input label="Institution" value={edu.school} onChange={(v: string) => updateEducation(edu.id, 'school', v)} />
                            </div>
                            <Input label="Period" value={edu.period} onChange={(v: string) => updateEducation(edu.id, 'period', v)} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="h-40 xl:h-20" />
        </div>
      </div>

      {/* Preview Panel with Dynamic Scaling */}
      <div 
        ref={previewContainerRef}
        className={cn(
          "lg:w-1/2 h-full bg-slate-200/40 dark:bg-slate-900/40 flex flex-col relative transition-all duration-300",
          viewMode === 'editor' ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Actions Bar */}
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-2 sm:p-2.5 rounded-full shadow-2xl border border-white/20">
          <button 
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-4 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={16} className="sm:size-18 animate-spin" /> : <Download size={16} className="sm:size-18" />}
            <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Export as PDF'}</span>
            <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
          </button>
          <button 
            onClick={handleSaveDraft}
            className="hidden sm:flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
          >
            <Save size={16} className="sm:size-18" /> Save Draft
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-2 sm:p-4 md:p-8 flex items-start justify-center">
          <div 
            style={{ 
              width: '794px', 
              minHeight: '1123px',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
            }}
            className="bg-white shadow-2xl overflow-hidden shrink-0 my-10 lg:my-10"
          >
            <div ref={componentRef} className="bg-white h-full shadow-2xl transition-all duration-700">
              {selectedTemplate === 'modern' && <ModernTemplate data={data} />}
              {selectedTemplate === 'ats' && <ATSTemplate data={data} />}
              {selectedTemplate === 'minimal' && <MinimalTemplate data={data} />}
              {selectedTemplate === 'creative' && <CreativeTemplate data={data} />}
              {selectedTemplate === 'corporate' && <CorporateTemplate data={data} />}
              {selectedTemplate === 'elegant' && <ElegantTemplate data={data} />}
              {selectedTemplate === 'techno' && <TechnoTemplate data={data} />}
              {selectedTemplate === 'hybrid' && <HybridTemplate data={data} />}
              {selectedTemplate === 'executive' && <ExecutiveTemplate data={data} />}
              {selectedTemplate === 'designer' && <DesignerTemplate data={data} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Resume Templates ---

function ModernTemplate({ data }: { data: ResumeData }) {
  const primaryColor = data.settings?.primaryColor || '#6366f1';
  const sortedSections = [...(data.sections || [])].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("text-slate-800 bg-white h-full flex flex-col", data.settings.fontFamily)} style={{ padding: `${data.settings.margins}px`, lineHeight: data.settings.lineHeight }}>
      <header className="flex items-center gap-10 mb-10 pb-10 border-b-4" style={{ borderColor: primaryColor }}>
        {data.personal.photo && (
          <img src={data.personal.photo} className="w-32 h-32 rounded-3xl object-cover transition-all shadow-xl" alt="Profile" />
        )}
        <div className="flex-1">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 text-slate-900 leading-none">{data.personal.fullName || 'Full Name'}</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
            <span className="flex items-center gap-2"><Mail size={12} style={{ color: primaryColor }} /> {data.personal.email}</span>
            <span className="flex items-center gap-2"><Phone size={12} style={{ color: primaryColor }} /> {data.personal.phone}</span>
            <span className="flex items-center gap-2"><MapPin size={12} style={{ color: primaryColor }} /> {data.personal.location}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-12 flex-1">
        <div className="col-span-8 space-y-10">
          {sortedSections.map(section => {
            if (!section.visible) return null;
            
            switch (section.id) {
              case 'summary':
                return (
                  <div key={section.id}>
                    <h3 className="text-xs font-black uppercase tracking-[4px] mb-4" style={{ color: primaryColor }}>Professional Story</h3>
                    <p className="text-sm leading-relaxed text-slate-600 italic whitespace-pre-wrap">{data.personal.summary}</p>
                  </div>
                );
              case 'experience':
                return (
                  <div key={section.id}>
                    <h3 className="text-xs font-black uppercase tracking-[4px] mb-6" style={{ color: primaryColor }}>Experience</h3>
                    <div className="space-y-8">
                      {data.experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-black text-xl text-slate-900">{exp.role}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exp.period}</span>
                          </div>
                          <div className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: primaryColor }}>{exp.company}</div>
                          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              case 'projects':
                return (
                  <div key={section.id}>
                    <h3 className="text-xs font-black uppercase tracking-[4px] mb-6" style={{ color: primaryColor }}>Key Projects</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {data.projects.map(proj => (
                        <div key={proj.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <h4 className="text-sm font-black text-slate-900 mb-1">{proj.name}</h4>
                           <div className="text-[10px] font-bold opacity-50 mb-2">{proj.link}</div>
                           <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              case 'education':
                return (
                  <div key={section.id}>
                    <h3 className="text-xs font-black uppercase tracking-[4px] mb-6" style={{ color: primaryColor }}>Education</h3>
                    <div className="space-y-4">
                      {data.education.map(edu => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-black text-sm text-slate-900">{edu.degree}</h4>
                            <span className="text-[10px] font-black text-slate-400">{edu.period}</span>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{edu.school}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              default: return null;
            }
          })}
        </div>
        
        <div className="col-span-4 border-l border-slate-100 pl-8 space-y-10">
           {data.sections.find(s => s.id === 'skills')?.visible && (
             <div>
               <h3 className="text-xs font-black uppercase tracking-[4px] mb-6" style={{ color: primaryColor }}>Expertise</h3>
               <div className="flex flex-wrap gap-2">
                 {data.skills.map((s, i) => (
                   <span key={i} className="text-[9px] font-black uppercase tracking-[1px] px-2 py-1 bg-slate-900 text-white rounded">
                     {s}
                   </span>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function ATSTemplate({ data }: { data: ResumeData }) {
  const sortedSections = [...(data.sections || [])].sort((a, b) => a.order - b.order);
  return (
    <div className={cn("text-slate-900 bg-white min-h-full", data.settings.fontFamily)} style={{ padding: `${data.settings.margins}px`, lineHeight: data.settings.lineHeight }}>
      <header className="text-center mb-8 border-b-2 border-slate-900 pb-6">
        <h1 className="text-3xl font-bold mb-2 tracking-tight uppercase">{data.personal.fullName}</h1>
        <div className="text-xs text-slate-600 space-x-3">
          <span>{data.personal.email}</span>
          {data.personal.phone && (
            <>
              <span>•</span>
              <span>{data.personal.phone}</span>
            </>
          )}
          {data.personal.location && (
            <>
              <span>•</span>
              <span>{data.personal.location}</span>
            </>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {sortedSections.map(section => {
          if (!section.visible) return null;
          
          switch (section.id) {
            case 'summary':
              return (
                <section key={section.id}>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Professional Summary</h2>
                  <p className="text-[12px] leading-relaxed text-slate-700 whitespace-pre-wrap">{data.personal.summary}</p>
                </section>
              );
            case 'experience':
              return (
                <section key={section.id}>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">Work Experience</h2>
                  <div className="space-y-5">
                    {data.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between font-bold text-[13px]">
                          <span>{exp.company}</span>
                          <span>{exp.period}</span>
                        </div>
                        <div className="italic text-slate-700 text-[12px] mb-1">{exp.role}</div>
                        <p className="text-[12px] leading-relaxed text-slate-600 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'projects':
              return (
                <section key={section.id}>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">Selected Projects</h2>
                  <div className="space-y-4">
                    {data.projects.map(proj => (
                      <div key={proj.id}>
                        <div className="flex justify-between font-bold text-[13px]">
                          <span>{proj.name}</span>
                          <span>{proj.link}</span>
                        </div>
                        <p className="text-[12px] leading-relaxed text-slate-600">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'education':
              return (
                <section key={section.id}>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Education</h2>
                  <div className="space-y-2">
                    {data.education.map(edu => (
                      <div key={edu.id} className="flex justify-between items-baseline text-[13px]">
                        <div><span className="font-bold">{edu.degree}</span> - {edu.school}</div>
                        <span className="text-slate-600">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'skills':
              return (
                <section key={section.id}>
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Technical Skills</h2>
                  <p className="text-[12px] text-slate-700 leading-relaxed">{data.skills.join(', ')}</p>
                </section>
              );
            default: return null;
          }
        })}
      </div>
    </div>
  );
}

function MinimalTemplate({ data }: { data: ResumeData }) {
  const sortedSections = [...(data.sections || [])].sort((a, b) => a.order - b.order);
  return (
    <div className={cn("text-slate-600 bg-white min-h-full flex flex-col", data.settings.fontFamily)} style={{ padding: `${data.settings.margins}px`, lineHeight: data.settings.lineHeight }}>
      <header className="mb-14">
        <h1 className="text-3xl font-light tracking-[8px] uppercase text-slate-400 mb-4">{data.personal.fullName}</h1>
        <div className="text-[10px] uppercase tracking-[3px] space-x-6 text-slate-300">
          <span>{data.personal.email}</span>
          <span>{data.personal.location}</span>
        </div>
      </header>

      <div className="space-y-12">
        {sortedSections.map(section => {
          if (!section.visible) return null;
          switch (section.id) {
            case 'summary':
              return (
                <div key={section.id} className="mb-12">
                  <p className="text-lg leading-relaxed font-light italic text-slate-400">"{data.personal.summary}"</p>
                </div>
              );
            case 'experience':
              return (
                <div key={section.id} className="space-y-10">
                  <h3 className="text-[10px] uppercase tracking-[5px] text-slate-300 mb-6 pb-2 border-b border-slate-100">Experience</h3>
                  {data.experience.map(exp => (
                    <div key={exp.id} className="group flex gap-8">
                      <span className="text-[10px] font-bold text-slate-200 w-24 shrink-0 tracking-widest pt-2">{exp.period}</span>
                      <div>
                        <h4 className="text-lg font-medium text-slate-800 mb-1">{exp.role}</h4>
                        <div className="text-xs uppercase tracking-widest text-slate-400 mb-3">{exp.company}</div>
                        <p className="text-sm leading-relaxed text-slate-500 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            case 'education':
              return (
                <div key={section.id} className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[5px] text-slate-300 mb-6 pb-2 border-b border-slate-100">Academics</h3>
                  {data.education.map(edu => (
                    <div key={edu.id} className="flex gap-8">
                      <span className="text-[10px] font-bold text-slate-200 w-24 shrink-0 tracking-widest">{edu.period}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{edu.degree}</h4>
                        <div className="text-[10px] uppercase tracking-widest text-slate-400">{edu.school}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            default: return null;
          }
        })}
      </div>
    </div>
  );
}

function CreativeTemplate({ data }: { data: ResumeData }) {
  const primaryColor = data.settings?.primaryColor || '#6366f1';
  const sortedSections = [...(data.sections || [])].sort((a,b) => a.order - b.order);
  
  return (
    <div className={cn("flex min-h-full bg-indigo-50", data.settings.fontFamily)}>
      <div className="w-1/3 bg-slate-900 p-10 text-white flex flex-col">
        {data.personal.photo && (
           <img src={data.personal.photo} className="w-full aspect-square rounded-[40px] mb-8 object-cover border-4 border-slate-800 shadow-2xl" alt="Profile" />
        )}
        <div className="mb-10">
          <h1 className="text-4xl font-black leading-none tracking-tighter mb-8 break-words underline decoration-8 decoration-indigo-500 underline-offset-8">
            {data.personal.fullName.split(' ').map((n, i) => <div key={i}>{n}</div>)}
          </h1>
          <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <div className="flex items-center gap-3"><Mail size={14} className="text-indigo-400" />{data.personal.email}</div>
             <div className="flex items-center gap-3"><Phone size={14} className="text-indigo-400" />{data.personal.phone}</div>
             <div className="flex items-center gap-3"><MapPin size={14} className="text-indigo-400" />{data.personal.location}</div>
          </div>
        </div>

        <section className="mt-auto pt-10 border-t border-slate-800">
           <h3 className="text-[9px] font-black uppercase tracking-[4px] text-indigo-400 mb-6">Expertise</h3>
           <div className="flex flex-wrap gap-2">
             {data.skills.map((s, i) => (
               <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[8px] font-black uppercase tracking-widest">
                 {s}
               </span>
             ))}
           </div>
        </section>
      </div>

      <div className="flex-1 bg-white p-12 overflow-hidden shadow-inner">
         <div className="space-y-12">
            {sortedSections.map(section => {
              if (!section.visible) return null;
              switch (section.id) {
                case 'experience':
                  return (
                    <div key={section.id}>
                      <h3 className="text-[10px] font-black uppercase tracking-[10px] text-slate-300 mb-10 border-b-8 border-indigo-50 pb-4 leading-none">Experience</h3>
                      <div className="space-y-10 border-l-2 border-indigo-50 pl-8 relative">
                        {data.experience.map(exp => (
                          <div key={exp.id} className="relative">
                             <div className="absolute -left-[35px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                             <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[3px] mb-1">{exp.period}</div>
                             <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{exp.role}</h4>
                             <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{exp.company}</div>
                             <p className="text-sm leading-relaxed text-slate-500 whitespace-pre-wrap">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                default: return null;
              }
            })}
         </div>
      </div>
    </div>
  );
}

function CorporateTemplate({ data }: { data: ResumeData }) { return <ATSTemplate data={data} />; }

function ElegantTemplate({ data }: { data: ResumeData }) {
  const primaryColor = data.settings?.primaryColor || '#6366f1';
  const sortedSections = [...(data.sections || [])].sort((a, b) => a.order - b.order);
  return (
    <div className={cn("text-slate-700 bg-white min-h-full", data.settings.fontFamily)} style={{ padding: `${data.settings.margins}px`, lineHeight: data.settings.lineHeight }}>
      <header className="text-center mb-16">
        {data.personal.photo && (
           <img src={data.personal.photo} className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4" style={{ borderColor: primaryColor }} alt="Profile" />
        )}
        <h1 className="text-4xl font-light tracking-[10px] uppercase text-slate-900 mb-6">{data.personal.fullName}</h1>
        <div className="inline-flex items-center gap-6 text-[10px] uppercase tracking-[3px] text-slate-400 flex-wrap justify-center">
           <span>{data.personal.email}</span>
           <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
           <span>{data.personal.location}</span>
           <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
           <span>{data.personal.phone}</span>
        </div>
      </header>

      <div className="space-y-16 max-w-2xl mx-auto">
        {sortedSections.map(section => {
          if (!section.visible) return null;
          switch (section.id) {
            case 'summary':
              return (
                <section key={section.id} className="text-center">
                  <h2 className="text-[10px] uppercase tracking-[6px] text-slate-300 mb-8 font-black">About</h2>
                  <p className="text-lg font-light leading-relaxed italic text-slate-500">"{data.personal.summary}"</p>
                </section>
              );
            case 'experience':
              return (
                <section key={section.id}>
                  <h2 className="text-[10px] uppercase tracking-[6px] text-slate-300 mb-10 font-black text-center">Journey</h2>
                  <div className="space-y-12">
                    {data.experience.map(exp => (
                      <div key={exp.id} className="text-center">
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">{exp.period}</div>
                        <h4 className="text-xl font-medium text-slate-800 mb-1">{exp.role}</h4>
                        <div className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: primaryColor }}>{exp.company}</div>
                        <p className="text-[13px] leading-relaxed text-slate-500 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'skills':
              return (
                <section key={section.id} className="text-center">
                   <h2 className="text-[10px] uppercase tracking-[6px] text-slate-300 mb-8 font-black">Competencies</h2>
                   <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                     {data.skills.map((s, i) => (
                       <span key={i} className="text-[11px] font-bold uppercase tracking-[2px] text-slate-400">
                         {s}
                       </span>
                     ))}
                   </div>
                </section>
              );
            default: return null;
          }
        })}
      </div>
    </div>
  );
}

function TechnoTemplate({ data }: { data: ResumeData }) {
  const primaryColor = data.settings?.primaryColor || '#10b981';
  const sortedSections = [...(data.sections || [])].sort((a, b) => a.order - b.order);
  return (
    <div className={cn("text-emerald-400 bg-slate-950 min-h-full font-mono", data.settings.fontFamily)} style={{ padding: `${data.settings.margins}px`, lineHeight: data.settings.lineHeight }}>
      <header className="border-l-4 border-emerald-500 pl-8 mb-12 py-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">
           {data.personal.fullName}
        </h1>
        <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-slate-500">
           <div className="flex items-center gap-3"><Mail size={14} className="text-emerald-400" /> {data.personal.email}</div>
           <div className="flex items-center gap-3"><MapPin size={14} className="text-emerald-400" /> {data.personal.location}</div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 space-y-12">
           {sortedSections.map(section => {
             if (!section.visible) return null;
             switch (section.id) {
               case 'experience':
                 return (
                   <section key={section.id} className="relative">
                      <div className="absolute -left-12 top-0 text-[10px] text-slate-800 rotate-90 origin-left uppercase tracking-widest font-black">Logs // Experience</div>
                      <div className="space-y-10">
                        {data.experience.map(exp => (
                          <div key={exp.id} className="p-6 bg-slate-900/50 border border-emerald-500/10 rounded-lg hover:border-emerald-500/40 transition-all">
                             <div className="flex justify-between items-center mb-3">
                               <div className="text-emerald-500 text-lg font-black">&gt; {exp.role}</div>
                               <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{exp.period}</span>
                             </div>
                             <div className="text-xs text-white opacity-60 mb-4">{exp.company}</div>
                             <p className="text-sm text-slate-400 border-l border-slate-800 pl-4 whitespace-pre-wrap">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                   </section>
                 );
               case 'projects':
                 return (
                   <section key={section.id}>
                      <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-6"># active_repos</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {data.projects.map(proj => (
                          <div key={proj.id} className="p-4 border border-slate-900 rounded bg-slate-900">
                             <div className="flex justify-between mb-2">
                               <span className="text-sm font-black text-white">{proj.name}</span>
                               <span className="text-[10px] text-emerald-800">{proj.link}</span>
                             </div>
                             <p className="text-xs text-slate-500">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                   </section>
                 );
               default: return null;
             }
           })}
        </div>
        <div className="col-span-4 space-y-10">
           <section>
              <h3 className="text-xs text-slate-700 uppercase tracking-[4px] mb-6">.env // Skills</h3>
              <div className="flex flex-col gap-2">
                {data.skills.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-emerald-300">
                    <span className="text-emerald-800">[ok]</span> {s}
                  </div>
                ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}

function HybridTemplate({ data }: { data: ResumeData }) { return <ModernTemplate data={data} />; }
function ExecutiveTemplate({ data }: { data: ResumeData }) { return <ModernTemplate data={data} />; }
function DesignerTemplate({ data }: { data: ResumeData }) { return <CreativeTemplate data={data} />; }

function Section({ icon: Icon, title, children, action }: any) {
  return (
    <div className="mb-6 sm:mb-8 lg:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-indigo-600 ring-2 sm:ring-4 ring-indigo-500/5 transition-colors">
            <Icon size={14} className="sm:size-16 lg:size-20" />
          </div>
          <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">{title}</h2>
        </div>
        {action && (
          <div className="w-full sm:w-auto">
            {action}
          </div>
        )}
      </div>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">{children}</div>
    </div>
  );
}

function PreviewSection({ title, children, color }: any) {
  return (
    <div className="mb-10">
      <h3 className="text-[10px] font-black uppercase tracking-[5px] mb-6 pb-2 border-b-2" style={{ color: color || '#94a3b8', borderColor: 'rgba(241, 245, 249, 0.5)' }}>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl text-sm font-medium focus:outline-none focus:ring-6 sm:focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows }: any) {
  return (
    <div className="space-y-2 w-full mt-2">
      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">{label}</label>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl text-sm font-medium focus:outline-none focus:ring-6 sm:focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all resize-none text-slate-900 dark:text-white leading-relaxed"
      />
    </div>
  );
}
