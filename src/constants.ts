import { 
  FileText, 
  FileUp, 
  Calendar, 
  Calculator, 
  MessageSquare, 
  Youtube, 
  LayoutDashboard,
  Bot,
  BarChart3,
  ListTodo,
  BrainCircuit,
  Mail
} from 'lucide-react';

export const TOOLS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Welcome to your creative suite'
  },
  {
    id: 'chat',
    name: 'AI Assistant',
    icon: Bot,
    description: 'Chat with your personal AI productivity companion'
  },
  {
    id: 'resume',
    name: 'Resume Builder',
    icon: FileText,
    description: 'Create professional resumes in minutes'
  },
  {
    id: 'pdf',
    name: 'PDF Converter',
    icon: FileUp,
    description: 'Convert images to high-quality PDF'
  },
  {
    id: 'age',
    name: 'Age Calculator',
    icon: Calendar,
    description: 'Calculate exact age and next birthday'
  },
  {
    id: 'gpa',
    name: 'GPA Calculator',
    icon: Calculator,
    description: 'Check your academic performance'
  },
  {
    id: 'caption',
    name: 'AI Caption Gen',
    icon: MessageSquare,
    description: 'Engaging captions for social media'
  },
  {
    id: 'youtube',
    name: 'YT Title Gen',
    icon: Youtube,
    description: 'Optimize your videos for high CTR'
  },
  // Job Toolkit
  {
    id: 'ats',
    name: 'ATS Checker',
    icon: BarChart3,
    description: 'Optimize your resume for machine parsers',
    category: 'Job Toolkit'
  },
  {
    id: 'tracker',
    name: 'Job Tracker',
    icon: ListTodo,
    description: 'Track your applications from sent to signed',
    category: 'Job Toolkit'
  },
  {
    id: 'interview',
    name: 'Interview Prep',
    icon: BrainCircuit,
    description: 'Personalized coaching and Q&A drills',
    category: 'Job Toolkit'
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter AI',
    icon: Mail,
    description: 'Tailored letters that grab attention',
    category: 'Job Toolkit'
  },
  {
    id: 'contact',
    name: 'Support & Suggest',
    icon: MessageSquare,
    description: 'Help us improve your toolkit suite',
    category: 'System'
  }
];
