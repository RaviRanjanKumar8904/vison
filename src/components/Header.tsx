import { useState } from 'react';
import { GraduationCap, Sparkles, MonitorPlay, Lock } from 'lucide-react';
import { StudentUser } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  savedEnrollmentsCount: number;
  currentUser: StudentUser | null;
  onLogout: () => void;
  hasCompletedInternship?: boolean;
}

export default function Header({ currentTab, setCurrentTab, savedEnrollmentsCount, currentUser, onLogout, hasCompletedInternship }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
  const isAdmin = currentUser && currentUser.email.toLowerCase() === ADMIN_EMAIL;

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'internships', label: 'Internships' },
    { id: 'placements', label: hasCompletedInternship ? 'Placements' : '🔒 Placements' },
    { id: 'about', label: 'About Us' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Console 👑' }] : [{ id: 'nexus', label: 'Student Dashboard' }]),
    { id: 'verify', label: 'Verify Certificate' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-md bg-white/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm">
              <img src="/logo.jpg" alt="Invigo Infotech" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold tracking-tighter text-slate-900">
                INVIGO <span className="text-blue-600">INFOTECH</span>
              </span>
              <span className="block text-[8px] font-mono tracking-[4px] text-blue-500 uppercase leading-none mt-0.5">
                INTERNSHIP PORTAL
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-200 relative border ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/70 border-blue-200 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/60 border-transparent'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {item.id === 'nexus' && savedEnrollmentsCount > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 text-[9px] bg-red-500 text-white font-extrabold rounded-full animate-bounce">
                      {savedEnrollmentsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Call to Action */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <div className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold border shadow-xs ${
                  isAdmin 
                    ? 'border-amber-250 bg-amber-50 text-amber-805' 
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isAdmin ? 'bg-amber-600' : 'bg-blue-500'}`} />
                  <span>{isAdmin ? '🛡️ Portal Administrator' : `Hi, ${currentUser.fullName.split(' ')[0]}`}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('auth')}
                  className="px-4 py-2 hover:bg-slate-100 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all uppercase tracking-wider"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('enroll')}
                  className="relative px-5 py-2.5 bg-blue-600 hover:bg-blue-500 border border-transparent rounded-full transition-all font-semibold uppercase tracking-wider text-xs text-white shadow-lg active:scale-[0.98]"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    <span>Enroll Now</span>
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {savedEnrollmentsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-cyan-400 text-slate-950 font-bold rounded-full">
                {savedEnrollmentsCount}
              </span>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <span className="sr-only">Toggle navigation</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-lg px-4 py-3 space-y-2 shadow-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
                currentTab === item.id
                  ? 'text-blue-600 bg-blue-50/70 border-l-2 border-blue-600 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            {currentUser ? (
              <div className="space-y-2 pt-1">
                <div className="px-4 py-2 text-xs text-blue-700 border border-blue-200 bg-blue-50 rounded-2xl">
                  Logged in as <strong className="text-slate-900 block font-semibold">{currentUser.fullName}</strong>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 px-4 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600 flex justify-center items-center hover:bg-slate-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setCurrentTab('auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-4 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600 text-center hover:bg-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('enroll');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-4 rounded-full text-xs font-bold bg-blue-600 text-white text-center flex items-center justify-center gap-1 hover:bg-blue-500"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Enroll</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
