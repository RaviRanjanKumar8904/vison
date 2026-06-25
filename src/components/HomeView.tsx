import { ArrowRight, Sparkles, Brain, Award, ShieldCheck, Milestone, GraduationCap, Users, Code, BookOpen, User, Calendar, FileText, Trash2, HelpCircle, Phone, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { TESTIMONIALS, INTERNSHIP_DOMAINS } from '../data';
import { EnrollmentState } from '../types';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  setSelectedCategoryFilter: (cat: string) => void;
  setSelectedDegreeFilter: (degree: string) => void;
  enrollments?: EnrollmentState[];
  onClearEnrollments?: () => void;
  onSelectDomainForEnrollment?: (domainId: string) => void;
}

export default function HomeView({ 
  setCurrentTab, 
  setSelectedCategoryFilter, 
  setSelectedDegreeFilter,
  enrollments = [],
  onClearEnrollments,
  onSelectDomainForEnrollment
}: HomeViewProps) {
  
  const handleDegreeFocus = (degree: 'B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA' | 'BA' | 'B.Com') => {
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
    },
    {
      degree: 'BA' as const,
      label: 'Arts & Humanities',
      desc: 'Creative design, content strategy, human resources management, and digital marketing.',
      color: 'border-slate-200 text-pink-600 bg-white hover:bg-pink-50/50 hover:border-pink-300 shadow-sm rounded-[1.5rem]',
      icon: CodeIcon
    },
    {
      degree: 'B.Com' as const,
      label: 'Commerce & Finance',
      desc: 'Financial modeling, accounting software integrations, business analytics, and e-commerce setups.',
      color: 'border-slate-200 text-indigo-600 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 shadow-sm rounded-[1.5rem]',
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
        <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto py-8 sm:py-12 md:py-24">
          
          {/* Coupon Offer Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mx-auto"
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-1 rounded-full shadow-lg shadow-purple-500/25 border border-purple-400/30">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                Special Offer
              </span>
              <span className="text-white text-xs sm:text-sm font-semibold pr-4">
                New users use code <span className="font-mono font-extrabold bg-white text-purple-700 px-2 py-0.5 rounded shadow-sm">IAMNEW</span> to get <span className="text-yellow-300 font-bold">33% OFF!</span>
              </span>
            </div>
          </motion.div>

          {/* Headline Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-blue-200 bg-blue-550/5 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-blue-600 tracking-wide"
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            <span>INTERNSHIP BATCH 2026 GENERAL ACCESS INITIATED</span>
          </motion.div>

          {/* Majestic Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-slate-900 px-2"
          >
            ARCHITECT YOUR FUTURE. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 bg-clip-text text-transparent">
              ACCELERATE YOUR DESTINY.
            </span>
          </motion.h1>

          <p className="text-slate-600 text-xs sm:text-sm md:text-lg leading-relaxed max-w-2xl mx-auto px-4">
            Welcome to <strong className="text-blue-600 font-bold">Invigo Infotech</strong>, the elite offline & virtual internship sandbox. Build, test, and host practical industry-accredited systems engineered for ambitious scholars.
          </p>

          {/* Clickable CTA Container */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4">
            <button
              onClick={() => setCurrentTab('internships')}
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Explore 30+ Domains</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white transition-transform duration-200 group-hover:translate-x-1" />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 sm:gap-4 border border-slate-200 bg-white py-6 sm:py-8 my-6 sm:my-8 rounded-[1.5rem] sm:rounded-[1.8rem] shadow-sm">
          <div className="text-center space-y-1 border-r border-slate-100 px-2">
            <span className="block font-display text-3xl md:text-4xl font-extrabold text-blue-600">30+</span>
            <span className="block text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 tracking-wider">Dynamic Domains</span>
          </div>
          <div className="text-center space-y-1 md:border-r border-slate-100 px-2">
            <span className="block font-display text-3xl md:text-4xl font-extrabold text-emerald-600">15,000+</span>
            <span className="block text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 tracking-wider">Quantum Scholars</span>
          </div>
          <div className="text-center space-y-1 border-r border-slate-100 px-2 mt-2 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 col-span-1">
            <span className="block font-display text-3xl md:text-4xl font-extrabold text-indigo-600">120+</span>
            <span className="block text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 tracking-wider">University Alliances</span>
          </div>
          <div className="text-center space-y-1 px-2 mt-2 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100 col-span-1">
            <span className="block font-display text-3xl md:text-4xl font-extrabold text-purple-600">98.4%</span>
            <span className="block text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 tracking-wider">Placement Vector</span>
          </div>
        </div>

        {/* TOP 5 SELLING COURSES */}
        <div className="py-12 sm:py-16">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 px-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2 sm:gap-3">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 fill-amber-500" />
              Top Selling Courses
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 fill-amber-500" />
            </h2>
            <p className="text-slate-600 text-[11px] sm:text-base">The most popular, highly-rated offline and virtual internship programs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {INTERNSHIP_DOMAINS.slice(0, 5).map((domain, idx) => (
                <div key={domain.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col group h-full sm:h-72 min-h-[16rem] cursor-pointer" onClick={() => onSelectDomainForEnrollment ? onSelectDomainForEnrollment(domain.id) : setCurrentTab('enroll')}>
                  
                  {/* Domain Image Banner */}
                  <div className="relative h-24 sm:h-32 overflow-hidden shrink-0">
                    {domain.imageUrl ? (
                      <img 
                        src={domain.imageUrl} 
                        alt={domain.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${domain.gradient} opacity-80`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 bg-amber-400 text-amber-950 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                      <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> BESTSELLER
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-[9px] sm:text-[10px] font-bold font-mono px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-500 rounded">#{idx + 1}</span>
                      </div>
                      <h3 className="font-display font-extrabold text-slate-800 text-sm sm:text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{domain.title}</h3>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 block mb-1">Target Audience</span>
                      <div className="flex gap-1 flex-wrap">
                        {domain.targetDegrees.slice(0, 2).map((deg) => (
                          <span key={deg} className="px-1 sm:px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[8px] sm:text-[9px] font-bold">{deg}</span>
                        ))}
                        {domain.targetDegrees.length > 2 && <span className="px-1 sm:px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] sm:text-[9px] font-bold">+{domain.targetDegrees.length - 2}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-6 sm:mt-8 text-center">
            <button onClick={() => setCurrentTab('internships')} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-6 py-3 rounded-xl sm:bg-transparent sm:p-0">
              View all {INTERNSHIP_DOMAINS.length} courses <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* DEGREE ACADEMIC NEXUS (IMPORTANT SPECIFIC PATHWAYS) */}
        <div className="py-12 sm:py-16 space-y-8 sm:space-y-12 border-t border-slate-200">
          {/* COLLABORATION BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 mb-8 max-w-2xl mx-auto flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform"
          >
            <Phone className="w-4 h-4 text-emerald-100" />
            <span>Contact on <a href="tel:+916204266080" className="underline decoration-emerald-200 underline-offset-2 mx-1 text-white font-extrabold">+91 6204266080</a> for Collaboration, Special offer and Discount Coupon code.</span>
          </motion.div>

          <div className="text-center space-y-3 px-2">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900">The Academic Path Matrix</h2>
            <p className="text-slate-600 text-[11px] sm:text-sm max-w-xl mx-auto">
              Select your academic alignment below to filter internships directly configured for your specific educational constraints.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            {academicNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.degree}
                  onClick={() => handleDegreeFocus(node.degree)}
                  className={`cursor-pointer border p-3.5 sm:p-5 transition-all duration-350 relative overflow-hidden group flex flex-col justify-between h-full sm:h-72 ${node.color}`}
                >
                  <div className="absolute top-0 right-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-slate-100 group-hover:scale-130 transition-transform duration-300 pointer-events-none" />
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <span className="text-[8px] sm:text-[10px] font-bold tracking-widest block uppercase text-slate-400">Degree Focus</span>
                      <h3 className="text-lg sm:text-xl font-extrabold font-display text-slate-900">{node.degree}</h3>
                      <p className="text-slate-500 text-[8px] sm:text-[10px] uppercase font-mono tracking-wider line-clamp-1 sm:line-clamp-none">{node.label}</p>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed border-t border-slate-100 pt-2 sm:pt-3 mt-3 sm:mt-0 line-clamp-4 sm:line-clamp-none">
                    {node.desc}
                  </p>

                  <div className="pt-2 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-slate-800 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform mt-2">
                    <span>Initialize Hub</span>
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* TESTIMONIALS */}
        <div className="py-16 border-t border-slate-200 space-y-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TESTIMONIALS.map((test, index) => (
              <div key={index} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-5 hover:border-blue-300 hover:shadow-md transition-all duration-250 shadow-sm">
                <p className="text-[11px] sm:text-xs text-slate-600 italic leading-relaxed">
                  "{test.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={test.avatar} alt={test.name} referrerPolicy="no-referrer" className="h-10 w-10 rounded-full border border-slate-200 bg-slate-50" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">{test.name}</h4>
                    <p className="text-[9px] sm:text-[10px] text-slate-550 font-mono tracking-wider">{test.degree}</p>
                    <p className="text-[9px] sm:text-[10px] text-blue-600 font-bold font-sans mt-0.5">{test.domain}</p>
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
