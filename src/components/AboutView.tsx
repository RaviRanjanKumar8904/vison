import { useState } from 'react';
import { Mail, Phone, MapPin, Milestone, Sparkles, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Cpu, Users } from 'lucide-react';
import { FAQS } from '../data';

export default function AboutView() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const corePillars = [
    {
      title: 'Industry-Accredited Roadmap',
      desc: 'Invigo designs programs synchronized with actual workforce configurations. B.Tech, Diploma, BCA, B.Sc, and MBA paths receive exactly appropriate structural projects.',
      icon: Cpu,
      color: 'text-blue-600 border-blue-100 bg-blue-50/40'
    },
    {
      title: 'Subject-Matter Experts',
      desc: 'Our academic directors and senior engineers review submissions, debug complex setups, and support scholars throughout their learning journey.',
      icon: Users,
      color: 'text-indigo-600 border-indigo-150 bg-indigo-50/40'
    },
    {
      title: 'Verifiable Integrity',
      desc: 'We publish student progress metrics on standard verifiable systems. No fake indicators, no unaccredited signatures.',
      icon: ShieldCheck,
      color: 'text-emerald-700 border-emerald-100 bg-emerald-50/40'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Invigo Infotech Founded',
      location: 'NCR Delhi Office',
      desc: 'Invigo Infotech was founded to address the widening gap between static college textbooks and practical industry engineering requirements.'
    },
    {
      year: '2023',
      title: 'Academic Curriculum Launched',
      location: '12+ Colleges Connected',
      desc: 'Synthesized 10 customized technical study modules mapped onto autonomous credit schemes for B.Tech, Diploma, and BCA structures.'
    },
    {
      year: '2024',
      title: 'Management Division Added',
      location: 'Business & Finance Expansion',
      desc: 'Added professional MBA-centric modules focusing on growth structures, corporate finance, and business development.'
    },
    {
      year: '2025',
      title: 'Verifiable Certificates introduced',
      location: 'Blockchain Credentials Rollout',
      desc: 'Formed partnerships to deploy tamper-proof cryptographic signatures onto student certificates for easy employer verification.'
    },
    {
      year: '2026',
      title: 'The Student Portal Launch',
      location: 'Real-Time Interface Release',
      desc: 'Unveiled our interactive student portal allowing real-time timeline navigation, mock project submissions, and certificate validation.'
    }
  ];

  const executiveTeam = [
    {
      name: 'Dr. Devendra R. Mathur',
      role: 'Head of Engineering Programs',
      bio: 'Former IIT researcher with 18+ years optimizing automation systems, web architectures, and hardware modules.',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?fit=crop&w=150&h=150'
    },
    {
      name: 'Malini Krishnaswamy',
      role: 'Head of MBA & Business Admin Programs',
      bio: 'Ex-strategy leader at top Fintech systems. Architect of our active finance, business management, and marketing syllabus courses.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=150&h=150'
    },
    {
      name: 'Samarpreet Singh Sidhu',
      role: 'Lead Cloud & DevOps Advisor',
      bio: 'AWS Certified Solutions Architect. Handles global secure cloud pipelines, Docker/Kubernetes container systems, and code reviews.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?fit=crop&w=150&h=150'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-transparent text-slate-800 py-12 md:py-20">
      
      {/* Glow overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[15%] left-[5%] h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[600px] w-[600px] rounded-full bg-indigo-100/30 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* BRAND INTRODUCTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 font-sans">
              <Sparkles className="h-4 w-4 animate-pulse text-violet-600" />
              <span>THE INVIGO CORE MISSION</span>
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              We Code, Build, and <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Orchestrate Future Tech.
              </span>
            </h1>
            <p className="text-slate-650 text-sm leading-relaxed">
              Invigo Infotech is a specialized internship-providing organization designed exclusively for tech and management scholars (B.Tech, Diploma, BCA, B.Sc, and MBA students). We establish interactive workspaces that turn classrooms into active production repositories.
            </p>
            <p className="text-slate-650 text-sm leading-relaxed">
              By working within our 16 highly responsive domains, candidates become comfortable with asynchronous architectures, database constraints, hardware registers, and corporate strategic guidelines.
            </p>
          </div>

          {/* Abstract Cyber Graphic box */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 md:p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 text-[10px] font-mono text-indigo-600 font-bold">SYSTEM ARCHITECTURE // VIG_v1.2</div>
              <div className="space-y-6">
                <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold block">Core Blueprint Values</span>
                
                <div className="space-y-4">
                  {corePillars.map((pillar, i) => {
                    const Icon = pillar.icon;
                    return (
                      <div key={i} className={`flex gap-4 p-4 rounded-2xl border ${pillar.color}`}>
                        <Icon className="h-6 w-6 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{pillar.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1">{pillar.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC TIMELINE */}
        <div className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 text-center">Chronological Milestones</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Our growth trajectory from local electronic lab modules up to cryptographic distributed system scaling.
            </p>
          </div>

          <div className="relative border-l border-slate-200 ml-4 md:ml-32 py-4 space-y-8">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="relative pl-6 md:pl-10 group">
                {/* Year tag hanging left on desktop */}
                <span className="hidden md:block absolute right-full mr-10 top-0 text-right font-display text-lg font-extrabold text-blue-600 font-mono">
                  {milestone.year}
                </span>

                {/* Cyber Dot with outer glow */}
                <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-600 border border-white shadow-md group-hover:scale-125 transition-transform duration-200" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="md:hidden font-mono text-blue-600 font-bold">{milestone.year} —</span>
                    <h3 className="text-base font-extrabold text-slate-900">{milestone.title}</h3>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-indigo-600 uppercase tracking-widest font-bold">
                    <Milestone className="h-3.5 w-3.5" />
                    <span>{milestone.location}</span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {milestone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEADERSHIP nodes */}
        <div className="space-y-12 border-t border-slate-150 pt-16">
          <div className="text-center space-y-3">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 text-center">Academic & Research Leadership</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              The qualified engineers and operations directors steering our curriculum maps and evaluating Capstone portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {executiveTeam.map((leader, i) => (
              <div key={i} className="rounded-[1.8rem] border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={leader.avatar} alt={leader.name} referrerPolicy="no-referrer" className="h-14 w-14 rounded-2xl object-cover border border-slate-100 bg-slate-50 shadow-sm" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{leader.name}</h3>
                      <p className="text-xs text-blue-600 font-mono tracking-wide font-semibold mt-0.5">{leader.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {leader.bio}
                  </p>
                </div>
                
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>VERIFIED ID // NODE_{i+1}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE FAQ ACCORDION */}
        <div className="space-y-8 border-t border-slate-150 pt-16">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-750 font-sans">
              <HelpCircle className="h-4 w-4 text-fuchsia-600" />
              <span>COMMONLY ENCOUNTERED PARADOXES</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 text-center">Frequently Answered Queries</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Confirm your understanding of our academic allocations, timing loops, and verifiable document matrices.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-display font-bold text-xs sm:text-sm text-slate-800">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-blue-600 shrink-0 transform rotate-180 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/55">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
