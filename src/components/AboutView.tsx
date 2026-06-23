import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Target, 
  Building,
  GraduationCap
} from 'lucide-react';
import { FAQS } from '../data';

export default function AboutView() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const corePillars = [
    {
      title: 'Industry-Accredited',
      desc: 'Invigo designs programs synchronized with actual workforce configurations. B.Tech, Diploma, BCA, B.Sc, MBA, BA, and B.Com paths receive appropriate structural projects.',
      icon: Target,
      gradient: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-blue-500/20'
    },
    {
      title: 'Subject-Matter Experts',
      desc: 'Our academic directors and senior engineers review submissions, debug complex setups, and support scholars throughout their rigorous learning journey.',
      icon: Users,
      gradient: 'from-violet-500 to-fuchsia-500',
      shadow: 'shadow-violet-500/20'
    },
    {
      title: 'Verifiable Integrity',
      desc: 'We publish student progress metrics on standard verifiable systems. No fake indicators, no unaccredited signatures. Pure authentic skill validation.',
      icon: ShieldCheck,
      gradient: 'from-emerald-500 to-teal-400',
      shadow: 'shadow-emerald-500/20'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Invigo Infotech Founded',
      location: 'NCR Delhi Office',
      desc: 'Founded to address the widening gap between static college textbooks and practical industry engineering requirements.',
      icon: Building
    },
    {
      year: '2023',
      title: 'Academic Curriculum Launched',
      location: '12+ Colleges Connected',
      desc: 'Synthesized 10 customized technical study modules mapped onto autonomous credit schemes for diverse degree structures.',
      icon: GraduationCap
    },
    {
      year: '2024',
      title: 'Management Division Added',
      location: 'Business & Finance Expansion',
      desc: 'Added professional MBA-centric modules focusing on growth structures, corporate finance, and business development.',
      icon: Users
    },
    {
      year: '2025',
      title: 'Verifiable Certificates',
      location: 'Credentials Rollout',
      desc: 'Formed partnerships to deploy tamper-proof cryptographic signatures onto student certificates for easy employer verification.',
      icon: ShieldCheck
    },
    {
      year: '2026',
      title: 'The Student Portal Launch',
      location: 'Real-Time Interface Release',
      desc: 'Unveiled our interactive student portal allowing real-time timeline navigation, mock project submissions, and certificate validation.',
      icon: Cpu
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 50, damping: 15 } 
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 text-slate-800 py-16 md:py-24 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-300/15 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-300/15 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[700px] w-[700px] rounded-full bg-cyan-200/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center max-w-4xl mx-auto mb-28"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/60 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-blue-700 uppercase tracking-widest shadow-sm mb-8">
            <Sparkles className="h-4 w-4 animate-pulse text-blue-500" />
            <span>The Invigo Core Mission</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-8">
            We Code, Build, and <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
              Orchestrate Future Tech.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Invigo Infotech is a specialized internship-providing organization designed exclusively for tech and management scholars. We establish interactive workspaces that turn traditional classrooms into active, high-performance production repositories.
          </motion.p>
        </motion.div>

        {/* CORE PILLARS (Grid of 3 Cards) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
        >
          {corePillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-3xl bg-white border border-slate-200/60 p-8 shadow-xl shadow-slate-200/30 overflow-hidden"
              >
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                
                <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br ${pillar.gradient} shadow-lg ${pillar.shadow} mb-6 text-white`}>
                  <Icon className="h-7 w-7" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* DYNAMIC TIMELINE */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Chronological Milestones</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Our growth trajectory from local electronic lab modules up to cryptographic distributed system scaling.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Center Line for Desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-transparent -translate-x-1/2 rounded-full opacity-20" />

            <div className="space-y-12 relative">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                const isEven = idx % 2 === 0;
                return (
                  <motion.div 
                    key={idx} 
                    variants={itemVariants}
                    className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Content Box */}
                    <div className={`flex-1 w-full md:w-1/2 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                      <div className={`inline-flex items-center gap-2 mb-2 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{milestone.year}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-sm">{milestone.location}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{milestone.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-sm">
                        {milestone.desc}
                      </p>
                    </div>

                    {/* Center Node */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-slate-50 items-center justify-center shadow-xl shadow-blue-500/10 z-10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* INTERACTIVE FAQ ACCORDION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-1.5 text-xs font-bold text-fuchsia-700 uppercase tracking-widest shadow-sm mb-6">
              <HelpCircle className="h-4 w-4 text-fuchsia-600" />
              <span>Common Queries</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left focus:outline-none"
                  >
                    <span className={`font-bold text-sm sm:text-base transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-800'}`}>
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-full transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      <ChevronDown className={`h-5 w-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
