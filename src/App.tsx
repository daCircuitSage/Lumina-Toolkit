/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GlobalSearch from './components/GlobalSearch';
import { motion, AnimatePresence } from 'motion/react';
import { TOOLS } from './constants';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazily load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ResumeBuilder = React.lazy(() => import('./pages/ResumeBuilder'));
const PdfConverter = React.lazy(() => import('./pages/PdfConverter'));
const AgeCalculator = React.lazy(() => import('./pages/AgeCalculator'));
const GpaCalculator = React.lazy(() => import('./pages/GpaCalculator'));
const AiCaption = React.lazy(() => import('./pages/AiCaption'));
const YoutubeTitles = React.lazy(() => import('./pages/YoutubeTitles'));
const AiChat = React.lazy(() => import('./pages/AiChat'));
const AtsChecker = React.lazy(() => import('./pages/JobToolkit/AtsChecker'));
const JobTracker = React.lazy(() => import('./pages/JobToolkit/JobTracker'));
const InterviewPrep = React.lazy(() => import('./pages/JobToolkit/InterviewPrep'));
const CoverLetter = React.lazy(() => import('./pages/JobToolkit/CoverLetter'));
const Contact = React.lazy(() => import('./pages/Contact'));

export default function App() {
  const [activeTool, setActiveTool] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderTool = () => {
    switch (activeTool) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTool} />;
      case 'resume': return <ResumeBuilder />;
      case 'pdf': return <PdfConverter />;
      case 'age': return <AgeCalculator />;
      case 'gpa': return <GpaCalculator />;
      case 'caption': return <AiCaption />;
      case 'youtube': return <YoutubeTitles />;
      case 'chat': return <AiChat />;
      case 'ats': return <AtsChecker />;
      case 'tracker': return <JobTracker />;
      case 'interview': return <InterviewPrep />;
      case 'cover-letter': return <CoverLetter />;
      case 'contact': return <Contact />;
      default: return <Dashboard onNavigate={setActiveTool} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#F9FAFB] dark:bg-slate-950 transition-colors duration-300">
        <Sidebar 
          activeTool={activeTool} 
          onSelect={(id) => setActiveTool(id)} 
          onSearchOpen={() => setIsSearchOpen(true)}
        />
        
        <GlobalSearch 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onSelect={setActiveTool} 
        />

        <main className="flex-1 relative pt-16 md:pt-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-[calc(100vh-64px)] md:h-screen">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                {renderTool()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ThemeProvider>
  );
}

