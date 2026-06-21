import { useState } from 'react';
import { 
  Search, Filter, Brain, CodeXml, ShieldAlert, BarChart4, Cpu, 
  Smartphone, Radio, Blocks, Sparkles, Wrench, Layers, Settings, 
  DollarSign, TrendingUp, Gamepad2, Grid, GraduationCap, Clock, 
  BookOpen, AlignLeft, CheckCircle, ArrowRight, X 
} from 'lucide-react';
import { INTERNSHIP_DOMAINS } from '../data';
import { InternshipDomain } from '../types';

interface InternshipsViewProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  selectedDegreeFilter: string;
  setSelectedDegreeFilter: (degree: string) => void;
  onSelectDomainForEnrollment: (domainId: string) => void;
}

// Icon mapper for dynamic matching of string values from data static models
const iconMap: Record<string, any> = {
  Brain, CodeXml, ShieldAlert, BarChart4, Cpu, Smartphone,
  Radio, Blocks, Sparkles, Wrench, Layers, Settings,
  DollarSign, TrendingUp, Gamepad2, Grid
};

export default function InternshipsView({
  setCurrentTab,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  selectedDegreeFilter,
  setSelectedDegreeFilter,
  onSelectDomainForEnrollment
}: InternshipsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<InternshipDomain | null>(null);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');

  // Filter lists
  const categories = ['All', 'Tech', 'Hardware', 'Management', 'Design'];
  const degrees = ['All', 'B.Tech', 'Diploma', 'BCA', 'B.Sc', 'MBA', 'BA', 'B.Com'];
  const branches = ['All', 'Electrical', 'ECE', 'CSE', 'Mech', 'Civil', 'Robotics', 'Mechatronics', 'IT'];

  // Analytical computation mapping onto state variables
  const filteredDomains = INTERNSHIP_DOMAINS.filter((domain) => {
    const matchesSearch = 
      domain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      domain.toolsAndTech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategoryFilter === 'All' || domain.category === selectedCategoryFilter;

    const matchesDegree = 
      selectedDegreeFilter === 'All' || domain.targetDegrees.includes(selectedDegreeFilter as any);

    const matchesBranch = 
      selectedBranchFilter === 'All' || 
      (domain.targetBranches && domain.targetBranches.some(b => b.toLowerCase().includes(selectedBranchFilter.toLowerCase())));

    return matchesSearch && matchesCategory && matchesDegree && matchesBranch;
  });

  const handleEnrollClick = (domainId: string) => {
    onSelectDomainForEnrollment(domainId);
    setSelectedDomain(null);
    setCurrentTab('enroll');
  };

  return (
    <div className="relative overflow-hidden bg-transparent text-slate-800 py-12">
      
      {/* Structural backgrounds */}
      <div className="absolute top-0 right-1/4 h-[700px] w-[700px] rounded-full bg-blue-100/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-indigo-100/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 font-sans">
            <Grid className="h-4 w-4 text-sky-600" />
            <span>EXAMINE 16 INTERACTIVE MODULES</span>
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            The Internship Core Database
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Explore 16+ highly specialized study cohorts fully configured with industry tools, progressive phases, and certified credentials.
          </p>
        </div>

        {/* PROMINENT SCHOLARSHIP PRICING BOARD ABOVE ALL COURSES */}
        <div className="p-6 md:p-8 rounded-[1.8rem] border border-blue-200 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-widest font-sans">
                ⚡ Limited-Time Admission Subsidy Loaded
              </span>
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span>Unified Academic Scholarship:</span>
                <span className="text-slate-400 line-through font-mono font-normal">₹5,000</span>
                <span className="text-emerald-700 font-mono">₹99 onwards!</span>
              </h2>
              <p className="text-xs text-slate-600 max-w-xl">
                Invigo academic boards have waived the structural cost of all 16 domains! Lock in your verified node seat instantly. Pay only for the cohort period you choose with our 99 learning matrix:
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 font-mono">
              <div className="p-4 rounded-2xl bg-white border border-slate-205 text-center space-y-1 min-w-32 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Online Mode</span>
                <p className="text-xl font-extrabold text-blue-600">₹99 <span className="text-xs font-normal text-slate-500">/ wk</span></p>
                <span className="text-[9px] text-emerald-650 font-sans block font-bold">Save 98% off ₹5,000</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-205 text-center space-y-1 min-w-32 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Offline Mode</span>
                <p className="text-xl font-extrabold text-indigo-600">₹149 <span className="text-xs font-normal text-slate-500">/ wk</span></p>
                <span className="text-[9px] text-emerald-650 font-sans block font-bold">Save 97% off ₹5,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTROLS (SEARCH & FILTERS) */}
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
          
          <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between">
            {/* Search Frame */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools, skills (e.g. PyTorch, Spring, Solidity)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-905 text-xs sm:text-sm placeholder-slate-450 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-650/30 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Total Indicator */}
            <div className="flex items-center justify-between lg:justify-end px-2 font-mono text-xs text-slate-500 gap-2 shrink-0">
              <span>Matching Coordinates:</span>
              <span className="bg-slate-50 px-3 py-1 rounded-full text-blue-600 font-bold border border-slate-200">
                {filteredDomains.length} / {INTERNSHIP_DOMAINS.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Category Node filters */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Sector Alignments</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? 'border-blue-600 text-blue-750 bg-blue-50/50 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'All' ? 'All Sectors' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Credential alignment filters */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Academic Eligibility Filtering</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {degrees.map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setSelectedDegreeFilter(deg)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                      selectedDegreeFilter === deg
                        ? 'border-indigo-600 text-indigo-750 bg-indigo-50/50 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {deg === 'All' ? 'All Degrees' : deg}
                  </button>
                ))}
              </div>
              {(selectedDegreeFilter === 'B.Tech' || selectedDegreeFilter === 'Diploma') && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <Layers className="h-4 w-4 text-emerald-500" />
                    <span>Specialization Branches</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {branches.map((branch) => (
                      <button
                        key={branch}
                        onClick={() => setSelectedBranchFilter(branch)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                          selectedBranchFilter === branch
                            ? 'border-emerald-600 text-emerald-750 bg-emerald-50/50 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {branch === 'All' ? 'All Branches' : branch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {filteredDomains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDomains.map((domain) => {
              const DynamicIcon = iconMap[domain.iconName] || SmartComponentsLoader;
              return (
                <div
                  key={domain.id}
                  className="rounded-[1.8rem] border border-slate-200 bg-white overflow-hidden relative group hover:border-blue-300 hover:shadow-lg flex flex-col justify-between h-[520px] transition-all duration-300 card-hover"
                >
                  {/* Domain Image Banner */}
                  <div className="relative h-40 overflow-hidden">
                    {domain.imageUrl ? (
                      <img 
                        src={domain.imageUrl} 
                        alt={domain.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${domain.gradient} opacity-80`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 text-[10px] font-bold tracking-[0.1em] text-white uppercase px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 font-sans">
                      {domain.category}
                    </span>
                    <div className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm">
                      <DynamicIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Inner padding frame */}
                  <div className="p-5 pt-3 space-y-3 flex-1 flex flex-col">

                  {/* Interactive Subsidized Pricing */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-mono text-[10px]">
                    <span className="text-slate-400 font-bold line-through">₹5,000</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-extrabold font-mono">Online: ₹99<span className="text-[8px] font-normal text-slate-500">/wk</span></span>
                      <span className="text-slate-300">|</span>
                      <span className="text-indigo-600 font-extrabold font-mono">Offline: ₹149<span className="text-[8px] font-normal text-slate-500">/wk</span></span>
                    </div>
                  </div>

                    <div className="space-y-1.5">
                      <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 h-14">
                        {domain.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-sans">
                        {domain.shortDesc}
                      </p>
                    </div>

                    {/* Tools and Technologies badges */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Compilers / Tools learned:</span>
                      <div className="flex flex-wrap gap-1 leading-none">
                        {domain.toolsAndTech.slice(0, 4).map((tech) => (
                          <span key={tech} className="text-[9px] font-bold font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-150 hover:bg-slate-100">
                            {tech}
                          </span>
                        ))}
                        {domain.toolsAndTech.length > 4 && (
                          <span className="text-[10px] font-bold font-mono text-slate-400 self-center pl-1">
                            +{domain.toolsAndTech.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer section matching sizes spacing */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-600 mt-1 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{domain.durationWeeks.join('/')} Weeks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{domain.targetDegrees.join(', ')}</span>
                      </div>
                    </div>

                    {/* Interactive CTAs */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setSelectedDomain(domain)}
                        className="py-2.5 text-center text-xs font-bold rounded-xl bg-white border border-slate-250 hover:border-slate-300 text-slate-750 cursor-pointer shadow-xs"
                      >
                        Syllabus Matrix
                      </button>
                      <button
                        onClick={() => handleEnrollClick(domain.id)}
                        className="py-2.5 text-center text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm transition-all"
                      >
                        Apply Now
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-[1.8rem] border border-slate-200 bg-slate-50 space-y-4 shadow-sm">
            <span className="text-sm font-bold font-mono text-slate-400 uppercase tracking-widest block">SEARCH MISALIGNMENT</span>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              No matching tech cohorts found with current filters. Try resetting target degree configurations or search keyphrase indices.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('All');
                setSelectedDegreeFilter('All');
                setSelectedBranchFilter('All');
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-blue-600 bg-white hover:bg-slate-50 cursor-pointer"
            >
              Reset Search Parameters
            </button>
          </div>
        )}

      </div>

      {/* DETAILED CURRICULUM SLIDEOVER MODAL */}
      {selectedDomain && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-[1.8rem] overflow-hidden shadow-2xl">
            
            {/* Header backdrop gradient */}
            <div className={`h-3 bg-gradient-to-r ${selectedDomain.gradient}`} />
            
            {/* Close trigger */}
            <button
              onClick={() => setSelectedDomain(null)}
              className="absolute top-6 right-6 p-2 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:border-slate-350 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Inner info display */}
            <div className="p-6 sm:p-10 space-y-8 max-h-[85vh] overflow-y-auto">
              
              <div className="flex gap-4 items-center">
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                  {(() => {
                    const DynamicIcon = iconMap[selectedDomain.iconName] || SmartComponentsLoader;
                    return <DynamicIcon className="h-6 w-6 text-blue-600" />;
                  })()}
                </div>
                <div>
                  <span className="text-[10px] bg-blue-50 text-blue-750 px-2.5 py-1 rounded-sm border border-blue-150 uppercase tracking-widest font-bold">
                    {selectedDomain.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 mt-1">
                    {selectedDomain.title}
                  </h2>
                </div>
              </div>

              {/* Quick specifications shelf */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-100 py-4 font-mono text-xs text-slate-600">
                <div className="space-y-1">
                  <span className="block text-slate-400 uppercase text-[9px] tracking-wider font-bold">Cohort Duration Matrix</span>
                  <p className="font-extrabold text-slate-800">
                    {selectedDomain.durationWeeks.map(d => `${d} Weeks`).join(' / ')} Courses
                  </p>
                </div>
                <div className="space-y-1 sm:border-l sm:border-slate-150 sm:pl-4">
                  <span className="block text-slate-400 uppercase text-[9px] tracking-wider font-bold">Target Academic Cohorts</span>
                  <p className="font-extrabold text-slate-800 leading-relaxed">
                    {selectedDomain.targetDegrees.join(', ')} Students Eligible
                  </p>
                </div>
              </div>

              {/* About short summary */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-widest text-slate-450">Program Intent Overview</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  {selectedDomain.shortDesc}
                </p>
              </div>

              {/* Technologies list */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500">Core Platforms & Key Compilers</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDomain.toolsAndTech.map((tool) => (
                    <span key={tool} className="text-xs font-bold font-mono px-3 py-1 bg-slate-50 text-blue-750 border border-slate-150 rounded">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* THREE COHORT PHASES */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500">Structured Phase Milestones</h4>
                
                <div className="space-y-3">
                  {selectedDomain.phases.map((phase, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center bg-white px-3 py-1 rounded border border-slate-150">
                        <span className="text-xs font-extrabold text-slate-900">PHASE 0{idx+1}: {phase.title}</span>
                        <span className="text-[9px] font-bold font-mono text-blue-600 uppercase">WEEK {idx*4 + 1} - {idx*4 + 4}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {phase.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-150">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Deliverable Submissions Checklist:</span>
                        <ul className="space-y-1">
                          {phase.deliverables.map((del, dIdx) => (
                            <li key={dIdx} className="flex gap-2 items-start text-xs text-slate-700 font-sans font-medium">
                              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Acquired */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500">Skills Acquired Upon Graduate Verification</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDomain.skills.map((skill) => (
                    <span key={skill} className="text-[11px] bg-slate-50 border border-slate-150 text-slate-700 px-2.5 py-1 rounded font-medium">
                      ✔ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons inside Modal */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSelectedDomain(null)}
                  className="py-3 text-center text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                >
                  Close Syllabus
                </button>
                <button
                  onClick={() => handleEnrollClick(selectedDomain.id)}
                  className="py-3 text-center text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>Initiate Matrix Enrollment</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Fallback icon component to assert safety
function SmartComponentsLoader(props: any) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
