import { useState } from 'react';
import { Sparkles, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
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

  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || '')
    .toLowerCase()
    .split(',')
    .map((e: string) => e.trim());
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'internships', label: 'Internships' },
    { id: 'placements', label: hasCompletedInternship ? 'Placements' : '🔒 Placements' },
    { id: 'about', label: 'About Us' },
    { id: 'verify', label: 'Verify' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-xl bg-white/90 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab('home')}>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
              <img src="/logo.jpg" alt="Invigo Infotech" className="h-10 w-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-[22px] font-extrabold tracking-tight text-slate-900 leading-none">
                INVIGO <span className="text-blue-600">INFOTECH</span>
              </span>
              <span className="text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase mt-1">
                Internship Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-200/30'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Controls / Call to Action */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                      currentTab === 'admin' 
                        ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 shadow-sm' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    👑 Admin Console
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCurrentTab('nexus')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
                        currentTab === 'nexus' 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                      {savedEnrollmentsCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {savedEnrollmentsCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentTab('profile')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
                        currentTab === 'profile' 
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-sm' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                  </>
                )}
                
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentTab('auth')}
                  className="px-5 py-2.5 rounded-full text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('enroll')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[13px] font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  Enroll Now
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            {savedEnrollmentsCount > 0 && !isAdmin && (
              <span className="px-2 py-0.5 text-[10px] bg-red-500 text-white font-bold rounded-full shadow-sm">
                {savedEnrollmentsCount}
              </span>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                currentTab === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="h-px bg-slate-100 my-2"></div>

          {currentUser ? (
            <div className="flex flex-col gap-2">
              {isAdmin ? (
                 <button
                 onClick={() => {
                   setCurrentTab('admin');
                   setIsMobileMenuOpen(false);
                 }}
                 className="w-full text-left px-5 py-3 rounded-xl text-sm font-bold bg-amber-50 text-amber-800 border border-amber-100"
               >
                 👑 Admin Console
               </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCurrentTab('nexus');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 border border-slate-200 flex justify-between"
                  >
                    Dashboard
                    {savedEnrollmentsCount > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{savedEnrollmentsCount}</span>}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 border border-slate-200"
                  >
                    My Profile
                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center px-5 py-3 mt-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setCurrentTab('auth');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center px-5 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setCurrentTab('enroll');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Enroll Now
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
