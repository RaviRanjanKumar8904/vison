import { ArrowRight, Sparkles, Brain, Award, ShieldCheck, Milestone, GraduationCap, Users, Code, BookOpen, User, Calendar, FileText, Trash2, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { TESTIMONIALS, INTERNSHIP_DOMAINS } from '../data';
import { EnrollmentState } from '../types';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  setSelectedCategoryFilter: (cat: string) => void;
  setSelectedDegreeFilter: (degree: string) => void;
  enrollments?: EnrollmentState[];
  onClearEnrollments?: () => void;
}

export default function HomeView({ 
  setCurrentTab, 
  setSelectedCategoryFilter, 
  setSelectedDegreeFilter,
  enrollments = [],
  onClearEnrollments
}: HomeViewProps) {
  
  const handleDegreeFocus = (degree: 'B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA') => {
    setSelectedDegreeFilter(degree);
    setSelectedCategoryFilter('All');
    setCurrentTab('internships');
  };

  const academicNodes = [
    {
      degree: 'B.Tech' as const,
      label: 'Engineering Core',
      desc: 'Heavy-duty software compile structures, embedded systems wiring, VLSI silicon layouts, cybernetics or Deep Learning models.',
      color: 'border-slate-200 text-blue-600 bg-white hover:bg-blue-50/50 hover:border-blue-300 shadow-sm rounded-[1.5rem]',
      icon: CpuIcon
    },
    {
      degree: 'Diploma' as const,
      label: 'Applied Science',
      desc: 'Rapid physical IoT integration, high-fidelity programming languages (Java/Python), web designs, and hardware schematics prototyping.',
      color: 'border-slate-200 text-emerald-600 bg-white hover:bg-emerald-50/50 hover:border-emerald-300 shadow-sm rounded-[1.5rem]',
      icon: CodeIcon
    },
    {
      degree: 'BCA' as const,
      label: 'Matrix App Systems',
      desc: 'Front-end reactive models, database schema relations, mobile program engines, and technical analytics pipelines.',
      color: 'border-slate-200 text-indigo-600 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 shadow-sm rounded-[1.5rem]',
      icon: TerminalIcon
    },
    {
      degree: 'B.Sc' as const,
      label: 'Computational Logic',
      desc: 'Scientific data mining, statistical analysis, UI wireframe designs, and strategic platform engineering frameworks.',
      color: 'border-slate-200 text-purple-600 bg-white hover:bg-purple-50/50 hover:border-purple-300 shadow-sm rounded-[1.5rem]',
      icon: LabIcon
    },
    {
      degree: 'MBA' as const,
      label: 'Corporate Strategy',
      desc: 'Strategic finance auditing, FinTech venture capital setups, growth funnel designs, and behavioral marketing strategies.',
      color: 'border-slate-200 text-amber-600 bg-white hover:bg-amber-50/50 hover:border-amber-300 shadow-sm rounded-[1.5rem]',
      icon: BusinessIcon
    }
  ];

  return (
    <div className="relative overflow-hidden bg-transparent text-slate-800">
      {/* Background radial spotlights */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-[40%] left-[20%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute top-[30%] -right-[20%] h-[700px] w-[700px] rounded-full bg-purple-500/5 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-8 max-w-4xl mx-auto py-12 md:py-24">
          
          {/* Headline Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-550/5 px-4 py-1.5 text-xs font-semibold text-blue-600 tracking-wide"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>INTERNSHIP BATCH 2026 GENERAL ACCESS INITIATED</span>
          </motion.div>

          {/* Majestic Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-slate-900"
          >
            ARCHITECT YOUR FUTURE. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 bg-clip-text text-transparent">
              ACCELERATE YOUR DESTINY.
            </span>
          </motion.h1>

          <p className="text-slate-650 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto">
            Welcome to <strong className="text-blue-600 font-bold">Invigo Infotech</strong>, the elite offline & virtual internship sandbox. Build, test, and host practical industry-accredited systems engineered for ambitious scholars.
          </p>

          {/* Clickable CTA Container */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <button
              onClick={() => setCurrentTab('internships')}
              className="px-6 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 shadow-md shadow-blue-500/10 transition-all flex items-center gap-2 group hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Explore 16+ Domains</span>
              <ArrowRight className="h-5 w-5 text-white transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            
            <button
              onClick={() => setCurrentTab('enroll')}
              className="px-6 py-3.5 rounded-2xl font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 transition-all flex items-center gap-2 group hover:-translate-y-0.5 cursor-pointer shadow-sm"
            >
              <span>Enroll Portal</span>
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </button>
          </div>
        </div>

        {/* STUDENT FRIENDLY NAVIGATOR HUB */}
        <div className="my-8 relative z-20">
          {enrollments.length > 0 ? (
            /* Enrolled Flow / Active Shortcuts */
            <div className="rounded-[2.2rem] border border-emerald-100 bg-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-3 text-[9px] font-mono font-bold text-emerald-700 select-none bg-emerald-50 rounded-bl-2xl border-l border-b border-emerald-100 uppercase tracking-widest">
                Active Student Status
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Welcome back, {enrollments[0].fullName}! 🎓</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                    We've set up your student learning space!
                  </h2>
                  <p className="text-slate-600 text-xs max-w-2xl leading-relaxed">
                    You are currently registered in the <strong className="text-blue-600 uppercase">{INTERNSHIP_DOMAINS.find(d => d.id === enrollments[0].domainId)?.title || enrollments[0].domainId.replace('_', ' ')}</strong> cohort. 
                    Manage your progress, upload projects, and secure your verifiable certificate below:
                  </p>
                </div>
                
                {onClearEnrollments && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear your current enrollment to try a different domain? This will reset your progress.")) {
                        onClearEnrollments();
                      }
                    }}
                    className="self-start md:self-center px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all flex items-center gap-1.5 bg-white cursor-pointer shadow-xs"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                    <span>Reset & Choose Different Domain</span>
                  </button>
                )}
              </div>

              {/* Grid of Friendly Quick Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setCurrentTab('nexus')}
                  className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-400/50 hover:bg-white hover:shadow-md transition-all flex items-start gap-4 text-left group cursor-pointer"
                >
                  <div className="h-10 w-10 shrink-0 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold font-mono shadow-sm">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 group-hover:text-blue-600 transition-colors uppercase tracking-wider">Weekly Project Uploads</h4>
                    <p className="text-[11px] text-slate-550 mt-1 leading-relaxed">
                      Upload links, submit task descriptions, and check off learning units in your student dash.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('nexus')}
                  className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-400/50 hover:bg-white hover:shadow-md transition-all flex items-start gap-4 text-left group cursor-pointer"
                >
                  <div className="h-10 w-10 shrink-0 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold font-mono shadow-sm">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">Book 1-on-1 Mentor Support</h4>
                    <p className="text-[11px] text-slate-550 mt-1 leading-relaxed">
                      Schedule video reviews with senior engineers to troubleshoot and audit your code.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('nexus')}
                  className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-emerald-400/50 hover:bg-white hover:shadow-md transition-all flex items-start gap-4 text-left group cursor-pointer"
                >
                  <div className="h-10 w-10 shrink-0 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold font-mono shadow-sm">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">Verifiable Credentials</h4>
                    <p className="text-[11px] text-slate-550 mt-1 leading-relaxed">
                      Complete your final compiler phase to unlock your blockchain-anchored, validated certificate.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Unenrolled Onboarding Guide */
            <div className="rounded-[2.2rem] border border-slate-205 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">How to secure and download your certificate in 3 steps:</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">We've simplified the entire process so you always know what to do next.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2.5 relative p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all duration-150">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 border border-blue-105 text-blue-600 text-xs font-bold font-mono">1</span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Browse Internships</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Check out all 16 domains (Web development, Machine Learning, etc.). Filter by your exact degree path.
                  </p>
                  <button 
                    onClick={() => setCurrentTab('internships')}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 group mt-2 cursor-pointer"
                  >
                    <span>Choose a Domain</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="space-y-2.5 relative p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all duration-150">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-105 text-indigo-600 text-xs font-bold font-mono">2</span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quick Enrolment</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Use our easy enrollment form. Your personal digital Offer/Admission slip is generated instantly.
                  </p>
                  <button 
                    onClick={() => setCurrentTab('enroll')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 group mt-2 cursor-pointer"
                  >
                    <span>Open Wizard Form</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="space-y-2.5 relative p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:border-emerald-200 hover:bg-white hover:shadow-sm transition-all duration-150">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-105 text-emerald-600 text-xs font-bold font-mono">3</span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Student Space</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Check off weekly learning units, upload your custom work descriptions, book guidance, and generate your certificate.
                  </p>
                  <button 
                    onClick={() => setCurrentTab('nexus')}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 group mt-2 cursor-pointer"
                  >
                    <span>View Student Portal</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* METRIC TICKER BLOCKS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-slate-200 bg-white py-6 my-8 rounded-[1.8rem] shadow-sm">
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0">
            <span className="block font-display text-2xl md:text-4xl font-extrabold text-blue-600">16+</span>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">Dynamic Domains</span>
          </div>
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0 md:block">
            <span className="block font-display text-2xl md:text-4xl font-extrabold text-emerald-600">15,000+</span>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">Quantum Scholars</span>
          </div>
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0">
            <span className="block font-display text-2xl md:text-4xl font-extrabold text-indigo-600">120+</span>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">University Alliances</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block font-display text-2xl md:text-4xl font-extrabold text-purple-600">98.4%</span>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">Placement Vector</span>
          </div>
        </div>

        {/* DEGREE ACADEMIC NEXUS (IMPORTANT SPECIFIC PATHWAYS) */}
        <div className="py-16 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900">The Academic Path Matrix</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Select your academic alignment below to filter internships directly configured for your specific educational constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {academicNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.degree}
                  onClick={() => handleDegreeFocus(node.degree)}
                  className={`cursor-pointer border p-5 transition-all duration-350 relative overflow-hidden group flex flex-col justify-between h-72 ${node.color}`}
                >
                  <div className="absolute top-0 right-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-slate-100 group-hover:scale-130 transition-transform duration-300 pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-150 shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest block uppercase text-slate-400">Degree Focus</span>
                      <h3 className="text-xl font-extrabold font-display text-slate-900">{node.degree}</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">{node.label}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {node.desc}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform mt-2">
                    <span>Initialize Hub</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CORE VALUES / THE CORE MATRIX */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-slate-150">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-750">
              <Milestone className="h-4 w-4 text-indigo-650" />
              <span>THE INVIGO BLUEPRINT</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight text-slate-900">
              A Quantum Leap from <br />
              Traditional Learning.
            </h2>
            <p className="text-slate-650 text-sm leading-relaxed">
              Durable learning is built through actual construction. At Invigo Infotech, we have replaced textbook review loops with highly kinetic virtual/on-site project structures, guided by live subject-matter experts.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600 border border-blue-105">
                  <span className="text-xs font-bold font-mono">01</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800">Cybernetic Simulation Models</h4>
                  <p className="text-[11px] text-slate-600">Engage in 3 distinct program phases—from system initialization up to capstone compile.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-105">
                  <span className="text-xs font-bold font-mono">02</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800">Personal Synapse Counsel</h4>
                  <p className="text-[11px] text-slate-600">Direct feedback logs and architectural review sessions with qualified engineers.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600 border border-emerald-105">
                  <span className="text-xs font-bold font-mono">03</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800">Verifiable Block Credentials</h4>
                  <p className="text-[11px] text-slate-600">Certificates compiled in unique blockchain addresses with verifiable signature matrices.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Bento Graphic */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4 shadow-sm">
              <Brain className="h-8 w-8 text-blue-600" />
              <div className="space-y-2">
                <h3 className="font-display font-bold text-base text-slate-805">Real-World Sandbox</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Avoid sterile mock code. Integrate sensory hardware ESP8266 units, compile Solidity contracts, and deploy AWS DevOps monitoring nodes.
                </p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4 shadow-sm">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="space-y-2">
                <h3 className="font-display font-bold text-base text-slate-805">Academic Alignment</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Specially coded curriculum pathways mapped directly onto college credits for B.Tech, Diploma, BCA, B.Sc, and MBA degrees.
                </p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <div className="space-y-2">
                <h3 className="font-display font-bold text-base text-slate-850">Automated Verification</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your admission letter, candidate profile, score cards, and graduate certificates are stored cryptographically for secure sharing.
                </p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-indigo-600 font-bold">STAGE // ADM_SYSTEM</div>
              <div className="space-y-4 pt-4">
                <span className="inline-block px-2.5 py-1 text-[8px] font-mono bg-blue-600 text-white font-extrabold rounded-full uppercase tracking-wider">LIVE PORTAL</span>
                <p className="font-display text-lg font-bold text-slate-900 leading-tight">
                  Instant Synthesis of Offer Letter
                </p>
                <p className="text-[11px] text-slate-600">Apply, check your diagnostic criteria, and compile an admission slip in 5 seconds.</p>
              </div>
              <button 
                onClick={() => setCurrentTab('enroll')}
                className="mt-6 w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white border border-transparent font-semibold text-xs transition-all duration-200 text-center uppercase tracking-widest shadow-sm hover:shadow-md cursor-pointer"
              >
                Launch Enrollment Matrix
              </button>
            </div>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="py-16 border-t border-slate-150 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-750">
              <Users className="h-4 w-4 text-emerald-650" />
              <span>COMMUNICATION LOGS // SCHOLAR VERDICTS</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900">Validated Scholar Success</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Read real logs from students who completed structural study cohorts and transitioned to key industrial nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((test, index) => (
              <div key={index} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5 hover:border-blue-300 hover:shadow-md transition-all duration-250 shadow-sm">
                <p className="text-xs text-slate-650 italic leading-relaxed">
                  "{test.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={test.avatar} alt={test.name} referrerPolicy="no-referrer" className="h-10 w-10 rounded-full border border-slate-200 bg-slate-50" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">{test.name}</h4>
                    <p className="text-[10px] text-slate-550 font-mono tracking-wider">{test.degree}</p>
                    <p className="text-[10px] text-blue-600 font-bold font-sans mt-0.5">{test.domain}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Pseudo custom inline icon builders to prevent extra library loads and maintain unique design
function CpuIcon(props: any) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  );
}

function CodeIcon(props: any) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function TerminalIcon(props: any) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LabIcon(props: any) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function BusinessIcon(props: any) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
