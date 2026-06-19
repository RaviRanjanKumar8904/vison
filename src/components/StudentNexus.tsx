import { useState, FormEvent, useEffect, useRef } from 'react';
import { 
  Award, Clock, GraduationCap, ChevronRight, CheckCircle, Calendar, 
  User, Sparkles, Send, CheckSquare, PlusCircle, BookOpen, AlertTriangle, 
  ExternalLink, Trophy, Sparkle, Download, RefreshCw, MessageSquare, Laptop, 
  Check, Play, Video, HelpCircle, FileText, ArrowRight, Compass, TrendingUp,
  Camera, Save
} from 'lucide-react';
import { INTERNSHIP_DOMAINS } from '../data';
import { EnrollmentState } from '../types';
import { motion } from 'motion/react';
import { downloadCertificatePDF } from '../utils/pdfGenerator';

const SUGGESTED_ROADMAP_PATHS: Record<string, {
  nextDomainId: string;
  nextSpecialtyDomainId: string;
  roleTitle: string;
  expectedSalary: string;
  reason: string;
}> = {
  ai_ml: {
    nextDomainId: 'data_science',
    nextSpecialtyDomainId: 'robotics',
    roleTitle: 'Generative AI & Intelligent Systems Engineer',
    expectedSalary: '₹12L - ₹24L / year',
    reason: 'Combining Quantum AI with Advanced Data Science and Physical Robotics models forms the ultimate intelligence loop.'
  },
  full_stack: {
    nextDomainId: 'devops',
    nextSpecialtyDomainId: 'blockchain',
    roleTitle: 'Principal Cloud Platform & Web3 Solutions Architect',
    expectedSalary: '₹10.5L - ₹22L / year',
    reason: 'Scaling dynamic React portfolios into secure distributed ledgers and Kubernetes cloud containers is highly demanded.'
  },
  cybersec: {
    nextDomainId: 'devops',
    nextSpecialtyDomainId: 'blockchain',
    roleTitle: 'DevSecOps & Smart Contract Security Specialist',
    expectedSalary: '₹11L - ₹21.5L / year',
    reason: 'Hardening automated pipelines and conducting security audits on distributed ledger smart contracts is the ultimate shield.'
  },
  data_science: {
    nextDomainId: 'ai_ml',
    nextSpecialtyDomainId: 'finance',
    roleTitle: 'Chief Quantitative AI Analyst',
    expectedSalary: '₹14L - ₹28L / year',
    reason: 'Fusing deep statistical algorithms with deep learning models allows predicting high-frequency market pricing vectors.'
  },
  devops: {
    nextDomainId: 'cybersec',
    nextSpecialtyDomainId: 'full_stack',
    roleTitle: 'Global Site Reliability & SecDevOps Director',
    expectedSalary: '₹12.5L - ₹25L / year',
    reason: 'Protecting cloud infrastructure via offensive penetration sweeps and robust serverless middleware design completes the tech shield.'
  },
  mobile_dev: {
    nextDomainId: 'ui_ux',
    nextSpecialtyDomainId: 'full_stack',
    roleTitle: 'Lead Mobile Product & Full-Stack Architect',
    expectedSalary: '₹9L - ₹18L / year',
    reason: 'Combining crisp mobile development with layout optimization (UI/UX) and powerful backends yields amazing products.'
  },
  iot: {
    nextDomainId: 'embedded_sys',
    nextSpecialtyDomainId: 'cybersec',
    roleTitle: 'IoT Firmware & Microcontroller Security Engineer',
    expectedSalary: '₹8.5L - ₹17L / year',
    reason: 'Connecting physical chips with embedded security rules is essential to defend against hardware hacking exploits.'
  },
  blockchain: {
    nextDomainId: 'cybersec',
    nextSpecialtyDomainId: 'full_stack',
    roleTitle: 'Senior Decentralized Systems Cryptographer',
    expectedSalary: '₹13.5L - ₹27L / year',
    reason: 'Hardening financial registries and smart code execution structures under strict penetration audits ensures ledger absolute trust.'
  },
  ui_ux: {
    nextDomainId: 'full_stack',
    nextSpecialtyDomainId: 'marketing',
    roleTitle: 'Lead Product & Interactive Cohort Director',
    expectedSalary: '₹8L - ₹16.5L / year',
    reason: 'Aligning high-converting user interfaces with real engineering components and market engagement tactics maximizes conversions.'
  },
  robotics: {
    nextDomainId: 'embedded_sys',
    nextSpecialtyDomainId: 'ai_ml',
    roleTitle: 'Autonomous Robotics Vision Scientist',
    expectedSalary: '₹13L - ₹26L / year',
    reason: 'Using real physical feedback channels alongside deep neural networks allows robots to navigate and interact safely.'
  },
  core_java: {
    nextDomainId: 'full_stack',
    nextSpecialtyDomainId: 'devops',
    roleTitle: 'Enterprise Scale Microservices Specialist',
    expectedSalary: '₹9.5L - ₹19.5L / year',
    reason: 'Java backend platforms depend on web APIs and scale massively using Kubernetes and serverless deployment vectors.'
  },
  embedded_sys: {
    nextDomainId: 'robotics',
    nextSpecialtyDomainId: 'vlsi',
    roleTitle: 'Autonomous Silicon & FPGA Firmware Specialist',
    expectedSalary: '₹11L - ₹22L / year',
    reason: 'Co-designing physical circuits and firmware helps optimize computational tasks for physical robotics control loops.'
  },
  finance: {
    nextDomainId: 'data_science',
    nextSpecialtyDomainId: 'marketing',
    roleTitle: 'Growth Capital & Quantitative Analyst',
    expectedSalary: '₹12L - ₹23L / year',
    reason: 'Managing assets and investments requires strong analytics models along with strategic market and brand expansion strategies.'
  },
  marketing: {
    nextDomainId: 'ui_ux',
    nextSpecialtyDomainId: 'finance',
    roleTitle: 'Growth Hacking Director & Brand Strategist',
    expectedSalary: '₹8.5L - ₹17.5L / year',
    reason: 'Refining high-quality customer experience funnels via user studies and optimizing advertising finance makes brands explode.'
  },
  game_dev: {
    nextDomainId: 'ui_ux',
    nextSpecialtyDomainId: 'ai_ml',
    roleTitle: 'Lead Unreal/Unity Interactive Architect',
    expectedSalary: '₹9L - ₹18L / year',
    reason: 'Designing rich interfaces and creating autonomous AI agents sets standard games apart as deep virtual reality systems.'
  },
  vlsi: {
    nextDomainId: 'embedded_sys',
    nextSpecialtyDomainId: 'robotics',
    roleTitle: 'Principal Hardware Acceleration Architect',
    expectedSalary: '₹14.5L - ₹29L / year',
    reason: 'Drafting custom hardware accelerators for physical systems or robot motor controllers is the cutting edge of manufacturing.'
  },
};

