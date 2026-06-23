import { GraduationCap, Mail, Phone, MapPin, ExternalLink, ShieldAlert } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-slate-200 bg-slate-50 mt-auto pt-14 pb-10">
      {/* Light subtle line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[80%] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand block */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('home')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                <img src="/logo.jpg" alt="Invigo Infotech" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <span className="font-display text-lg font-extrabold tracking-wider text-slate-800">
                  INVIGO
                </span>
                <span className="block text-[7px] font-mono tracking-[4px] text-blue-600 uppercase leading-none font-bold">
                  INFOTECH
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-550 leading-relaxed max-w-xs">
              Empowering next-gen scholars through cybernetic workflow simulation, live mentoring, and industry-accredited internships.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-[10px] font-mono text-slate-500 tracking-wider">SYSTEM STATUS: OPERATIONAL</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xs text-slate-800 tracking-wider uppercase border-l-2 border-blue-600 pl-2">
              Cyber Nexus
            </h3>
            <ul className="space-y-2 text-xs">
              {['home', 'internships', 'about', 'nexus'].map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => setCurrentTab(tab)}
                    className="text-slate-600 hover:text-blue-600 capitalize transition-colors duration-150 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>{tab === 'nexus' ? 'My Student Deck' : tab}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setCurrentTab('enroll')}
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-150 flex items-center gap-1 font-extrabold cursor-pointer"
                >
                  Apply Matrix
                </button>
              </li>
            </ul>
          </div>

          {/* High-Tech Domains Overview */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xs text-slate-800 tracking-wider uppercase border-l-2 border-indigo-600 pl-2">
              Fast Track Nodes
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => setCurrentTab('internships')} className="hover:text-blue-600 text-left cursor-pointer">
                  Quantum AI & Machine Learning
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('internships')} className="hover:text-blue-600 text-left cursor-pointer">
                  Full-Stack Cyber Engineering
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('internships')} className="hover:text-blue-600 text-left cursor-pointer">
                  Cyber Cloud Security & Audits
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('internships')} className="hover:text-blue-600 text-left cursor-pointer">
                  FinTech & Venture Capital (MBA)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('internships')} className="hover:text-blue-600 text-left cursor-pointer">
                  IoT & Ambient Electrical Systems
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Coordinates */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xs text-slate-800 tracking-wider uppercase border-l-2 border-slate-600 pl-2">
              Coordinates
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <a href="mailto:contact@invigoinfotech.in" className="hover:text-blue-600 transition-colors">
                  contact@invigoinfotech.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                <span>+91 62042 66080</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Polytecnic Chowk, Purnea, 854301</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-slate-400">
            © {currentYear} Invigo Infotech Inc. All Rights Reserved. VERIFICATION BLOCK // HASH_A68-C89-D91-E08
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] font-mono text-slate-400 justify-center">
            <div className="flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Verifiable Academic Credentials Approved</span>
            </div>
            <span>|</span>
            <span className="hover:text-slate-750 cursor-pointer">Security Protocols</span>
            <span>|</span>
            <span className="hover:text-slate-750 cursor-pointer">Terms of Operation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
