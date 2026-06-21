import { Briefcase, Lock, CheckCircle, TrendingUp, Building2, MapPin, IndianRupee, ExternalLink, Award, Star, Users } from 'lucide-react';
import { EnrollmentState } from '../types';
import { motion } from 'motion/react';

interface PlacementsViewProps {
  hasCompletedInternship: boolean;
  setCurrentTab: (tab: string) => void;
  enrollments: EnrollmentState[];
}

const PLACEMENT_COMPANIES = [
  { name: 'TCS', role: 'Software Developer', salary: '₹3.5L - ₹7L / year', location: 'Pan India', logo: '🏢', type: 'IT Services' },
  { name: 'Infosys', role: 'Systems Engineer', salary: '₹3.6L - ₹6.5L / year', location: 'Bengaluru, Pune', logo: '💼', type: 'IT Services' },
  { name: 'Wipro', role: 'Project Engineer', salary: '₹3.5L - ₹6L / year', location: 'Hyderabad, Chennai', logo: '🖥️', type: 'IT Services' },
  { name: 'Cognizant', role: 'Full Stack Developer', salary: '₹4L - ₹8L / year', location: 'Chennai, Pune', logo: '⚡', type: 'IT Consulting' },
  { name: 'Accenture', role: 'Technology Analyst', salary: '₹4.5L - ₹9L / year', location: 'Mumbai, Bengaluru', logo: '🌐', type: 'Consulting' },
  { name: 'HCL Tech', role: 'Graduate Engineer', salary: '₹3.5L - ₹7L / year', location: 'Noida, Chennai', logo: '🔧', type: 'IT Services' },
  { name: 'Tech Mahindra', role: 'Associate Engineer', salary: '₹3.2L - ₹6L / year', location: 'Pune, Hyderabad', logo: '🚀', type: 'IT Services' },
  { name: 'Deloitte', role: 'Business Analyst', salary: '₹6L - ₹12L / year', location: 'Gurugram, Mumbai', logo: '📊', type: 'Consulting' },
  { name: 'Amazon', role: 'SDE Intern', salary: '₹10L - ₹20L / year', location: 'Hyderabad, Bengaluru', logo: '📦', type: 'Product' },
  { name: 'Microsoft', role: 'Software Engineer', salary: '₹12L - ₹25L / year', location: 'Hyderabad, Noida', logo: '🪟', type: 'Product' },
  { name: 'Google', role: 'Associate SWE', salary: '₹15L - ₹30L / year', location: 'Bengaluru, Hyderabad', logo: '🔍', type: 'Product' },
  { name: 'Flipkart', role: 'Product Engineer', salary: '₹8L - ₹18L / year', location: 'Bengaluru', logo: '🛒', type: 'E-Commerce' },
];

const PLACEMENT_STATS = [
  { label: 'Students Placed', value: '500+', icon: Users },
  { label: 'Partner Companies', value: '50+', icon: Building2 },
  { label: 'Avg. Package', value: '₹5.2L', icon: IndianRupee },
  { label: 'Highest Package', value: '₹30L', icon: TrendingUp },
];

export default function PlacementsView({ hasCompletedInternship, setCurrentTab, enrollments }: PlacementsViewProps) {
  const completedCount = enrollments.filter(e => e.status === 'Completed' || e.certificateIssued).length;

  return (
    <div className="relative bg-transparent text-slate-800 py-12 font-sans animate-fade-in">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono text-emerald-600 font-bold">
            <Briefcase className="h-4 w-4" />
            <span>PLACEMENT PORTAL</span>
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Career Placement Hub
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Unlock placement opportunities after completing at least 1 internship. Get access to exclusive job listings from top companies.
          </p>
        </div>

        {/* Locked Overlay */}
        {!hasCompletedInternship && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-8 sm:p-12 text-center space-y-5"
          >
            <div className="mx-auto h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
              <Lock className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-700">
              Placement Section is Locked 🔒
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Complete at least <strong className="text-slate-700">1 internship</strong> to unlock placement opportunities. 
              Our placement partners hire directly from our certified interns pool.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <button
                onClick={() => setCurrentTab('internships')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                Browse Internships →
              </button>
              <button
                onClick={() => setCurrentTab('nexus')}
                className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider pt-2">
              Internships Completed: {completedCount} / 1 required
            </p>
          </motion.div>
        )}

        {/* Unlocked Content */}
        {hasCompletedInternship && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Success Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Placements Unlocked! 🎉</h3>
                  <p className="text-emerald-100 text-xs">You've completed {completedCount} internship(s). Browse exclusive opportunities below.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white/15 rounded-full text-sm font-bold">
                <Award className="h-4 w-4" />
                <span>Certified Intern</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PLACEMENT_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-5 text-center hover:shadow-md transition-all">
                    <Icon className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                    <h3 className="text-2xl font-extrabold text-slate-900 font-mono">{stat.value}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Company Listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Partner Company Openings</span>
                </h3>
                <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                  {PLACEMENT_COMPANIES.length} openings available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLACEMENT_COMPANIES.map((company, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl bg-white border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                        {company.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{company.name}</h4>
                          <span className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold border border-blue-200">{company.type}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">{company.role}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <IndianRupee className="h-3 w-3" />
                            {company.salary}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span>{company.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:underline">
                        Apply Now
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-center text-white space-y-3">
              <h3 className="font-display text-xl font-bold">Want More Placement Opportunities?</h3>
              <p className="text-slate-300 text-xs max-w-md mx-auto">Complete more internships to increase your placement readiness score and unlock premium company listings.</p>
              <button
                onClick={() => setCurrentTab('internships')}
                className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-lg cursor-pointer active:scale-95"
              >
                Explore More Internships
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
