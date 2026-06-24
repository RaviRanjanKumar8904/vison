import { useState, FormEvent, useEffect, useRef } from 'react';
import { 
  Award, Clock, GraduationCap, ChevronRight, CheckCircle, Calendar, 
  User, Sparkles, Send, CheckSquare, PlusCircle, BookOpen, AlertTriangle, 
  ExternalLink, Trophy, Sparkle, Download, RefreshCw, MessageSquare, Laptop, 
  Check, Play, Video, HelpCircle, FileText, ArrowRight, Compass, TrendingUp,
  Camera, Save, Lock, Unlock, FileType, XCircle, X
} from 'lucide-react';
import { INTERNSHIP_DOMAINS } from '../data';
import { EnrollmentState, StudyMaterial, MCQQuestion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { downloadCertificatePDF, downloadOfferLetterPDF } from '../utils/pdfGenerator';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

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
  // Removed unused props
  currentUser?: any;
}

export default function StudentNexus({ 
  enrollments, 
  setCurrentTab, 
  onSelectDomainForEnrollment,
  // Removed unused props from destructuring
  currentUser
}: StudentNexusProps) {
  const hasEnrolled = enrollments.length > 0;
  
  const activeEnrollments = enrollments;
  const [selectedEnrollmentIdx, setSelectedEnrollmentIdx] = useState(0);
  const activeEnrollment = activeEnrollments[selectedEnrollmentIdx];

  const matchedDomain = INTERNSHIP_DOMAINS.find(domain => domain.id === activeEnrollment?.domainId) || INTERNSHIP_DOMAINS[0];

  // Active sub-sections (Samsung One UI segmented control)
  const [activeSubTab, setActiveSubTab] = useState<'homework' | 'mentor' | 'certificate' | 'roadmap'>('homework');
  const [selectedRoadmapNode, setSelectedRoadmapNode] = useState<'current' | 'next' | 'specialty'>('next');

  // Study Materials State
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  
  // MCQ Test State
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [activeTest, setActiveTest] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  const [retryUtr, setRetryUtr] = useState('');
  const [retryAmount, setRetryAmount] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  // Material Progress (simulated via localStorage or we could use firestore)
  const [unlockedMaterials, setUnlockedMaterials] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`invigo_progress_${activeEnrollment?.candidateId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [0]; // First material is unlocked by default
  });

  useEffect(() => {
    if (!activeEnrollment) return;
    
    // Fetch materials
    const matQ = query(collection(db, 'studyMaterials'), where('domainId', '==', activeEnrollment.domainId));
    const unsubMat = onSnapshot(matQ, snap => {
      const mats: StudyMaterial[] = [];
      snap.forEach(d => mats.push({ id: d.id, ...d.data() } as StudyMaterial));
      mats.sort((a, b) => a.order - b.order);
      setMaterials(mats);
      setMaterialsLoading(false);
    });

    // Fetch questions
    const qQuery = query(collection(db, 'mcqQuestions'), where('domainId', '==', activeEnrollment.domainId));
    const unsubQ = onSnapshot(qQuery, snap => {
      const qs: MCQQuestion[] = [];
      snap.forEach(d => qs.push({ id: d.id, ...d.data() } as MCQQuestion));
      // Shuffle or just slice to 10 max
      setQuestions(qs.slice(0, 10));
    });

    // Fetch test results
    if (activeEnrollment.email) {
      const resQ = query(collection(db, 'testResults'), 
        where('studentEmail', '==', activeEnrollment.email),
        where('domainId', '==', activeEnrollment.domainId));
      const unsubRes = onSnapshot(resQ, snap => {
        if (!snap.empty) {
          // Filter by candidateId to prevent showing previous enrollment tests
          let validDocs = snap.docs.filter(d => {
            const data = d.data();
            return !data.candidateId || data.candidateId === activeEnrollment.candidateId;
          });

          if (validDocs.length > 0) {
            // Sort by timestamp descending to get latest
            const sortedDocs = validDocs.sort((a, b) => {
              const aTime = a.data().timestamp ? new Date(a.data().timestamp).getTime() : 0;
              const bTime = b.data().timestamp ? new Date(b.data().timestamp).getTime() : 0;
              return bTime - aTime;
            });
            setTestResult({ id: sortedDocs[0].id, ...sortedDocs[0].data() });
          } else {
            setTestResult(null);
          }
        } else {
          setTestResult(null);
        }
      });
      return () => { unsubMat(); unsubQ(); unsubRes(); };
    }

    return () => { unsubMat(); unsubQ(); };
  }, [activeEnrollment]);

  const handleMarkMaterialComplete = (index: number) => {
    const newUnlocked = [...unlockedMaterials, index + 1];
    setUnlockedMaterials(newUnlocked);
    localStorage.setItem(`invigo_progress_${activeEnrollment.candidateId}`, JSON.stringify(newUnlocked));
  };

  const handlePaymentRetry = async () => {
    if (!retryUtr || !retryAmount) return;
    setIsRetrying(true);
    try {
      const docRef = doc(db, 'enrollments', activeEnrollment.candidateId);
      await updateDoc(docRef, { 
        paymentTxnId: retryUtr.trim().toUpperCase(), 
        amountPaid: parseFloat(retryAmount), 
        paymentStatus: 'pending' 
      });
      // Prop removed: real-time listener will sync state
      setRetryUtr('');
      setRetryAmount('');
    } catch (e) {
      console.error(e);
    }
    setIsRetrying(false);
  };

  // Mentorship Meeting state
  const [mentorDate, setMentorDate] = useState('2026-06-25');
  const [mentorTime, setMentorTime] = useState('11:00 AM');
  const [selectedTrainer, setSelectedTrainer] = useState('Dr. Devendra R. Mathur');
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  

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

  // Calculate Progress Percent based on materials and test
  const completedCount = Math.max(0, unlockedMaterials.length - 1);
  const materialProgress = materials.length > 0 ? (completedCount / materials.length) * 95 : 0;
  const progressPercent = testResult?.passed ? 100 : Math.round(materialProgress);

  // TODO: This MCQ test is graded entirely client-side, and correct answers are readable by the user.
  // The long-term fix is to create a Cloud Functions callable (`gradeTest`) that accepts only the 
  // student's selected answers, looks up correct answers server-side, and writes the verified result.
  const submitMCQTest = async () => {
    setIsSubmittingTest(true);
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++;
    });
    
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 60;

    try {
      await addDoc(collection(db, 'testResults'), {
        studentEmail: activeEnrollment.email,
        domainId: activeEnrollment.domainId,
        score,
        passed,
        candidateId: activeEnrollment.candidateId,
        timestamp: new Date().toISOString()
      });
      
      setActiveTest(false);
    } catch (e) {
      console.error(e);
    }
    setIsSubmittingTest(false);
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

  const handleCompileCertificate = async () => {
    setIsCompilingCert(true);
    try {
      const docRef = doc(db, 'enrollments', activeEnrollment.candidateId);
      await updateDoc(docRef, { 
        certificateRequested: true, 
        certificateRequestedAt: new Date().toISOString() 
      });
    } catch (e) {
      console.error("Failed to request certificate:", e);
    }
    setIsCompilingCert(false);
  };

  

  const handleUpdateExtraHours = (val: number) => {
    const newVal = Math.max(0, val);
    setExtraStudyHours(newVal);
    const emailKey = activeEnrollment?.email || 'guest';
    localStorage.setItem(`invigo_study_hours_${emailKey}`, String(newVal));
  };

  

    const isDurationComplete = (startDate: string, durationWeeks: number): boolean => {
      if (!startDate) return false;
      const start = new Date(startDate);
      const end = new Date(start.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
      return new Date() >= end;
    };

    const renderPaymentPending = () => {
      if (activeEnrollment.paymentStatus === 'rejected') {
        return (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4">
            <XCircle className="h-12 w-12 text-rose-600 mx-auto" />
            <h3 className="text-xl font-bold text-rose-800">Payment Verification Failed</h3>
            <p className="text-sm text-rose-600 max-w-md mx-auto">
              Reason: {activeEnrollment.rejectionReason || 'Invalid UTR or Amount mismatch'}
            </p>
            <div className="bg-white p-6 rounded-xl shadow-sm text-left max-w-sm mx-auto space-y-4 border border-rose-100">
              <h4 className="font-bold text-sm text-slate-800">Resubmit Payment Details</h4>
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-slate-600">Correct Amount Paid (₹)</label>
                <input 
                  type="number" 
                  value={retryAmount} 
                  onChange={e => setRetryAmount(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 792"
                />
              </div>
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-slate-600">Correct 12-Digit UTR No.</label>
                <input 
                  type="text" 
                  value={retryUtr} 
                  onChange={e => setRetryUtr(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 123456789012"
                />
              </div>
              <button 
                onClick={handlePaymentRetry}
                disabled={isRetrying || !retryAmount || !retryUtr}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-all cursor-pointer"
              >
                {isRetrying ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center space-y-4 mt-6">
          <Clock className="h-12 w-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-amber-800">Payment Verification Pending</h3>
          <p className="text-sm text-amber-700 max-w-md mx-auto">
            Your payment details have been recorded and are currently under review by our administrative team. 
            Course materials and certificates will be unlocked automatically once verification is complete.
          </p>
        </div>
      );
    };

    if (!hasEnrolled || !activeEnrollment) {
      return (
        <div className="pt-24 pb-12 bg-slate-50 min-h-[80vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 mb-3">No Active Enrollments</h2>
          <p className="text-slate-600 text-center max-w-md mb-8">You haven't enrolled in any internship programs yet. Explore our cutting-edge cohorts and start your journey.</p>
          <button onClick={() => setCurrentTab('internships')} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer">
            Browse Internships
          </button>
        </div>
      );
    }

    return (
    <div className="relative bg-transparent text-slate-800 py-12 font-sans animate-fade-in">
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        
        {/* Header - Samsung One UI style: Giant comfortable text left, profile details right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Student Dashboard</span>
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
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Course Progress</h3>
              <p className="text-xs text-slate-500">Weekly milestone submissions completed.</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative my-6 flex items-center justify-center">
              <svg className="w-36 h-36" viewBox="0 0 144 144">
                {/* Background circle */}
                <circle
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                  r="62"
                  cx="72"
                  cy="72"
                />
                {/* Foreground accent circle */}
                <circle
                  stroke={progressPercent >= 100 ? '#10b981' : '#2563eb'}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  r="62"
                  cx="72"
                  cy="72"
                  transform="rotate(-90 72 72)"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">{progressPercent}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">COMPLETE</span>
              </div>
            </div>

            {/* Micro stats */}
            <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-[1.4rem]">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Materials Complete</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {Math.min(unlockedMaterials.length - 1, materials.length)} / {materials.length}
                </span>
              </div>
              <div className="text-center border-l border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Status</span>
                <span className={`text-xs font-bold mt-0.5 block ${progressPercent >= 100 ? 'text-emerald-600' : progressPercent > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {progressPercent >= 100 ? 'All Done ✓' : progressPercent > 0 ? 'In Progress' : 'Not Started'}
                </span>
              </div>
            </div>

          </div>

          {/* Active Enrollment Specifications Card (7 cols) */}
          <div className="md:col-span-7 rounded-[1.8rem] bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden hover:border-slate-300 transition-all">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>ACTIVE COHORT</span>
                </div>
                {/* Payment status chip */}
                {hasEnrolled && (
                  activeEnrollment.paymentVerified ? (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full font-bold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Payment Verified</span>
                      </div>
                      <button
                        onClick={() => downloadOfferLetterPDF(activeEnrollment, matchedDomain.title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Offer Letter</span>
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-full font-bold animate-pulse">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Payment Pending Verification</span>
                    </div>
                  )
                )}
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
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                    <User className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name / ID</span>
                    <span className="text-xs font-bold text-slate-805">{activeEnrollment.fullName} ({activeEnrollment.candidateId})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                    <GraduationCap className="h-4.5 w-4.5 text-blue-655" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">College / University</span>
                    <span className="text-xs font-bold text-slate-805 truncate max-w-[200px] block">{activeEnrollment.collegeName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                    <Calendar className="h-4.5 w-4.5 text-blue-655" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Start Date & Duration</span>
                    <span className="text-xs font-bold text-slate-805">{activeEnrollment.startDate} • {activeEnrollment.durationWeeks} Weeks</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
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
                <span key={tool} className="text-[10px] font-mono bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="h-4.5 w-4.5" />
              <span>Homework</span>
            </button>



            <button
              onClick={() => setActiveSubTab('certificate')}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'certificate'
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Compass className="h-4.5 w-4.5" />
              <span>Roadmap</span>
            </button>

            

          </div>
        </div>

        {/* Sub-Views Swapper content */}
        <div className="pt-2">
          
          {/* TAB 1: STUDY MATERIALS & ASSESSMENT */}
          {activeSubTab === 'homework' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {!activeEnrollment.paymentVerified && renderPaymentPending()}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Study Materials & Assessments</span>
                </h3>
                <span className="text-xs text-slate-550 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                  Complete sequence to unlock certificate
                </span>
              </div>

              {materialsLoading ? (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                  <RefreshCw className="h-8 w-8 animate-spin mb-3 text-blue-400" />
                  <p className="text-sm">Loading curriculum...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No study materials have been assigned to this domain yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {materials.map((material, idx) => {
                    const isUnlocked = activeEnrollment.paymentVerified && unlockedMaterials.includes(idx);
                    const isNextToUnlock = isUnlocked && !unlockedMaterials.includes(idx + 1) && idx < materials.length;

                    return (
                      <div 
                        key={material.id} 
                        className={`rounded-[1.8rem] border p-5 transition-all ${
                          isUnlocked 
                            ? 'border-blue-200 bg-white shadow-sm' 
                            : 'border-slate-200 bg-slate-50 opacity-70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex gap-3 items-center">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? (material.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600') : 'bg-slate-100 text-slate-400'}`}>
                              {isUnlocked ? (material.type === 'pdf' ? <FileType className="h-5 w-5" /> : <Video className="h-5 w-5" />) : <Lock className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className={`font-bold text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                {idx + 1}. {material.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                                {material.type === 'pdf' ? 'PDF Document' : 'Video Resource'}
                              </p>
                            </div>
                          </div>
                          
                          {isUnlocked ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                              {material.type === 'video_embed' || material.type === 'video' ? (
                                <button onClick={() => {
                                  window.history.pushState({}, '', `/player?id=${material.id}`);
                                  setCurrentTab('player');
                                }} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors text-center flex-1 sm:flex-none cursor-pointer">
                                  Watch Video
                                </button>
                              ) : (
                                <a href={material.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors text-center flex-1 sm:flex-none cursor-pointer">
                                  Open Material
                                </a>
                              )}
                              {isNextToUnlock && (
                                <button onClick={() => handleMarkMaterialComplete(idx)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none cursor-pointer">
                                  <Check className="h-3.5 w-3.5" /> Mark Complete
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 font-bold uppercase w-full sm:w-auto text-center">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Assessment Section */}
              {activeEnrollment.paymentVerified && materials.length > 0 && unlockedMaterials.length >= materials.length && (
                <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                  <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" /> Final Domain Assessment
                  </h4>
                  
                  {testResult ? (
                    <div className={`p-5 rounded-2xl border ${testResult.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        {testResult.passed ? <CheckCircle className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                        <h5 className={`font-bold text-lg ${testResult.passed ? 'text-emerald-800' : 'text-red-800'}`}>
                          {testResult.passed ? 'Assessment Passed!' : 'Assessment Failed'}
                        </h5>
                      </div>
                      <p className={`text-sm ${testResult.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                        Your score: <strong>{testResult.score}%</strong> (Required: 60%)
                      </p>
                      {testResult.passed ? (
                        <p className="text-xs text-emerald-600 mt-2 font-medium">You are now eligible to claim your completion certificate from the Certificate tab.</p>
                      ) : (
                        <button onClick={() => setTestResult(null)} className="mt-3 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-50 cursor-pointer">
                          Retake Assessment
                        </button>
                      )}
                    </div>
                  ) : activeTest ? (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-800">Question {currentQIndex + 1} of {questions.length}</h5>
                        <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">Pass: 60%</span>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-slate-800">{questions[currentQIndex]?.question}</p>
                        <div className="space-y-2">
                          {questions[currentQIndex]?.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setAnswers({...answers, [currentQIndex]: i})}
                              className={`w-full text-left p-3 rounded-xl border text-sm transition-all cursor-pointer ${answers[currentQIndex] === i ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}
                            >
                              {String.fromCharCode(65 + i)}. {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                          disabled={currentQIndex === 0}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 disabled:opacity-50 cursor-pointer"
                        >
                          Previous
                        </button>
                        {currentQIndex < questions.length - 1 ? (
                          <button 
                            onClick={() => setCurrentQIndex(currentQIndex + 1)}
                            disabled={answers[currentQIndex] === undefined}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white disabled:opacity-50 cursor-pointer"
                          >
                            Next Question
                          </button>
                        ) : (
                          <button 
                            onClick={submitMCQTest}
                            disabled={Object.keys(answers).length < questions.length || isSubmittingTest}
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700 flex items-center gap-2 cursor-pointer shadow-sm"
                          >
                            {isSubmittingTest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Submit Assessment
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">Ready for the test?</h5>
                        <p className="text-xs text-slate-500 mt-1">10 multiple choice questions. Requires 60% to pass.</p>
                      </div>
                      <button 
                        onClick={() => { setActiveTest(true); setCurrentQIndex(0); setAnswers({}); }} 
                        disabled={questions.length === 0}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm text-sm cursor-pointer disabled:opacity-50 w-full sm:w-auto text-center"
                      >
                        {questions.length === 0 ? 'No Questions Available' : 'Start Assessment'}
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm">
                    <CheckCircle className="h-5 w-5" />
                    <span>Zoom Calling Slot Confirmed Successfully! 📅</span>
                  </div>
                  <div className="text-slate-600 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-xs active:scale-98 cursor-pointer"
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
              {!activeEnrollment.paymentVerified ? renderPaymentPending() : (
                <>
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-5.5 w-5.5 text-blue-600" />
                  <span>Your Verified Internship Certificate</span>
                </h3>
                <p className="text-xs text-slate-550 mt-1">
                  Once your learning progress hits 100%, the option to apply and compile your verified digital internship credentials will appear!
                </p>
              </div>

              {((!isDurationComplete(activeEnrollment.startDate, activeEnrollment.durationWeeks) || progressPercent < 100) && !activeEnrollment.certificateIssued) ? (
                <div className="space-y-6">
                  {/* Lock Screen / Progress Needed layout */}
                  <div className="space-y-3.5">
                    
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                        <Check className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Sign up Registration Complete</span>
                      </div>
                      <span className="text-emerald-600 font-bold">• VERIFIED</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-505 font-semibold">
                        <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                        <span>Study Materials Completed ({Math.min(unlockedMaterials.length - 1, materials.length)} / {materials.length})</span>
                      </div>
                      <span className="text-amber-500 font-semibold uppercase">{Math.min(95, Math.round((unlockedMaterials.length / Math.max(1, materials.length)) * 100))}% DONE</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-505 font-semibold">
                        <AlertTriangle className="h-4.5 w-4.5 text-slate-400" />
                        <span>Final Capstone Code Assessment</span>
                      </div>
                      <span className="text-slate-500 font-bold uppercase">• PENDING TASKS</span>
                    </div>

                  </div>

                  <div className="p-6 rounded-[2rem] border border-amber-200 bg-amber-50/50 text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-2xl">
                      🎓
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 text-sm">Complete Your Duration & Assignments to Unlock</h4>
                      <p className="text-slate-600 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                        Wait for your internship duration of {activeEnrollment.durationWeeks} weeks to complete. Also complete all {materials.length} study materials and pass the final MCQ assessment with a score of 60% or higher to become eligible for your verified internship certificate.
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                /* Progress IS 100% or Admin officially issued -> Apply/Download Option Appears! */
                (activeEnrollment.certificateIssued) ? (
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
                          className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1 active:scale-98 transition-all cursor-pointer shadow-xs"
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
                      
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                          <Check className="h-4.5 w-4.5 text-emerald-600" />
                          <span>Sign up Registration Complete</span>
                        </div>
                        <span className="text-emerald-600 font-bold">• VERIFIED</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                          <Check className="h-4.5 w-4.5 text-emerald-600" />
                          <span>All Weekly Assignments Submissions (Passed)</span>
                        </div>
                        <span className="text-emerald-600 font-bold">• VERIFIED</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                          <Check className="h-4.5 w-4.5 text-emerald-600" />
                          <span>Final Capstone Code Approved</span>
                        </div>
                        <span className="text-emerald-600 font-bold">• VERIFIED</span>
                      </div>

                    </div>

                    {activeEnrollment.certificateRequested ? (
                      <div className="w-full py-4 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5 cursor-not-allowed shadow-xs">
                        <Clock className="h-4 w-4" />
                        <span>Certificate requested — pending final admin verification</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleCompileCertificate}
                        disabled={isCompilingCert}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        {isCompilingCert ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Requesting Verified Internship Credentials...</span>
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4" />
                            <span>Apply & Request Verified Certificate</span>
                          </>
                        )}
                      </button>
                    )}

                  </div>
                )
              )}
                </>
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
                          ? 'bg-blue-600 text-white shadow-xs border-2 border-white font-bold'
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
                        <p className={`text-xs font-bold mt-0.5 truncate max-w-[150px] ${selectedRoadmapNode === 'specialty' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
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
                            <span className="text-[10px] text-slate-400 block mt-0.5">Estimated on active premium alumni placements</span>
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
                              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all active:scale-98 cursor-pointer shadow-xs"
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

          </div>

      </div>
    </div>
  );
}
