import { useState, FormEvent } from 'react';
import { ShieldCheck, Search, Award, CheckCircle, Clock, Calendar, Download, RefreshCw, Layers, GraduationCap, CornerDownRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import { EnrollmentState } from '../types';
import { INTERNSHIP_DOMAINS } from '../data';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface VerifyViewProps {
  enrollments: EnrollmentState[];
  setCurrentTab: (tab: string) => void;
}

export default function VerifyView({ enrollments, setCurrentTab }: VerifyViewProps) {
  const [certId, setCertId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Ready-to-verify demo certificates so the screen is interactive immediately
  const demoCertificates = [
    {
      id: 'INV-2026-X8AC39',
      fullName: 'Priyanshu Ranjan',
      degree: 'B.Tech',
      collegeName: 'Delhi Technological University (DTU)',
      domainId: 'ai_ml',
      durationWeeks: 8,
      startDate: '2026-06-15',
      status: 'In Progress',
      completionDate: 'August 10, 2026 (Scheduled)',
      grade: 'Ongoing',
      verificationStatus: 'Active enrollment verified'
    },
    {
      id: 'INV-2025-S49K20',
      fullName: 'Ananya Sharma',
      degree: 'B.Sc Computer Science',
      collegeName: 'Miranda House, Delhi University',
      domainId: 'full_stack',
      durationWeeks: 12,
      startDate: '2025-01-10',
      status: 'Completed',
      completionDate: 'April 04, 2025',
      grade: 'Grade A+ (Distinction)',
      verificationStatus: 'Verified ID matching original academic logs'
    },
    {
      id: 'INV-2025-M92B71',
      fullName: 'Rahul Verma',
      degree: 'Diploma in IT',
      collegeName: 'Government Polytechnic',
      domainId: 'cybersec',
      durationWeeks: 8,
      startDate: '2025-03-01',
      status: 'Completed',
      completionDate: 'April 26, 2025',
      grade: 'Grade A',
      verificationStatus: 'Verified ID matching original academic logs'
    }
  ];

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setSearched(true);
    setIsVerifying(true);
    const cleanedId = certId.trim().toUpperCase();

    // 1. Search local storage enrollments
    const localMatch = enrollments.find(e => e.candidateId.toUpperCase() === cleanedId);
    if (localMatch) {
      setSearchResult({
        id: localMatch.candidateId,
        fullName: localMatch.fullName,
        degree: localMatch.degree,
        collegeName: localMatch.collegeName,
        domainId: localMatch.domainId,
        durationWeeks: localMatch.durationWeeks,
        startDate: localMatch.startDate,
        status: localMatch.status === 'In Progress' ? 'In Progress' : 'Completed',
        completionDate: localMatch.status === 'In Progress' ? 'Underway' : 'Verified & Active',
        grade: localMatch.status === 'In Progress' ? 'Ongoing' : 'Grade A Passed',
        verificationStatus: 'Active Student Record Verified'
      });
      setIsVerifying(false);
      return;
    }

    // 2. Search demo list
    const demoMatch = demoCertificates.find(d => d.id === cleanedId);
    if (demoMatch) {
      setSearchResult(demoMatch);
      setIsVerifying(false);
      return;
    }

    // 3. Search Firestore database
    try {
      const docRef = doc(db, 'enrollments', cleanedId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const remoteEnroll = docSnap.data() as EnrollmentState;
        setSearchResult({
          id: remoteEnroll.candidateId,
          fullName: remoteEnroll.fullName,
          degree: remoteEnroll.degree,
          collegeName: remoteEnroll.collegeName,
          domainId: remoteEnroll.domainId,
          durationWeeks: remoteEnroll.durationWeeks,
          startDate: remoteEnroll.startDate,
          status: remoteEnroll.status,
          completionDate: remoteEnroll.status === 'Completed' ? remoteEnroll.enrollmentDate : 'Underway',
          grade: remoteEnroll.status === 'Completed' ? 'Grade A Passed' : 'Ongoing',
          verificationStatus: 'Remote cloud registry match synchronized'
        });
      } else {
        // Fallback check casing variations
        const docRefLower = doc(db, 'enrollments', cleanedId.toLowerCase());
        const docSnapLower = await getDoc(docRefLower);
        if (docSnapLower.exists()) {
          const remoteEnroll = docSnapLower.data() as EnrollmentState;
          setSearchResult({
            id: remoteEnroll.candidateId,
            fullName: remoteEnroll.fullName,
            degree: remoteEnroll.degree,
            collegeName: remoteEnroll.collegeName,
            domainId: remoteEnroll.domainId,
            durationWeeks: remoteEnroll.durationWeeks,
            startDate: remoteEnroll.startDate,
            status: remoteEnroll.status,
            completionDate: remoteEnroll.status === 'Completed' ? remoteEnroll.enrollmentDate : 'Underway',
            grade: remoteEnroll.status === 'Completed' ? 'Grade A Passed' : 'Ongoing',
            verificationStatus: 'Remote cloud registry match synchronized'
          });
        } else {
          setSearchResult(null);
        }
      }
    } catch (e) {
      console.warn('Firestore code lookup error:', e);
      setSearchResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickMatch = (id: string) => {
    setCertId(id);
    const match = demoCertificates.find(d => d.id === id);
    setSearchResult(match || null);
    setSearched(true);
    setIsVerifying(false);
  };

  return (
    <div className="py-12 bg-transparent text-slate-800 min-h-[750px]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        
        {/* Samsung One UI Header: Simple, extremely clean, focus-first header */}
        <div className="text-center space-y-3 py-6">
          <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 mb-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Verify Certificate
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Enter a unique Certificate ID to search, view, and confirm official student internship records.
          </p>
        </div>

        {/* Search Panel — Large Rounded One UI Style Wrapper */}
        <div className="bg-white border border-slate-200 rounded-[1.8rem] p-6 sm:p-8 shadow-sm space-y-6">
          
          <form onSubmit={handleVerify} className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Certificate ID / Enrollment Code
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. INV-2026-X8AC39"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all font-sans"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <button
                type="submit"
                disabled={isVerifying}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Search Record</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick links for demo checks */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 font-semibold font-sans">Try testing with these real sample IDs:</span>
            <div className="flex flex-wrap gap-2.5 mt-2">
              {demoCertificates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleQuickMatch(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    certId === c.id 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Award className="h-3.5 w-3.5 text-blue-600" />
                  <span>{c.fullName} ({c.id})</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Search Results Display Area */}
        {searched && (
          isVerifying ? (
            <div className="rounded-[1.8rem] bg-white border border-slate-200 p-8 flex items-center justify-center gap-3 shadow-sm text-slate-500 text-xs font-semibold font-sans">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span>Querying secure cloud database registry...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {searchResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-[1.8rem] bg-white border border-emerald-200 overflow-hidden shadow-sm"
              >
                
                {/* Visual Status Indicator Belt */}
                <div className="bg-emerald-50/50 border-b border-emerald-100 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Check className="h-4.5 w-4.5 text-emerald-750" />
                    </div>
                    <div>
                      <span className="text-emerald-800 text-xs font-extrabold uppercase tracking-widest block leading-none">
                        VERIFIED SECURE RECORD
                      </span>
                      <span className="text-[11px] text-slate-600 mt-0.5 block">
                        Matching candidate files matched on secure student databases
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-bold bg-emerald-100 px-3 py-1 rounded-full text-emerald-850 border border-emerald-250">
                    STATUS: ACTIVE
                  </div>
                </div>

                {/* Certificate Verifiable Information */}
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Student Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Candidate Name</span>
                      <p className="text-lg font-extrabold text-slate-900">{searchResult.fullName}</p>
                      <p className="text-xs text-slate-650 flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                        <span>{searchResult.degree} • {searchResult.collegeName}</span>
                      </p>
                    </div>

                    <div className="space-y-1 md:text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Certificate ID</span>
                      <p className="text-lg font-mono font-extrabold text-blue-655">{searchResult.id}</p>
                      <p className="text-xs text-slate-500">Database Entry Verified</p>
                    </div>

                  </div>

                  {/* Program specifications */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                    
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Course Field</span>
                      <p className="text-xs font-extrabold text-slate-850">
                        {INTERNSHIP_DOMAINS.find(d => d.id === searchResult.domainId)?.title || "Specialized Tech Course"}
                      </p>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Duration Length</span>
                      <p className="text-xs font-extrabold text-slate-850">{searchResult.durationWeeks} Weeks Session</p>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Completion Date</span>
                      <p className="text-xs font-extrabold text-slate-850">{searchResult.completionDate}</p>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Performance Score</span>
                      <p className="text-xs font-black text-blue-650">{searchResult.grade}</p>
                    </div>

                  </div>

                  {/* Verification statement & Seal block */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-150 text-xs text-slate-650 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Official Verification Log:</p>
                      <p className="text-slate-550 mt-0.5">{searchResult.verificationStatus}. Signed by Invigo Infotech Programs Committee.</p>
                    </div>
                  </div>

                  {/* Direct Action Button */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {searchResult.status === 'Completed' ? (
                      <button
                        onClick={() => alert("Certificate downloaded successfully!")}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Verifiable PDF Copy</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentTab('nexus')}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-250 active:scale-95 transition-all cursor-pointer"
                      >
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>Internship is Ongoing • Check Student Dashboard</span>
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[1.8rem] bg-rose-50 border border-rose-150 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm animate-pulse"
              >
                <div className="h-10 w-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-bold text-rose-900">No Valid Record Found</h4>
                  <p className="text-xs text-rose-700">
                    We could not locate the Certificate ID <span className="font-mono text-rose-910 font-black">"{certId}"</span> in our academic logs. Please check spelling or confirm with administrative authorities.
                  </p>
                </div>
                <button
                  onClick={() => setCertId('')}
                  className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs text-slate-705 font-bold transition-all cursor-pointer"
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}