interface StudentNexusProps {
  enrollments: EnrollmentState[];
  setCurrentTab: (tab: string) => void;
  onSelectDomainForEnrollment?: (domainId: string) => void;
  onUpdateEnrollments?: (updatedEnrollments: EnrollmentState[]) => void;
  onUpdateUser?: (updatedValue: any) => void;
  currentUser?: any;
}

export default function StudentNexus({ 
  enrollments, 
  setCurrentTab, 
  onSelectDomainForEnrollment,
  onUpdateEnrollments,
  onUpdateUser,
  currentUser
}: StudentNexusProps) {
  const hasEnrolled = enrollments.length > 0;
  
  // High quality student fallback for demo mode so the screen is never blank
  const sampleEnrollment: EnrollmentState = {
    fullName: 'Priyanshu Ranjan',
    email: 'priyanshu@university.edu',
    phone: '9876543210',
    collegeName: 'Delhi Technological University (DTU)',
    degree: 'B.Tech',
    fieldOfStudy: 'Computer Engineering',
    currentYear: '3rd Year',
    passingYear: '2027',
    domainId: 'ai_ml',
    durationWeeks: 8,
    startDate: '2026-06-15',
    motivation: 'Aims to learn data science and build interactive artificial intelligence tools.',
    candidateId: 'INV-2026-X8AC39',
    enrollmentDate: 'June 15, 2026',
    status: 'In Progress'
  };

  const activeEnrollments = hasEnrolled ? enrollments : [sampleEnrollment];
  const [selectedEnrollmentIdx, setSelectedEnrollmentIdx] = useState(0);
  const activeEnrollment = activeEnrollments[selectedEnrollmentIdx];

  const matchedDomain = INTERNSHIP_DOMAINS.find(domain => domain.id === activeEnrollment.domainId) || INTERNSHIP_DOMAINS[0];

  // Active sub-sections (Samsung One UI segmented control)
  const [activeSubTab, setActiveSubTab] = useState<'homework' | 'mentor' | 'certificate' | 'roadmap' | 'profile'>('homework');
  const [selectedRoadmapNode, setSelectedRoadmapNode] = useState<'current' | 'next' | 'specialty'>('next');

  // Homework Submission state
  const [submissionDesc, setSubmissionDesc] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [submittedTasks, setSubmittedTasks] = useState<Record<number, { desc: string, url: string, date: string }>>({
    0: { desc: 'Completed basic Python functions and initialized data lists.', url: 'https://github.com/priyanshu/python-basics-assessment', date: 'June 18, 2026' },
  });

  // Mentorship Meeting state
  const [mentorDate, setMentorDate] = useState('2026-06-25');
  const [mentorTime, setMentorTime] = useState('11:00 AM');
  const [selectedTrainer, setSelectedTrainer] = useState('Dr. Devendra R. Mathur');
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Profile editing inputs and camera capture states
  const [profileName, setProfileName] = useState(activeEnrollment?.fullName || '');
  const [profileCollege, setProfileCollege] = useState(activeEnrollment?.collegeName || '');
  const [profileDegree, setProfileDegree] = useState(activeEnrollment?.degree || 'B.Tech');
  const [profileField, setProfileField] = useState(activeEnrollment?.fieldOfStudy || '');
  const [profileYear, setProfileYear] = useState(activeEnrollment?.currentYear || '');
  const [profilePassingYear, setProfilePassingYear] = useState(activeEnrollment?.passingYear || '');
  const [profilePhone, setProfilePhone] = useState(activeEnrollment?.phone || '');

  // Synchronize input controls when matching selected enrollments changes
  useEffect(() => {
    if (activeEnrollment) {
      setProfileName(activeEnrollment.fullName || '');
      setProfileCollege(activeEnrollment.collegeName || '');
      setProfileDegree(activeEnrollment.degree || 'B.Tech');
      setProfileField(activeEnrollment.fieldOfStudy || '');
      setProfileYear(activeEnrollment.currentYear || '');
      setProfilePassingYear(activeEnrollment.passingYear || '');
      setProfilePhone(activeEnrollment.phone || '');
    }
  }, [activeEnrollment]);

  // Profile Camera captures streams and refs
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedAvatar, setCapturedAvatar] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load avatar image for currently selected candidate email
  useEffect(() => {
    const emailKey = activeEnrollment?.email || 'guest';
    const savedAvatar = localStorage.getItem(`invigo_avatar_${emailKey}`);
    if (savedAvatar) {
      setCapturedAvatar(savedAvatar);
    } else {
      setCapturedAvatar(null);
    }
  }, [activeEnrollment?.email]);

  // Independent Study Hours calculation limits
  const [extraStudyHours, setExtraStudyHours] = useState<number>(() => {
    const emailKey = activeEnrollment?.email || 'guest';
    const savedHours = localStorage.getItem(`invigo_study_hours_${emailKey}`);
    return savedHours ? Number(savedHours) : 24;
  });

  useEffect(() => {
    const emailKey = activeEnrollment?.email || 'guest';
    const savedHours = localStorage.getItem(`invigo_study_hours_${emailKey}`);
    setExtraStudyHours(savedHours ? Number(savedHours) : 24);
  }, [activeEnrollment?.email]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Certificate state
  const [isCompilingCert, setIsCompilingCert] = useState(false);
  const [certCompiled, setCertCompiled] = useState(false);

  // Function to build student-friendly, domain-specific tasks based on course duration
  const getTasksForDomain = (domainId: string, totalWeeks: number) => {
    const aiTasks = [
      { title: 'Python Basics & NumPy Setup', desc: 'Install Python, set up your workspace environment, and read a standard spreadsheet CSV file.' },
      { title: 'Data Visuals & Charts', desc: 'Create neat graphs, filter table rows, and clean empty values using Matplotlib & Pandas.' },
      { title: 'Simple Price Prediction model', desc: 'Build and train a basic regression algorithm to estimate rental properties pricing.' },
      { title: 'Intro to Image Classification', desc: 'Write a basic neural network to scan and identify handwritten numbers.' },
      { title: 'Understanding Text Analytics', desc: 'Analyze social comments data and categorize them into positive or negative responses.' },
      { title: 'Using AI Models from Hugging Face', desc: 'Load a pretrained language model to summarize short news articles.' },
      { title: 'Accuracy Testing & Error Sweeps', desc: 'Test your program on brand new files, print out accuracy metrics, and fix parameters.' },
      { title: 'Final Project Deployment', desc: 'Host your interactive AI web app on Hugging Face Spaces for public viewing.' }
    ];

    const webTasks = [
      { title: 'HTML, CSS & Responsive Pages', desc: 'Build a fully responsive web page profile using clean HTML, CSS, and Tailwind CSS styles.' },
      { title: 'Interactive React components', desc: 'Design click buttons, input text fields, and list trackers using standard React state hooks.' },
      { title: 'Connecting App Dashboards', desc: 'Wire up multiple elements to let users easily search, filter, and sort dynamic cards on your site.' },
      { title: 'Creating a Backend Server API', desc: 'Configure Node.js and Express to answer web requests and serve product list sheets.' },
      { title: 'Connecting Database (MongoDB / SQL)', desc: 'Set up a database to persistently store, read, edit, or delete items.' },
      { title: 'User Accounts & Logins', desc: 'Build a standard, clean signup form with secure passwords and login tokens.' },
      { title: 'Testing API routes & Security Checks', desc: 'Write basic tests to block wrong inputs and encrypt sensitive communications.' },
      { title: 'Live Full-Stack Hosting', desc: 'Upload your finished web app to Vercel and render libraries for friends to see live.' }
    ];

    const securityTasks = [
      { title: 'Ethical Hacking Lab Setup', desc: 'Set up your secure sandbox simulation software and learn standard Linux commands.' },
      { title: 'Interactive Security Audit Scans', desc: 'Check network ports, scan simulated websites, and map out active server layers.' },
      { title: 'Inspecting Web Packets', desc: 'Analyze system traffic data in real-time to find plain-text security flaws.' },
      { title: 'Firewalls & Rate Limit Setup', desc: 'Configure rule blocks to stop automated bots from over-calling server endpoints.' },
      { title: 'Looking for Database Vulnerabilities', desc: 'Perform audits on text forms to protect databases from injection exploits.' },
      { title: 'Password Encryption Basics', desc: 'Learn how to salt and hash login passwords before committing them to records.' },
      { title: 'Defending the Server Host', desc: 'Disable unused protocols on your operating portal to reduce security target areas.' },
      { title: 'Final Safety Compliance Summary', desc: 'Run automated audit assessments and compile a comprehensive system safety manual.' }
    ];

    const managementTasks = [
      { title: 'Business Case Analysis', desc: 'Analyze a major company\'s market statistics and write a summary of their core business strategy.' },
      { title: 'Reading Balance Sheets & Reports', desc: 'Learn to read profit sheets, calculate business margins, and identify growth metrics.' },
      { title: 'Planning a Social Media Marketing Drive', desc: 'Create a simple target audience proposal and list 5 marketing metrics to track.' },
      { title: 'Customer Feedback Interviews', desc: 'Interview 3 potential users to list core features they expect in a learning platform.' },
      { title: 'Mapping a Product Delivery Chain', desc: 'Draw a basic timeline detailing how raw resources move into finished goods.' },
      { title: 'Creating a Budget spreadsheet', desc: 'Calculate fixed vs variable monthly expenses, sales volume targets, and breakeven goals.' },
      { title: 'Organizational Team Structures', desc: 'Detail team roles, manager hierarchies, and prepare a standard corporate structural chart.' },
      { title: 'Final Project Pitch Presentation', desc: 'Assemble your final strategy slides deck and film a short, clean proposal video.' }
    ];

    let baseTasks = webTasks;
    if (domainId === 'ai_ml') baseTasks = aiTasks;
    else if (domainId === 'cybersec') baseTasks = securityTasks;
    else if (domainId === 'mba_management' || domainId.includes('management') || domainId.includes('marketing')) baseTasks = managementTasks;
    else {
      baseTasks = [
        { title: 'Course Set up & Environment', desc: 'Configure your tools, set up your workstation, and print a classic Hello-World output.' },
        { title: 'Understanding Core Mechanics', desc: 'Execute basic formulas, lists, or spreadsheets matching your internship path.' },
        { title: 'Working with Data Sheets', desc: 'Import information lists, inspect variables, and draw neat comparative charts.' },
        { title: 'Structuring Main Projects', desc: 'Outline your capstone, prepare interactive options, and write basic input actions.' },
        { title: 'Reviewing Industry Examples', desc: 'Study 3 top-rated real world cases and describe things they got right.' },
        { title: 'Integrating Elements together', desc: 'Wire up interactive buttons so data updates instantly upon mouse action.' },
        { title: 'Code Cleanup & Optimization', desc: 'Review your files, clean up repetitive loops, and write brief user guides.' },
        { title: 'Final Project Submission', desc: 'Publish your project directory online, draft a clear tutorial readme, and request score approval.' }
      ];
    }

    return baseTasks.slice(0, Math.ceil(totalWeeks));
  };

  const tasksList = getTasksForDomain(activeEnrollment.domainId, activeEnrollment.durationWeeks);
  
  // Calculate Progress Percent: matching Device Care style!
  const completedTasksCount = Object.keys(submittedTasks).length;
  const progressPercent = Math.min(100, Math.round((completedTasksCount / tasksList.length) * 100));

  const handleTaskSubmit = (weekIndex: number) => {
    if (!submissionDesc.trim() || !submissionUrl.trim()) return;

    setIsSubmittingTask(true);
    setTimeout(() => {
      setSubmittedTasks((prev) => ({
        ...prev,
        [weekIndex]: {
          desc: submissionDesc,
          url: submissionUrl,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        }
      }));
      setSubmissionDesc('');
      setSubmissionUrl('');
      setIsSubmittingTask(false);
    }, 1200);
  };

  const handleMentorBooking = (e: FormEvent) => {
    e.preventDefault();
    setBookingSuccess({
      date: mentorDate,
      time: mentorTime,
      trainer: selectedTrainer,
      id: `MT-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const handleFastTrackCompletion = () => {
    const allCompleted: Record<number, { desc: string, url: string, date: string }> = {};
    tasksList.forEach((task, idx) => {
      allCompleted[idx] = {
        desc: `System completed milestone verification: ${task.title}`,
        url: `https://github.com/invigo-student/fast-track-week-${idx + 1}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
    });
    setSubmittedTasks(allCompleted);
  };

  const handleCompileCertificate = () => {
    setIsCompilingCert(true);
    setTimeout(() => {
      setCertCompiled(true);
      setIsCompilingCert(false);
    }, 2000);
  };

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 360, height: 360, facingMode: 'user' },
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Could not access your camera. Please ensure permissions are granted on your browser.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - minDim) / 2;
        const sy = (video.videoHeight - minDim) / 2;
        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 300, 300);
        const base64Img = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedAvatar(base64Img);
        const emailKey = activeEnrollment?.email || 'guest';
        localStorage.setItem(`invigo_avatar_${emailKey}`, base64Img);
      }
      stopCamera();
    }
  };

  const handleUpdateExtraHours = (val: number) => {
    const newVal = Math.max(0, val);
    setExtraStudyHours(newVal);
    const emailKey = activeEnrollment?.email || 'guest';
    localStorage.setItem(`invigo_study_hours_${emailKey}`, String(newVal));
  };

  const handleSaveProfile = () => {
    const updatedEnrollment: EnrollmentState = {
      ...activeEnrollment,
      fullName: profileName,
      collegeName: profileCollege,
      degree: profileDegree as any,
      fieldOfStudy: profileField,
      currentYear: profileYear,
      passingYear: profilePassingYear,
      phone: profilePhone
    };

    const newFilteredList = activeEnrollments.map((item, idx) => 
      idx === selectedEnrollmentIdx ? updatedEnrollment : item
    );

    if (onUpdateEnrollments) {
      onUpdateEnrollments(newFilteredList);
    } else {
      try {
        localStorage.setItem('invigo_credentials_nexus', JSON.stringify(newFilteredList));
      } catch(e) {
        console.warn(e);
      }
    }

    if (currentUser && onUpdateUser) {
      const updatedUser = {
        ...currentUser,
        fullName: profileName,
        phone: profilePhone,
        collegeName: profileCollege,
        degree: profileDegree,
        fieldOfStudy: profileField,
        currentYear: profileYear,
        passingYear: profilePassingYear
      };
      onUpdateUser(updatedUser);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="relative bg-transparent text-slate-800 py-12 font-sans animate-fade-in">
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        
        {/* Banner notification for demo mode */}
        {!hasEnrolled && (
          <div className="rounded-2xl border border-blue-150 bg-blue-50/50 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex gap-2.5 items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>
                <strong className="text-blue-900 uppercase text-[10px] tracking-wide font-bold">Demo workspace:</strong> We have preloaded a sample DTU Student profile. Feel free to explore and test.
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('enroll')}
              className="px-5 py-2 rounded-full bg-blue-655 hover:bg-blue-700 text-white font-bold transition-all text-xs cursor-pointer shadow-xs"
            >
              Sign up / Enroll Now
            </button>
          </div>
        )}

        {/* Header - Samsung One UI style: Giant comfortable text left, profile details right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-650 uppercase tracking-wider block">Student Dashboard</span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              My Learning Space
            </h1>
            <p className="text-slate-500 text-sm">Track your weekly projects, meet your coaches, and claim your verified certificates.</p>
          </div>

          {/* Course Switcher (If multiple active courses enrolled) */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
            {activeEnrollments.length > 1 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Selected Internship Course:</span>
                <select
                  value={selectedEnrollmentIdx}
                  onChange={(e) => setSelectedEnrollmentIdx(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:border-blue-600 cursor-pointer block shadow-xs"
                >
                  {activeEnrollments.map((enroll, idx) => (
                    <option key={idx} value={idx}>
                      {INTERNSHIP_DOMAINS.find(d => d.id === enroll.domainId)?.title.slice(0, 30) || enroll.domainId}... ({enroll.candidateId.split('-').pop()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Samsung-style "Device Care" dashboard widget block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Progress Circular Gauge Card (5 cols) */}
          <div className="md:col-span-5 rounded-[1.8rem] bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-sm hover:border-slate-300 transition-all">
            
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Your Project Care Score</h3>
              <p className="text-xs text-slate-500">Overview of your submitted learning checkpoints.</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative my-6 flex items-center justify-center">
              <svg className="w-36 h-36">
                {/* Background circle */}
                <circle
                  className="text-slate-100"
                  strokeWidth="10"
                  fill="transparent"
                  r="62"
                  cx="72"
                  cy="72"
                />
                {/* Foreground accent circle */}
                <circle
                  className="text-blue-600 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="62"
                  cx="72"
                  cy="72"
                  transform="rotate(-90 72 72)"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">{progressPercent}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">COMPLETE</span>
              </div>
            </div>

            {/* Micro stats under care meter */}
            <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Submissions</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">{completedTasksCount} / {tasksList.length}</span>
              </div>
              <div className="text-center border-l border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Study Pace</span>
                <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                  {progressPercent >= 50 ? 'Excellent! 🚀' : progressPercent > 0 ? 'Good Pace' : 'Just Started'}
                </span>
              </div>
            </div>

          </div>

          {/* Active Enrollment Specifications Card (7 cols) */}
          <div className="md:col-span-7 rounded-[1.8rem] bg-white border border-slate-205 p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden hover:border-slate-350 transition-all">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-150 text-blue-700 text-xs rounded-full font-bold">
                <Clock className="h-3.5 w-3.5" />
                <span>ACTIVE COHORT</span>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                  {matchedDomain.title}
                </h2>
                <p className="text-xs text-slate-605 leading-relaxed max-w-xl">
                  {matchedDomain.shortDesc}
                </p>
              </div>

              {/* Specs Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-150 overflow-hidden">
                    {capturedAvatar ? (
                      <img src={capturedAvatar} alt="Captured Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="h-4.5 w-4.5 text-blue-650" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name / ID</span>
                    <span className="text-xs font-bold text-slate-805">{activeEnrollment.fullName} ({activeEnrollment.candidateId})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-150">
                    <GraduationCap className="h-4.5 w-4.5 text-blue-655" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">College / University</span>
                    <span className="text-xs font-bold text-slate-805 truncate max-w-[200px] block">{activeEnrollment.collegeName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-150">
                    <Calendar className="h-4.5 w-4.5 text-blue-655" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Start Date & Duration</span>
                    <span className="text-xs font-bold text-slate-805">{activeEnrollment.startDate} • {activeEnrollment.durationWeeks} Weeks</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-150">
                    <BookOpen className="h-4.5 w-4.5 text-blue-655" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Academic Course</span>
                    <span className="text-xs font-bold text-slate-805">{activeEnrollment.degree} in {activeEnrollment.fieldOfStudy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Button Row */}
            <div className="flex flex-wrap gap-2 pt-4 mt-6 border-t border-slate-100">
              {matchedDomain.toolsAndTech.map((tool) => (
                <span key={tool} className="text-[10px] font-mono bg-slate-50 text-slate-650 px-2.5 py-1 rounded-full border border-slate-200">
                  {tool}
                </span>
              ))}
            </div>

          </div>

        </div>

        {/* Samsung Segmented Tab Controls */}
        <div className="flex justify-center pt-2">
          <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-[1.8rem] grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row gap-1 w-full max-w-3xl shadow-xs">
            
            <button
              onClick={() => setActiveSubTab('homework')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'homework'
                  ? 'bg-blue-650 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="h-4.5 w-4.5" />
              <span>Homework</span>
            </button>

            <button
              onClick={() => setActiveSubTab('mentor')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'mentor'
                  ? 'bg-blue-650 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Video className="h-4.5 w-4.5" />
              <span>Book Mentor</span>
            </button>

            <button
              onClick={() => setActiveSubTab('certificate')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'certificate'
                  ? 'bg-blue-650 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Award className="h-4.5 w-4.5" />
              <span>Certificate</span>
            </button>

            <button
              onClick={() => setActiveSubTab('roadmap')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'roadmap'
                  ? 'bg-blue-650 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Compass className="h-4.5 w-4.5" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'bg-blue-650 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              <span>Profile</span>
            </button>

          </div>
        </div>

        {/* Sub-Views Swapper content */}
        <div className="pt-2">
          
          {/* TAB 1: HOMEWORK & PATHWAY */}
          {activeSubTab === 'homework' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <span>Weekly Projects Tracker & Code Uploads</span>
                </h3>
                <span className="text-xs text-slate-550 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                  Submit links to pass verification checks
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasksList.map((task, idx) => {
                  const isTaskSubmitted = submittedTasks[idx] !== undefined;
                  const isActiveWeek = idx === 1; // Highlight week 2 as currently active focus

                  return (
                    <div 
                      key={idx} 
                      className={`rounded-[1.8rem] border p-5 sm:p-6 transition-all ${
                        isTaskSubmitted 
                          ? 'border-emerald-250 bg-emerald-50/20' 
                          : isActiveWeek 
                          ? 'border-blue-200 bg-blue-50/30'
                          : 'border-slate-200 bg-slate-50/30'
                      }`}
                    >
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                        <div className="flex gap-3 items-center">
                          <span className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-mono font-extrabold ${
                            isTaskSubmitted 
                              ? 'bg-emerald-50 border-emerald-350 text-emerald-600'
                              : isActiveWeek 
                              ? 'bg-blue-50 border-blue-450 text-blue-600'
                              : 'bg-slate-50 border-slate-250 text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-805 font-sans text-sm sm:text-base">
                            Week {idx + 1}: {task.title}
                          </h4>
                        </div>

                        {/* Plain friendly status labels */}
                        {isTaskSubmitted ? (
                          <span className="text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 uppercase">
                            Submitted & Passed ✔
                          </span>
                        ) : isActiveWeek ? (
                          <span className="text-[10px] font-bold tracking-wider bg-blue-650 text-white px-3 py-1 rounded-full uppercase">
                            Current Active Assignment
                          </span>
                        ) : idx === 0 ? (
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">
                            Completed Previously
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            Upcoming Week
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3.5">
                        {task.desc}
                      </p>

                      {/* Submitted view vs pending form actions */}
                      {isTaskSubmitted ? (
                        <div className="mt-4 pt-3.5 border-t border-slate-150 text-xs text-slate-700 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <p><span className="text-slate-450 font-bold uppercase text-[10px] block mb-0.5">Your Submission Explanations:</span> <span className="text-slate-800 italic">"{submittedTasks[idx].desc}"</span></p>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                            <p className="flex items-center gap-1">
                              <span className="text-slate-450 font-bold uppercase text-[10px]">Project Directory Link:</span> 
                              <a href={submittedTasks[idx].url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-mono font-bold">
                                {submittedTasks[idx].url} <ExternalLink className="h-3 w-3 inline" />
                              </a>
                            </p>
                            <span className="text-slate-400 text-[10px] font-mono">Completed: {submittedTasks[idx].date}</span>
                          </div>
                        </div>
                      ) : isActiveWeek ? (
                        <div className="mt-5 pt-4 border-t border-slate-150 space-y-4">
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block">Hand in Weekly Project Link:</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-500 uppercase ml-1">GitHub Link / Live Hosted Website</label>
                              <input
                                type="url"
                                placeholder="e.g. https://github.com/myusername/project"
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-500 uppercase ml-1">Brief Description (What you built)</label>
                              <input
                                type="text"
                                placeholder="e.g. Completed web forms and styled the buttons."
                                value={submissionDesc}
                                onChange={(e) => setSubmissionDesc(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTaskSubmit(idx)}
                            disabled={isSubmittingTask || !submissionUrl.trim() || !submissionDesc.trim()}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-650 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-350 text-white font-bold rounded-2xl text-xs transition-colors flex justify-center items-center gap-1.5 active:scale-98 cursor-pointer shadow-xs"
                          >
                            {isSubmittingTask ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Submitting Homework...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                <span>Submit Homework Package</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-slate-150 text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>This homework becomes active when prior milestones are marked completed.</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: BOOK A MENTOR ZOOM */}
          {activeSubTab === 'mentor' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.8rem] bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm"
            >
              
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Video className="h-5.5 w-5.5 text-blue-600" />
                  <span>Book a 1-on-1 Mentor Zoom Session</span>
                </h3>
                <p className="text-xs text-slate-550 mt-1">
                  Connect with our senior engineering guides to solve coding bugs, review your GitHub code, or explore career options.
                </p>
              </div>

              {bookingSuccess ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-150 p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm">
                    <CheckCircle className="h-5 w-5" />
                    <span>Zoom Calling Slot Confirmed Successfully! 📅</span>
                  </div>
                  <div className="text-slate-650 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p><span className="text-slate-500 text-[10px] block uppercase font-bold">Scheduled Mentor:</span> <strong className="text-slate-800">{bookingSuccess.trainer}</strong></p>
                    <p><span className="text-slate-500 text-[10px] block uppercase font-bold">Scheduled Date:</span> <strong className="text-slate-800">{bookingSuccess.date}</strong></p>
                    <p><span className="text-slate-500 text-[10px] block uppercase font-bold">Scheduled Time:</span> <strong className="text-slate-800">{bookingSuccess.time}</strong></p>
                    <p><span className="text-slate-500 text-[10px] block uppercase font-bold">Zoom Link / Meeting ID:</span> <strong className="text-blue-600 underline font-mono font-bold">{bookingSuccess.id} (Zoom Room Entry Open)</strong></p>
                  </div>
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="px-5 py-2 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Reschedule or Book Another Slot
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMentorBooking} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Select Mentor Specialty</label>
                      <select
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer font-semibold"
                      >
                        <option value="Dr. Devendra R. Mathur">Dr. Devendra R. Mathur (Senior Architect)</option>
                        <option value="Prof. S. R. Srinivasan">Prof. S. R. Srinivasan (Database Systems)</option>
                        <option value="Kriti Chaturvedi">Kriti Chaturvedi (Full-Stack Support Coach)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Preferred Date</label>
                      <input
                        type="date"
                        value={mentorDate}
                        onChange={(e) => setMentorDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-850 text-xs focus:outline-none focus:border-blue-600 shadow-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Preferred Time Block</label>
                      <select
                        value={mentorTime}
                        onChange={(e) => setMentorTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-855 text-xs focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer font-semibold"
                      >
                        <option value="10:00 AM">10:00 AM - Morning Slot</option>
                        <option value="11:30 AM">11:30 AM - Late Morning Slot</option>
                        <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
                        <option value="04:00 PM">04:00 PM - Evening Review Slot</option>
                      </select>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-xs active:scale-98 cursor-pointer"
                    >
                      Process Zoom Appointment Slot
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          )}

          {/* TAB 3: GENERATE CERTIFICATE */}
          {activeSubTab === 'certificate' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.8rem] bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between"
            >
              
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-5.5 w-5.5 text-blue-600" />
                  <span>Your Verified Internship Certificate</span>
                </h3>
                <p className="text-xs text-slate-550 mt-1">
                  Once your learning progress hits 100%, the option to apply and compile your verified digital internship credentials will appear!
                </p>
              </div>

              {progressPercent < 100 && !activeEnrollment.certificateIssued ? (
                <div className="space-y-6">
                  {/* Lock Screen / Progress Needed layout */}
                  <div className="space-y-3.5">
                    
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                        <Check className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Sign up Registration Complete</span>
                      </div>
                      <span className="text-emerald-600 font-bold">• VERIFIED</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-505 font-semibold">
                        <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                        <span>Weekly Assignments Submissions ({completedTasksCount} / {tasksList.length})</span>
                      </div>
                      <span className="text-amber-500 font-semibold uppercase">{progressPercent}% DONE</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-505 font-semibold">
                        <AlertTriangle className="h-4.5 w-4.5 text-slate-400" />
                        <span>Final Capstone Code Assessment</span>
                      </div>
                      <span className="text-slate-500 font-bold uppercase">• PENDING TASKS</span>
                    </div>

                  </div>

                  <div className="p-6 rounded-[2rem] border border-amber-200 bg-amber-50/50 text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-lg font-bold font-mono">
                      !
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 text-sm">Course Completion In Progress</h4>
                      <p className="text-slate-600 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                        To apply for your verified credential release, please complete all {tasksList.length} weekly milestones first. Need speed? Use the simulator fast-track below.
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-150 font-sans">
                      <button
                        type="button"
                        onClick={handleFastTrackCompletion}
                        className="px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        ⚡ Fast-Track Course Complete (Simulator Mode)
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                /* Progress IS 100% or Admin officially issued -> Apply/Download Option Appears! */
                (certCompiled || activeEnrollment.certificateIssued) ? (
                  <div className="space-y-6">
                    
                    {/* Visual Verified Badge */}
                    <div className="rounded-2xl border border-emerald-250 bg-emerald-50/20 p-5 text-center space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-emerald-800 text-sm">
                          {activeEnrollment.certificateIssued ? 'Official Certificate Issued by Admin! 🎓' : 'Certificate Compiled & Verified!'}
                        </h4>
                        <p className="text-slate-600 text-xs max-w-lg mx-auto">
                          Your file matches record <span className="font-mono text-emerald-700 font-bold">{activeEnrollment.candidateId}</span>. It has been successfully compiled into our open registration databases.
                        </p>
                      </div>
                    </div>

                    {/* Quick Card info */}
                    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-205 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Certified Candidate</span>
                          <p className="text-slate-800 font-bold text-sm mt-0.5">{activeEnrollment.fullName}</p>
                          <p className="text-slate-550 text-xs">{activeEnrollment.collegeName}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Credentials ID</span>
                          <p className="text-blue-700 font-bold font-mono text-sm mt-0.5">{activeEnrollment.candidateId}</p>
                          <p className="text-slate-550 text-xs text-emerald-600 font-bold">✓ Verifiable certificate ledger node</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            downloadCertificatePDF(activeEnrollment, matchedDomain.title || 'Advanced Technology Intern');
                          }}
                          className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-md inline-flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 text-white" />
                          <span>Download Certificate (PDF)</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeEnrollment.candidateId);
                          }}
                          className="py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs active:scale-98 transition-all cursor-pointer shadow-xs"
                        >
                          Copy ID
                        </button>

                        <button
                          onClick={() => {
                            setCurrentTab('verify');
                          }}
                          className="py-3 px-4 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1 active:scale-98 transition-all cursor-pointer shadow-xs"
                        >
                          <span>Verify Live</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Status checklist showing 100% */}
                    <div className="space-y-3.5">
                      
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                          <Check className="h-4.5 w-4.5 text-emerald-600" />
                          <span>Sign up Registration Complete</span>
                        </div>
                        <span className="text-emerald-600 font-bold">• VERIFIED</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                          <Check className="h-4.5 w-4.5 text-emerald-600" />
                          <span>All Weekly Assignments Submissions (Passed)</span>
                        </div>
                        <span className="text-emerald-600 font-bold">• VERIFIED</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                          <Check className="h-4.5 w-4.5 text-emerald-600" />
                          <span>Final Capstone Code Approved</span>
                        </div>
                        <span className="text-emerald-600 font-bold">• VERIFIED</span>
                      </div>

                    </div>

                    <button
                      onClick={handleCompileCertificate}
                      disabled={isCompilingCert}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      {isCompilingCert ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Compiling Verified Internship Credentials...</span>
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4" />
                          <span>Apply & Compile Verified Certificate</span>
                        </>
                      )}
                    </button>

                  </div>
                )
              )}

            </motion.div>
          )}

          {/* TAB 4: INTERACTIVE ROADMAP VIEW */}
          {activeSubTab === 'roadmap' && (() => {
            const pathConfig = SUGGESTED_ROADMAP_PATHS[activeEnrollment.domainId] || {
              nextDomainId: 'full_stack',
              nextSpecialtyDomainId: 'devops',
              roleTitle: 'Elite Systems Engineer',
              expectedSalary: '₹10.5L - ₹20L / year',
              reason: 'Fostering cohesive microservices with secure defensive deployment and responsive design forms a master systems engineering stack.'
            };

            const currentDomainObj = matchedDomain;
            const nextDomainObj = INTERNSHIP_DOMAINS.find(d => d.id === pathConfig.nextDomainId) || INTERNSHIP_DOMAINS[1];
            const specialtyDomainObj = INTERNSHIP_DOMAINS.find(d => d.id === pathConfig.nextSpecialtyDomainId) || INTERNSHIP_DOMAINS[2];

            const activeShowcaseObj = selectedRoadmapNode === 'current' 
              ? currentDomainObj 
              : selectedRoadmapNode === 'next' 
              ? nextDomainObj 
              : specialtyDomainObj;

            const activeShowcaseConfig = selectedRoadmapNode === 'current'
              ? { 
                  stage: 'Stage 1: Active Foundation', 
                  badge: 'ACTIVE TRACK 🚀', 
                  reason: 'Your currently enrolled focus, establishing robust programming and baseline architectures.',
                  salary: '₹6L - ₹12L / year',
                  role: `Junior ${currentDomainObj.title.split('&')[0].split('and')[0]} Specialist`
                }
              : selectedRoadmapNode === 'next'
              ? {
                  stage: 'Stage 2: Core Vertical Extension',
                  badge: 'RECOMMENDED UPGRADE 🔥',
                  reason: pathConfig.reason,
                  salary: pathConfig.expectedSalary,
                  role: pathConfig.roleTitle
                }
              : {
                  stage: 'Stage 3: Advanced Specialty Horizon',
                  badge: 'ELITE SECTOR 👑',
                  reason: `An advanced frontier specialty domain. Mastering this next tier places you in top 2% of globally qualified engineering candidates.`,
                  salary: '₹16L - ₹32L / year',
                  role: `Principal ${specialtyDomainObj.title.split('&')[0].split('and')[0]} Architect`
                };

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 animate-fade-in"
              >
                {/* Introduction Card */}
                <div className="rounded-[1.8rem] bg-gradient-to-r from-blue-50 to-indigo-50/55 border border-blue-100 p-6 sm:p-8 relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 p-8 text-blue-600/5 pointer-events-none">
                    <Compass className="h-44 w-44 rotate-12 animate-spin-slow" />
                  </div>
                  
                  <div className="space-y-4 max-w-2xl relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] rounded-full font-mono font-bold uppercase tracking-wider">
                      <TrendingUp className="h-3 w-3" />
                      <span>Pathfinder Advisor Core Live</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      Your Personalized Career Roadmap
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Based on your active enrollment in <strong className="text-blue-605">{matchedDomain.title}</strong>, we have prepared a logical sequence of internships to build an elite, multi-disciplinary profile. Complete current milestones to claim certifications and upgrade!
                    </p>
                  </div>
                </div>

                {/* The Timeline Node Selector Bar */}
                <div className="rounded-[1.8rem] bg-slate-50 border border-slate-200 p-6 sm:p-8 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block text-center mb-6 font-mono">Interactive Career Progression</span>
                  
                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 max-w-4xl mx-auto px-4">
                    {/* Background connecting line (visible on desktop) */}
                    <div className="hidden md:block absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0" />
                    
                    {/* Dynamic indicator bar overlaying connected progress */}
                    <div className="hidden md:block absolute left-10 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500" style={{
                      width: selectedRoadmapNode === 'current' ? '0%' : selectedRoadmapNode === 'next' ? '45%' : '90%'
                    }} />

                    {/* NODE 1: Current Focus */}
                    <button
                      onClick={() => setSelectedRoadmapNode('current')}
                      className={`relative z-10 flex flex-col items-center gap-2 max-w-[220px] text-center focus:outline-none transition-all group cursor-pointer ${
                        selectedRoadmapNode === 'current' ? 'scale-105' : 'hover:scale-102 opacity-80'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                        selectedRoadmapNode === 'current'
                          ? 'bg-blue-650 text-white shadow-xs border-2 border-white font-bold'
                          : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:border-slate-400'
                      }`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 block font-bold">Stage 1: Active</span>
                        <p className={`text-xs font-bold mt-0.5 truncate max-w-[150px] ${selectedRoadmapNode === 'current' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                          {currentDomainObj.title.split('&')[0].split('and')[0]}
                        </p>
                      </div>
                    </button>

                    {/* Arrow for small screens / dividers */}
                    <div className="md:hidden h-4 w-0.5 bg-slate-200" />

                    {/* NODE 2: Recommended Next */}
                    <button
                      onClick={() => setSelectedRoadmapNode('next')}
                      className={`relative z-10 flex flex-col items-center gap-2 max-w-[220px] text-center focus:outline-none transition-all group cursor-pointer ${
                        selectedRoadmapNode === 'next' ? 'scale-105' : 'hover:scale-102 opacity-80'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                        selectedRoadmapNode === 'next'
                          ? 'bg-blue-600 text-white shadow-xs border-2 border-white font-bold'
                          : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:border-slate-400'
                      }`}>
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 block font-bold">Stage 2: Suggested</span>
                        <p className={`text-xs font-bold mt-0.5 truncate max-w-[150px] ${selectedRoadmapNode === 'next' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                          {nextDomainObj.title.split('&')[0].split('and')[0]}
                        </p>
                      </div>
                    </button>

                    {/* Arrow for small screens / dividers */}
                    <div className="md:hidden h-4 w-0.5 bg-slate-200" />

                    {/* NODE 3: Elite Horizon Specialization */}
                    <button
                      onClick={() => setSelectedRoadmapNode('specialty')}
                      className={`relative z-10 flex flex-col items-center gap-2 max-w-[220px] text-center focus:outline-none transition-all group cursor-pointer ${
                        selectedRoadmapNode === 'specialty' ? 'scale-105' : 'hover:scale-102 opacity-80'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                        selectedRoadmapNode === 'specialty'
                          ? 'bg-purple-600 text-white shadow-xs border-2 border-white font-bold'
                          : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:border-slate-400'
                      }`}>
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 block font-bold">Stage 3: Advanced Specialty</span>
                        <p className={`text-xs font-bold mt-0.5 truncate max-w-[150px] ${selectedRoadmapNode === 'specialty' ? 'text-slate-905' : 'text-slate-500 group-hover:text-slate-700'}`}>
                          {specialtyDomainObj.title.split('&')[0].split('and')[0]}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Dynamic Showcase Panel */}
                <div className="rounded-[1.8rem] bg-white border border-slate-200 p-6 sm:p-8 relative overflow-hidden shadow-sm">
                  {/* Accent background mesh */}
                  <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${activeShowcaseObj.gradient || 'from-blue-600/10 to-indigo-700/10'} rounded-full blur-[90px] pointer-events-none opacity-20`} />

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch relative z-10">
                    <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono uppercase bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1 rounded-full">
                            {activeShowcaseConfig.stage}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            {activeShowcaseConfig.badge}
                          </span>
                        </div>
                        
                        <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          {activeShowcaseObj.title}
                        </h4>
                        <p className="text-slate-605 text-xs sm:text-sm leading-relaxed">
                          {activeShowcaseObj.shortDesc}
                        </p>
                      </div>

                      {/* Skill targets / expectations check */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block font-mono">Pathway Strategic Relevance</span>
                        <p className="text-xs text-slate-700 italic leading-relaxed bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                          "{activeShowcaseConfig.reason}"
                        </p>
                      </div>

                      {/* Tools and tech tags */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-bold text-slate-505 tracking-widest block font-mono">Core Technologies Practiced</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeShowcaseObj.toolsAndTech.map((tech) => (
                            <span key={tech} className="text-[10px] font-mono bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-705 transition-all border border-slate-200 px-2.5 py-1 rounded-full font-semibold">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar stats panel (5 columns) */}
                    <div className="md:col-span-5 h-full">
                      <div className="rounded-[1.8rem] bg-slate-50 p-6 sm:p-8 border border-slate-200 space-y-6 flex flex-col justify-between h-full">
                        <div className="space-y-5 flex-grow">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Strategic Role Targeting</span>
                            <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5 leading-snug">
                              <Compass className="h-4 w-4 text-blue-600 shrink-0" />
                              <span>{activeShowcaseConfig.role}</span>
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Target Annual Package (Approx)</span>
                            <p className="text-lg font-mono font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
                              <TrendingUp className="h-5 w-5" />
                              <span>{activeShowcaseConfig.salary}</span>
                            </p>
                            <span className="text-[10px] text-slate-450 block mt-0.5">Estimated on active premium alumni placements</span>
                          </div>

                          <div className="pt-4 border-t border-slate-205 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Acquired Competencies</span>
                            <div className="flex flex-wrap gap-1">
                              {activeShowcaseObj.skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="text-[9px] uppercase font-bold tracking-tight px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-5 mt-4 border-t border-slate-200">
                          {selectedRoadmapNode === 'current' ? (
                            <button
                              onClick={() => setActiveSubTab('homework')}
                              className="w-full py-3.5 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all active:scale-98 cursor-pointer shadow-xs"
                            >
                              Continue Current Lab Homework
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (onSelectDomainForEnrollment) {
                                  onSelectDomainForEnrollment(activeShowcaseObj.id);
                                }
                                setCurrentTab('enroll');
                              }}
                              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all active:scale-98 cursor-pointer shadow-sm"
                            >
                              Lock Admission & Enroll in This Domain
                            </button>
                          )}
                          <span className="text-[9px] text-slate-400 text-center block mt-2 font-mono">
                            {selectedRoadmapNode === 'current' ? 'Access training console instantly' : 'Dual/Concurrent enrollment subsidized benefit eligible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* TAB 5: STUDENT PROFILE */}
          {activeSubTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.8rem] bg-white border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm"
            >
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="h-5.5 w-5.5 text-blue-600" />
                    <span>My Learning Profile details</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Manage your credentials, snap your verified student avatar, and track your active performance hours.
                  </p>
                </div>
                
                {saveSuccess && (
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 animate-pulse">
                    ✔ Changes Saved to Cloud Database!
                  </div>
                )}
              </div>

              {/* ROW 1: CAMERA SNAPSHOT */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Profile Photograph</span>
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                  <div className="relative h-28 w-28 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-150 overflow-hidden shrink-0 shadow-inner group">
                    {cameraActive ? (
                      <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
                        <video 
                          ref={videoRef} 
                          className="h-full w-full object-cover scale-x-[-1]" 
                          muted 
                          playsInline 
                        />
                      </div>
                    ) : capturedAvatar ? (
                      <img src={capturedAvatar} alt="Captured Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                        <User className="h-10 w-10 text-slate-400 group-hover:scale-105 transition-all" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-center sm:text-left flex-grow">
                    <p className="text-xs text-slate-500 leading-relaxed md:max-w-md font-medium">
                      Snap an instant professional avatar using your webcam. We secure your photo to customize your certificates.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {cameraActive ? (
                        <>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Capture Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={startCamera}
                            className="px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            <span>{capturedAvatar ? 'Retake Photo' : 'Capture with Camera'}</span>
                          </button>
                          {capturedAvatar && (
                            <button
                              type="button"
                              onClick={() => {
                                setCapturedAvatar(null);
                                const emailKey = activeEnrollment?.email || 'guest';
                                localStorage.removeItem(`invigo_avatar_${emailKey}`);
                              }}
                              className="px-3 py-2 bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                              Delete Photo
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {cameraError && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{cameraError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ROW 2: TOTAL METRIC HOURS DETAILS */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Academic Achievement & Study Hours Metrics</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-white to-blue-50/20 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-blue-600 block">Milestones Lab Work</span>
                      <span className="text-3xl font-extrabold text-slate-800 font-mono block mt-1.5">
                        {completedTasksCount * 15} <span className="text-xs font-bold font-sans text-slate-405">HRS</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 leading-relaxed font-medium">
                      Earned at 15 hours per completed weekly project check.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-white to-emerald-50/20 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 block">Independent LAB Practicum</span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-3xl font-extrabold text-slate-800 font-mono">
                          {extraStudyHours} <span className="text-xs font-bold font-sans text-slate-405">HRS</span>
                        </span>
                        
                        {/* Step custom inputs */}
                        <div className="flex flex-col gap-1 shrink-0 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleUpdateExtraHours(extraStudyHours + 5)}
                            className="h-6 w-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateExtraHours(extraStudyHours - 5)}
                            className="h-6 w-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-[10px] text-slate-400 block font-semibold uppercase">Self-Track hours:</label>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={extraStudyHours}
                        onChange={(e) => handleUpdateExtraHours(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-205 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-1"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-[-30%] right-[-10%] h-36 w-36 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
                    
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-blue-300 block">Grand Total Completed Care Time</span>
                      <span className="text-4xl font-black font-mono text-cyan-300 block mt-1.5">
                        {(completedTasksCount * 15) + (bookingSuccess ? 2 : 0) + extraStudyHours} <span className="text-sm font-bold font-sans text-white/50">HRS</span>
                      </span>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Target: 150 hours</span>
                      <span className="font-bold text-cyan-300">
                        {Math.round((((completedTasksCount * 15) + (bookingSuccess ? 2 : 0) + extraStudyHours) / 150) * 100)}% Reached
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* ROW 3: DETAILED USER INPUT FIELDS */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Academic & Bio-Data Registration Details</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block">Full Student Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block">Contact Phone</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block">College / University Name</label>
                    <input
                      type="text"
                      value={profileCollege}
                      onChange={(e) => setProfileCollege(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block">Degree Selection</label>
                    <select
                      value={profileDegree}
                      onChange={(e) => setProfileDegree(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-semibold cursor-pointer"
                    >
                      <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                      <option value="Diploma">Diploma (Engineering/Polytechnic)</option>
                      <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                      <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                      <option value="MBA">MBA (Master of Business Administration)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block">Branch / Field of Study</label>
                    <input
                      type="text"
                      value={profileField}
                      onChange={(e) => setProfileField(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block">Current Academic Year</label>
                    <input
                      type="text"
                      value={profileYear}
                      onChange={(e) => setProfileYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-semibold"
                      placeholder="e.g. 3rd Year"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block">Expected Passing Year</label>
                    <input
                      type="text"
                      value={profilePassingYear}
                      onChange={(e) => setProfilePassingYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-semibold"
                      placeholder="e.g. 2027"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-6 py-3.5 bg-blue-650 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (activeEnrollment) {
                        setProfileName(activeEnrollment.fullName || '');
                        setProfileCollege(activeEnrollment.collegeName || '');
                        setProfileDegree(activeEnrollment.degree || 'B.Tech');
                        setProfileField(activeEnrollment.fieldOfStudy || '');
                        setProfileYear(activeEnrollment.currentYear || '');
                        setProfilePassingYear(activeEnrollment.passingYear || '');
                        setProfilePhone(activeEnrollment.phone || '');
                      }
                    }}
                    className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
