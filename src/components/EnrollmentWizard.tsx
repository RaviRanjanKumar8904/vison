import { useState, useEffect, FormEvent } from 'react';
import { 
  Sparkles, CheckCircle, GraduationCap, ChevronRight, User, Mail, 
  Phone, Calendar, BookOpen, Award, ArrowRight, Download, RefreshCw, BookmarkCheck
} from 'lucide-react';
import { INTERNSHIP_DOMAINS } from '../data';
import { EnrollmentState } from '../types';

import { StudentUser } from '../types';
import { downloadOfferLetterPDF } from '../utils/pdfGenerator';

interface EnrollmentWizardProps {
  preselectedDomainId: string;
  setPreselectedDomainId: (id: string) => void;
  onEnrollmentComplete: (newEnrollment: EnrollmentState) => void;
  setCurrentTab: (tab: string) => void;
  currentUser?: StudentUser;
}

export default function EnrollmentWizard({
  preselectedDomainId,
  setPreselectedDomainId,
  onEnrollmentComplete,
  setCurrentTab,
  currentUser
}: EnrollmentWizardProps) {
  // Wizard steps: 1 = Personal Details, 2 = Academic Data, 3 = Domain Configuration, 4 = Offer Synthesis
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    collegeName: currentUser?.collegeName || '',
    registrationNo: currentUser?.registrationNo || '',
    degree: (currentUser?.degree || 'B.Tech') as 'B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA' | 'BA' | 'B.Com',
    fieldOfStudy: currentUser?.fieldOfStudy || '',
    currentYear: currentUser?.currentYear || '3rd Year',
    passingYear: currentUser?.passingYear || '2027',
    domainId: preselectedDomainId || 'ai_ml',
    durationWeeks: 8,
    startDate: new Date().toISOString().split('T')[0],
    motivation: '',
    trainingMode: 'online' as 'online' | 'offline'
  });

  const [synthesizedOffer, setSynthesizedOffer] = useState<EnrollmentState | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [activePayMethod, setActivePayMethod] = useState<'qr' | 'upi' | 'phone'>('qr');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [copyStatus, setCopyStatus] = useState<'upi' | 'amount' | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        collegeName: currentUser.collegeName || prev.collegeName,
        registrationNo: currentUser.registrationNo || prev.registrationNo,
        degree: (currentUser.degree || prev.degree) as any,
        fieldOfStudy: currentUser.fieldOfStudy || prev.fieldOfStudy,
        currentYear: currentUser.currentYear || prev.currentYear,
        passingYear: currentUser.passingYear || prev.passingYear,
      }));
      setPhoneInput(currentUser.phone);
    }
  }, [currentUser]);

  useEffect(() => {
    if (preselectedDomainId) {
      setFormData((prev) => ({ ...prev, domainId: preselectedDomainId }));
    }
  }, [preselectedDomainId]);

  useEffect(() => {
    if (currentStep === 4) {
      setAmountPaidInput((formData.durationWeeks * (formData.trainingMode === 'online' ? 99 : 149)).toString());
    }
  }, [currentStep, formData.durationWeeks, formData.trainingMode]);

  const validateStep = (step: number) => {
    const tempErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.fullName.trim()) tempErrors.fullName = 'Full name is required.';
      if (!formData.email.trim()) {
        tempErrors.email = 'Email address is required.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = 'Please enter a valid email address.';
      }
      if (!formData.phone.trim()) {
        tempErrors.phone = 'Phone number is required.';
      } else if (formData.phone.length < 10) {
        tempErrors.phone = 'Please enter a valid 10-digit phone number.';
      }
    } else if (step === 2) {
      if (!formData.collegeName.trim()) tempErrors.collegeName = 'College or university name is required.';
      if (!formData.registrationNo.trim()) tempErrors.registrationNo = 'College registration number is required.';
      if (!formData.fieldOfStudy.trim()) tempErrors.fieldOfStudy = 'Field of study or branch is required.';
      if (!formData.passingYear.trim() || isNaN(Number(formData.passingYear))) {
        tempErrors.passingYear = 'Please enter a valid graduation year.';
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const [lastStepChangeTime, setLastStepChangeTime] = useState(0);

  const handleNext = () => {
    const now = Date.now();
    if (now - lastStepChangeTime < 400) return; // Prevent click-through skip bug
    
    if (validateStep(currentStep)) {
      setLastStepChangeTime(now);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    const now = Date.now();
    if (now - lastStepChangeTime < 400) return;
    setLastStepChangeTime(now);
    setCurrentStep(currentStep - 1);
  };

  const generateCandidateId = () => {
    const year = new Date().getFullYear();
    const regNo = formData.registrationNo ? formData.registrationNo.replace(/\s+/g, '').toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    return `${year}IN${regNo}`;
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (validateStep(1)) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep(2)) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep(3)) setCurrentStep(4);
    }
  };

  const handlePaymentComplete = (txnId: string) => {
    setIsSynthesizing(true);
    const finalAmount = parseFloat(amountPaidInput) || (formData.durationWeeks * (formData.trainingMode === 'online' ? 99 : 149));
    
    // Simulate futuristic quantum credentials synthesis
    setTimeout(() => {
      const compiledOffer: EnrollmentState = {
        ...formData,
        email: formData.email.toLowerCase(),
        candidateId: generateCandidateId(),
        enrollmentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'Initiated',
        trainingMode: formData.trainingMode,
        amountPaid: finalAmount,
        paymentTxnId: txnId,
        paymentVerified: false,
        paymentStatus: 'pending',
        certificateIssued: false
      };
      
      setSynthesizedOffer(compiledOffer);
      onEnrollmentComplete(compiledOffer);
      setIsSynthesizing(false);
      setCurrentStep(5);
    }, 2500);
  };

  const selectedDomainObject = INTERNSHIP_DOMAINS.find(domain => domain.id === formData.domainId) || INTERNSHIP_DOMAINS[0];

  return (
    <div className="relative overflow-hidden bg-transparent text-slate-800 py-12 md:py-16">
      
      {/* Glow overlays */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] h-[400px] w-[400px] rounded-full bg-blue-300/10 blur-[80px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-indigo-300/10 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Progress Bar Header wrapper, show only if not completed */}
        {currentStep < 5 && (
          <div className="space-y-6 mb-12">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-mono text-blue-600 font-bold">
                <BookmarkCheck className="h-4 w-4" />
                <span>ONLINE ADMISSION PORTAL</span>
              </span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Internship Enrollment Form
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                Fill in your details below to instantly generate your official digital admission letter and map out your internship milestones.
              </p>
            </div>

            {/* Steps indicator */}
            <div className="flex justify-between items-center max-w-lg mx-auto pt-4 relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-300 z-0" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />

              {[
                { step: 1, label: 'Personal Info' },
                { step: 2, label: 'College Info' },
                { step: 3, label: 'Select Domain' },
                { step: 4, label: 'Secure Pay' }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    currentStep === item.step 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                      : currentStep > item.step
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {currentStep > item.step ? '✔' : item.step}
                  </div>
                  <span className={`text-[10px] font-mono tracking-wider font-semibold ${
                    currentStep === item.step ? 'text-blue-600 font-bold' : 'text-slate-450'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPREHENSIVE MULTI STEP WIZARD FORM */}
        {currentStep < 4 && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                           {/* STEP 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="font-display font-bold text-base text-slate-900">Step 1: Contact Details</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentUser 
                        ? 'Your contact information has been auto-filled from your registered student profile.' 
                        : 'Please enter your basic information to launch your registry profile.'}
                    </p>
                  </div>

                  {currentUser && (
                    <div className="p-3 border border-blue-200 bg-blue-50 rounded-2xl text-[11px] text-blue-700 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                      <span>Profile verified and synchronized: <strong className="text-slate-900 font-semibold">{currentUser.email}</strong></span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-blue-500" />
                        <span>Your Full Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priyanshu Ranjan"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={!!currentUser}
                        className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all ${
                          currentUser ? 'opacity-80 cursor-not-allowed border-slate-200 bg-slate-100' : ''
                        }`}
                      />
                      {errors.fullName && <p className="text-[10px] font-mono text-rose-500">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-blue-500" />
                          <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. priyanshu@university.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!!currentUser}
                          className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all ${
                            currentUser ? 'opacity-80 cursor-not-allowed border-slate-200 bg-slate-100' : ''
                          }`}
                        />
                        {errors.email && <p className="text-[10px] font-mono text-rose-500">{errors.email}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-blue-500" />
                          <span>Contact Number</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
                        />
                        {errors.phone && <p className="text-[10px] font-mono text-rose-500">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Academic Alignment */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="font-display font-bold text-base text-slate-900">Step 2: College Details</h3>
                    <p className="text-xs text-slate-500 mt-1">Please enter your current academic information to align your path.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <span>College or University Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi Technological University (DTU)"
                        value={formData.collegeName}
                        onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
                      />
                      {errors.collegeName && <p className="text-[10px] font-mono text-rose-500">{errors.collegeName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span>College Registration Number</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 25UG010748"
                        value={formData.registrationNo}
                        onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
                      />
                      {errors.registrationNo && <p className="text-[10px] font-mono text-rose-500">{errors.registrationNo}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500">Current College Degree</label>
                        <select
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value as any })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white"
                        >
                          <option value="B.Tech">B.Tech (Engineering)</option>
                          <option value="Diploma">Diploma (Polytechnic)</option>
                          <option value="BCA">BCA (Computer Applications)</option>
                          <option value="B.Sc">B.Sc (Science/CS)</option>
                          <option value="MBA">MBA (Business Administration)</option>
                          <option value="BA">BA (Arts/Humanities)</option>
                          <option value="B.Com">B.Com (Commerce)</option>                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                          <span>Field of Study / Branch</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={formData.fieldOfStudy}
                          onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
                        />
                        {errors.fieldOfStudy && <p className="text-[10px] font-mono text-rose-500">{errors.fieldOfStudy}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500">Current Year of Study</label>
                        <select
                          value={formData.currentYear}
                          onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500">Expected Passing Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2027"
                          value={formData.passingYear}
                          onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
                        />
                        {errors.passingYear && <p className="text-[10px] font-mono text-rose-500">{errors.passingYear}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Domain Alignment */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="font-display font-bold text-base text-slate-900">Step 3: Domain Alignment & Custom Parameters</h3>
                    <p className="text-xs text-slate-500 mt-1">Configure target technology nodes and timeline limits.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Active Domain Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500">Target Tech/Management Domain</label>
                        <select
                          value={formData.domainId}
                          onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                        >
                          {INTERNSHIP_DOMAINS.map((domain) => (
                            <option key={domain.id} value={domain.id}>
                              {domain.title} ({domain.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Duration selector depending on domain options */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500">Target Cohort Duration</label>
                        <select
                          value={formData.durationWeeks}
                          onChange={(e) => setFormData({ ...formData, durationWeeks: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                        >
                          {selectedDomainObject.durationWeeks.map((week) => (
                            <option key={week} value={week}>
                              {week} Weeks (Complete Program)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* NEW: Training Mode & Price Calculation Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-500">Training Node Mode</label>
                        <select
                          value={formData.trainingMode}
                          onChange={(e) => setFormData({ ...formData, trainingMode: e.target.value as 'online' | 'offline' })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="online">Online Virtual Lab Mode (₹99/week)</option>
                          <option value="offline">Offline Centers Immersive Mode (₹149/week)</option>
                        </select>
                      </div>

                      <div className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-between font-mono">
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>REGULAR ADMISSION RATE:</span>
                          <span className="line-through text-slate-405">₹5,000</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-slate-600 font-medium">SUBSIDIZED RATE:</span>
                          <span className="text-emerald-600 font-bold">
                            ₹{formData.trainingMode === 'online' ? 99 : 149} <span className="text-[10px] font-normal text-slate-500">/ week</span>
                          </span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs mt-2 font-bold text-slate-800">
                          <span>TOTAL SECURE DUE:</span>
                          <span className="text-blue-600 text-sm font-extrabold">
                            ₹{formData.durationWeeks * (formData.trainingMode === 'online' ? 99 : 149)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-205 flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-blue-600 tracking-wider font-bold">ACADEMIC ALIGNMENT STATUS:</span>
                        <p className="text-xs text-slate-600 leading-normal">
                          {selectedDomainObject.targetDegrees.includes(formData.degree) ? (
                            <span className="text-emerald-600 font-bold">✔ Highly Compatible with your {formData.degree} curriculum framework.</span>
                          ) : (
                            <span className="text-amber-600 font-bold">⚡ Cross-Disciplinary validation will be initialized. Complete Phase I to lock credits.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Statement of Motivation */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-500">Statement of Internship Motivation (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Briefly describe what you aim to construct or research in this tech domain..."
                        value={formData.motivation}
                        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-450 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION TOGGLES */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 w-32 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all text-sm font-semibold cursor-pointer active:scale-95"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white transition-all text-sm font-semibold flex items-center justify-center gap-1.5 w-32 cursor-pointer active:scale-95"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const now = Date.now();
                      if (now - lastStepChangeTime < 400) return;
                      if (validateStep(3)) {
                        setLastStepChangeTime(now);
                        setCurrentStep(4);
                      }
                    }}
                    disabled={isSynthesizing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold transition-all flex items-center justify-center gap-1.5 hover:opacity-90 min-w-44 shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isSynthesizing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-white" />
                        <span>Continue to Payment</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>
        )}

        {/* STEP 4: INTERACTIVE PHONEPE SECURE PAYMENT GATEWAY INTEGRATION */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-2xl mx-auto z-10 relative">
            {/* PhonePe Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
              
              {/* PhonePe Branded Header Banner */}
              <div className="rounded-2xl bg-[#5f259f] p-4 flex items-center justify-between border border-purple-800 shadow-md">
                <div className="flex items-center gap-3">
                  {/* Custom Squeezed PhonePe Symbol */}
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center font-extrabold text-[#5f259f] text-lg italic shadow-inner select-none">
                    pe
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-white text-base leading-none">PhonePe Secure Gateway</h3>
                    <span className="text-[10px] font-mono text-purple-200 tracking-wider">SECURE INSTANT BANK SETTLEMENT // ENCRYPTED</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] bg-white/10 px-2.5 py-1 rounded text-purple-100 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>UPI DIRECT</span>
                </div>
              </div>

              {/* Checkout Bill Split Box */}
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 space-y-3 font-mono text-xs text-slate-650">
                <h4 className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest border-b border-slate-200 pb-2">
                  Unified Admission Account Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span>Authorized Candidate:</span>
                    <span className="text-slate-800 font-bold text-right">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Selected Tech Node:</span>
                    <span className="text-slate-800 font-bold text-right">{selectedDomainObject.title.split(' & ')[0]}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Duration & Mode:</span>
                    <span className="text-slate-800 font-bold capitalize text-right">{formData.durationWeeks} Weeks ({formData.trainingMode} Training)</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Admission Standard Rate:</span>
                    <span className="text-slate-400 line-through">₹5,000</span>
                  </div>
                  <div className="flex justify-between gap-4 text-emerald-600 font-semibold">
                    <span>Subsidy Waiver Apply:</span>
                    <span>-₹{5000 - formData.durationWeeks * (formData.trainingMode === 'online' ? 99 : 149)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-sm text-slate-900">
                    <span>TOTAL AMOUNT DUE:</span>
                    <span className="text-emerald-600 font-sans font-extrabold text-xl flex items-center gap-1">
                      ₹{formData.durationWeeks * (formData.trainingMode === 'online' ? 99 : 149)}
                      <button 
                        type="button" 
                        onClick={() => {
                          const val = (formData.durationWeeks * (formData.trainingMode === 'online' ? 99 : 149)).toString();
                          navigator.clipboard.writeText(val);
                          setCopyStatus('amount');
                          setTimeout(() => setCopyStatus(null), 2000);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition-colors"
                        title="Copy amount"
                      >
                        {copyStatus === 'amount' ? (
                          <span className="text-[9px] font-sans font-normal text-emerald-500">Copied!</span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                        )}
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Scanner & Verification Form (Submit Amount and UTR Only) */}
              <div className="p-6 rounded-[2.5rem] bg-[#f5f8fc] border border-slate-200/80 flex flex-col justify-center items-center shadow-xs">
                <div className="text-center space-y-5 w-full flex flex-col items-center">
                  
                  {/* Outer container replicating the image background and header */}
                  <div className="w-full max-w-[17.5rem] flex flex-col items-center space-y-4">
                    
                    {/* Brand header from Image: Circular Logo + Text */}
                    <div className="flex items-center gap-2.5 pb-1 justify-center">
                      <div className="h-10 w-10 rounded-full bg-white border border-slate-150 flex items-center justify-center shadow-xs p-1 relative overflow-hidden shrink-0">
                        {/* Invigo tech abstract logo replicating image's concentric spiral and florals */}
                        <svg className="h-7 w-7 text-sky-500" viewBox="0 0 100 100" fill="none">
                          {/* Concentric swirling orbits */}
                          <circle cx="50" cy="50" r="44" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="5 3" />
                          <circle cx="50" cy="50" r="35" stroke="#1d4ed8" strokeWidth="2" strokeDasharray="10 5" />
                          
                          {/* Geared petal system from image */}
                          <path d="M 50,50 L 50,18 A 32,32 0 0,1 82,50 Z" fill="#38bdf8" opacity="0.15" />
                          <path d="M 50,50 L 82,50 A 32,32 0 0,1 50,82 Z" fill="#0ea5e9" opacity="0.2" />
                          <path d="M 50,50 L 50,82 A 32,32 0 0,1 18,50 Z" fill="#1d4ed8" opacity="0.25" />
                          <path d="M 50,50 L 18,50 A 32,32 0 0,1 50,18 Z" fill="#1e3a8a" opacity="0.3" />
                          
                          {/* core spinner center */}
                          <circle cx="50" cy="50" r="16" fill="#ffffff" stroke="#1e40af" strokeWidth="2" />
                          <path d="M 50,40 C 55,40 59,44 59,50 C 59,56 55,60 50,60 C 45,60 41,56 41,50" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
                          <circle cx="50" cy="50" r="5" fill="#1d4ed8" />
                        </svg>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-base sm:text-lg text-slate-800 tracking-wide uppercase leading-tight font-sans">INVIGO INFOTECH</span>
                      </div>
                    </div>

                    {/* QR Code Container styled exactly like the screenshot's white ticket */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] w-full flex flex-col items-center space-y-4">
                      
                      {/* Responsive dynamic scan-ready QR code generating actual UPI deep link */}
                      <div className="p-2 bg-white rounded-2xl relative w-48 h-48 flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                        <img
                          src="/scanner.png"
                          alt="INVIGO INFOTECH scan-to-pay QR"
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Display VPA layout matching bottom part of white ticket */}
                      <div className="text-center space-y-1">
                        <span className="text-[11px] sm:text-xs text-slate-600 font-semibold tracking-wide">
                          UPI ID: <span className="text-slate-800 font-mono font-bold select-all">invigoinfotech-2@okaxis</span>
                        </span>
                      </div>

                    </div>

                    {/* Copy Helper bar visually underneath */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('invigoinfotech-2@okaxis');
                        setCopyStatus('upi');
                        setTimeout(() => setCopyStatus(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs hover:shadow-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 cursor-pointer text-[11px] font-semibold mx-auto shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                      <span>{copyStatus === 'upi' ? 'Copied VPA!' : 'Copy UPI ID'}</span>
                    </button>

                    {/* Footer text from user's image */}
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-normal text-center font-medium font-sans">
                      Scan to pay with any UPI app
                    </p>

                  </div>
                </div>
              </div>

              {/* Amount and UTR Inputs Form Block */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                
                {/* 1. Enter Amount */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                    Enter Amount Paid (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-sans font-bold text-slate-500 text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount paid"
                      value={amountPaidInput}
                      onChange={(e) => {
                        setAmountPaidInput(e.target.value);
                        setPaymentError('');
                      }}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-sans text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 font-bold"
                    />
                  </div>
                </div>

                {/* 2. Enter UTR Ref */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                    Enter 12-Digit Transaction ID / UTR No. <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="e.g. 6204266080 or UPU123456789"
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value.toUpperCase());
                        setPaymentError('');
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-sm placeholder-slate-450 uppercase tracking-widest focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-350">
                      <CheckCircle className={`h-4.5 w-4.5 ${transactionId.trim().length >= 8 ? "text-emerald-500" : "text-slate-300"}`} />
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <p className="text-[11px] font-mono font-medium text-red-500 text-left">{paymentError}</p>
                )}

                <span className="block text-[10px] text-slate-450 leading-relaxed text-left font-medium">
                  Please pay through the QR Code above first, then input the exact Amount Paid and copy & paste the 12-digit UTR Ref / Transaction ID from your UPI app receipt.
                </span>
              </div>

              {/* Secure checkout action controls */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                
                {isPaying ? (
                  <button
                    disabled
                    className="w-full py-4 bg-[#5f259f] text-white font-extrabold rounded-2xl text-xs flex justify-center items-center gap-2 animate-pulse"
                  >
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>VERIFYING COHORT ALLOCATION DATA... DO NOT REFRESH</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!transactionId.trim()) {
                        setPaymentError('Critical: Please enter your transaction ID or UTR number first.');
                        return;
                      }
                      if (transactionId.trim().length < 6) {
                        setPaymentError('UTR validation failed. Please enter a valid transaction ID.');
                        return;
                      }

                      setIsPaying(true);
                      setTimeout(() => {
                        setIsPaying(false);
                        handlePaymentComplete(transactionId.trim());
                      }, 2000);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-purple-700 via-[#5f259f] to-indigo-700 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs flex justify-center items-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-md shadow-purple-200"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Submit Payment Verification</span>
                  </button>
                )}

                {/* REQUIRED: BOLD STATEMENT AFTER SUBMIT BUTTON */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-center leading-relaxed">
                  <p className="text-[11px] sm:text-xs text-amber-800 font-bold tracking-tight">
                    wait for payment verification. it usually completed within 24hr. Contact on +91 6204266080 for Help
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={isPaying}
                  className="w-full py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs transition-all active:scale-98 cursor-pointer"
                >
                  Back to Course parameters
                </button>
              </div>

              {/* Trust Signal Seals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-150 font-mono text-[9px] text-slate-450 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>🛡 PCI-DSS Level 1</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span>🔒 256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span>⚡ Pure Bank Settlement</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span>✓ Verified Invigo Merchant</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: DELIGHTFUL ADMISSION OFFER DETAILED SLIP */}
        {currentStep === 5 && synthesizedOffer && (
          <div className="space-y-8 z-10 relative">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 border border-emerald-500 mb-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#5f259f]">
                Credentials Verified & Confirmed!
              </h2>
              <p className="text-slate-600 text-xs max-w-sm mx-auto">
                Your admission offer letter and student dashboard milestones are successfully anchored to the Invigo systems.
              </p>
            </div>

            {/* THE VISUAL OFFER LETTER BOX */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 relative overflow-hidden shadow-2xl">
              
              {/* Decorative micro grids */}
              <div className="absolute top-0 right-0 h-44 w-44 bg-slate-50 rounded-bl-[100px] border-b border-l border-slate-200 p-4 text-[9px] font-mono text-slate-400 select-none text-right">
                BLOCKCHAIN ID // H_F09X392 <br /> STATUS // VERIFIED
              </div>

              {/* Watermark logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-z-0 opacity-[0.03] pointer-events-none select-none">
                <GraduationCap className="h-80 w-80 text-blue-900" />
              </div>

              {/* Official branding block */}
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-blue-600 tracking-[3px] uppercase font-bold">Official Acceptance Memorandum</span>
                    <h3 className="font-display text-xl font-extrabold text-slate-900">INVIGO INFOTECH PRIVATE LIMITED</h3>
                    <p className="text-[10px] font-mono text-slate-500 text-left">Autonomous Innovation, Skill Validation, & Placements Node</p>
                  </div>
                  <span className="hidden sm:block text-xs font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-blue-700 font-bold">
                    CODE: {synthesizedOffer.candidateId.split('-')[2]}
                  </span>
                </div>

                {/* Candidate detail grids */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 font-mono text-xs text-slate-600">
                  <div className="space-y-2">
                    <p><span className="text-slate-400">DESIGNATED SCHOLAR:</span> <strong className="text-slate-800 uppercase">{synthesizedOffer.fullName}</strong></p>
                    <p><span className="text-slate-400">COMMUNICATION NODE:</span> <span className="text-slate-700">{synthesizedOffer.email}</span></p>
                    <p><span className="text-slate-400">ACADEMIC PATHWAY:</span> <span className="text-slate-700">{synthesizedOffer.degree} in {synthesizedOffer.fieldOfStudy}</span></p>
                    <p><span className="text-slate-400">SCHOLASTIC BASE:</span> <span className="text-slate-700">{synthesizedOffer.collegeName}</span></p>
                  </div>
                  <div className="space-y-2 sm:border-l sm:border-slate-200 sm:pl-4">
                    <p><span className="text-slate-400">SCHOLAR ID INDEX:</span> <strong className="text-blue-600 font-bold">{synthesizedOffer.candidateId}</strong></p>
                    <p><span className="text-slate-400">SELECTED MATRIX:</span> <strong className="text-blue-600 uppercase">{selectedDomainObject.title}</strong></p>
                    <p><span className="text-slate-400">PROGRAM TIMELINE:</span> <span className="text-slate-700">{synthesizedOffer.durationWeeks} Weeks Cohort</span></p>
                    <p><span className="text-slate-400">COMMENCEMENT ROTATION:</span> <span className="text-slate-700">{synthesizedOffer.startDate}</span></p>
                    <p><span className="text-slate-450">TRAINING MODE:</span> <span className="text-emerald-600 font-bold uppercase">{synthesizedOffer.trainingMode === 'online' ? 'Online Labs' : 'Offline Centers'}</span></p>
                    <p><span className="text-slate-400">PAYMENT STATUS:</span> <span className="text-slate-800 font-bold">₹{synthesizedOffer.amountPaid} Paid <span className="text-[10px] text-purple-600 font-semibold font-mono">(PhonePe UPI)</span></span></p>
                  </div>
                </div>

                {/* Acceptance Statement */}
                <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                  <p>
                    Dear <strong className="text-slate-900">{synthesizedOffer.fullName}</strong>,
                  </p>
                  <p>
                    Following an extensive diagnostic review of your scholastic credentials, we are pleased to confirm your appointment as an <strong className="text-blue-600 text-xs font-mono uppercase font-bold">Applied Research Intern</strong> in our <strong className="text-slate-800">{selectedDomainObject.title}</strong> matrix at Invigo Infotech.
                  </p>
                  <p>
                    During this <strong className="text-slate-950 font-semibold">{synthesizedOffer.durationWeeks}-week</strong> study rotation, you will be systematically guided through our rigorous three-phase curriculum, building interactive industrial repositories using <strong className="text-blue-600 text-xs font-mono font-semibold">{selectedDomainObject.toolsAndTech.join(', ')}</strong>, and submitting weekly milestone deliverables to our designated academic node directors.
                  </p>
                </div>

                {/* Curriculums outline preview inside the slip */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 font-mono text-xs">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Milestones Structure & Validation Keys</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-blue-600 text-[10px] font-extrabold block">PHASE 01: SIMULATION</span>
                      <span className="text-[10px] text-slate-550 leading-relaxed">Weeks 1-4. Focus: Logical layouts and core optimization patterns.</span>
                    </div>
                    <div className="space-y-1 p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-indigo-600 text-[10px] font-extrabold block">PHASE 02: SYNAPSE ARCH</span>
                      <span className="text-[10px] text-slate-550 leading-relaxed">Weeks 5-8. Focus: Real data connection and secure API gates.</span>
                    </div>
                    <div className="space-y-1 p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-emerald-600 text-[10px] font-extrabold block">PHASE 03: CAPSTONE</span>
                      <span className="text-[10px] text-slate-550 leading-relaxed">Weeks 9-12. Focus: Cloud compiles and live dashboard evaluation.</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-end pt-6 border-t border-slate-200">
                  <div className="space-y-1.5 font-mono">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">System Hash Code</span>
                    <p className="text-[10px] text-emerald-600 whitespace-nowrap overflow-x-hidden md:w-80 w-44">sha256:7f053de08fa1ffc90a182c0b892</p>
                  </div>
                  
                  {/* Digital Signature */}
                  <div className="text-right space-y-1">
                    <span className="text-[8px] font-mono text-slate-400 block uppercase tracking-widest">Authorized Registrar signature</span>
                    <span className="font-display italic text-lg text-slate-700 font-serif leading-none tracking-wider block">M. Krishnaswamy</span>
                    <span className="block text-[8px] font-mono text-emerald-600">REGISTRAR NODE // SECURE_SIGNED</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Redirection / Dashboard actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  alert('Your offer letter will be available for download in your dashboard once an administrator verifies your payment (typically within 24 hours).');
                }}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-slate-600 hover:text-slate-800 transition-all duration-150 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Save Acceptance Letter (PDF)</span>
              </button>

              <button
                onClick={() => setCurrentTab('nexus')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-blue-105 cursor-pointer"
              >
                <span>Navigate to My Student Deck</span>
                <ArrowRight className="h-5 w-5 text-white" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
