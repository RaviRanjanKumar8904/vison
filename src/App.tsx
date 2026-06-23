import { useState, useEffect, lazy, Suspense } from 'react';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || '')
  .toLowerCase()
  .split(',')
  .map((e: string) => e.trim());
import Header from './components/Header';
// Admin email from env
import Footer from './components/Footer';
import { EnrollmentState, StudentUser } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

// Lazy load all page-level components for faster initial load
const HomeView = lazy(() => import('./components/HomeView'));
const AboutView = lazy(() => import('./components/AboutView'));
const InternshipsView = lazy(() => import('./components/InternshipsView'));
const EnrollmentWizard = lazy(() => import('./components/EnrollmentWizard'));
const StudentNexus = lazy(() => import('./components/StudentNexus'));
const VerifyView = lazy(() => import('./components/VerifyView'));
const AuthView = lazy(() => import('./components/AuthView'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const PlacementsView = lazy(() => import('./components/PlacementsView'));
const VideoPlayerView = lazy(() => import('./components/VideoPlayerView'));

// Lightweight loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32 flex-col gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600"></div>
      <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading...</p>
    </div>
  );
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/verification' || path === '/verificaton') return 'verify';
    if (path === '/internships') return 'internships';
    if (path === '/about') return 'about';
    if (path === '/enroll') return 'enroll';
    if (path === '/nexus') return 'nexus';
    if (path === '/placements') return 'placements';
    if (path === '/admin') return 'admin';
    if (path.startsWith('/player')) return 'player';
    return 'home';
  });

  // Sync URL with current tab
  useEffect(() => {
    const currentPath = window.location.pathname;
    let targetPath = '/';
    if (currentTab === 'verify') targetPath = '/verification';
    else if (currentTab !== 'home') targetPath = `/${currentTab}`;
    
    if (currentPath !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [currentTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/verification' || path === '/verificaton') setCurrentTab('verify');
      else if (path === '/internships') setCurrentTab('internships');
      else if (path === '/about') setCurrentTab('about');
      else if (path === '/enroll') setCurrentTab('enroll');
      else if (path === '/nexus') setCurrentTab('nexus');
      else if (path === '/placements') setCurrentTab('placements');
      else if (path === '/admin') setCurrentTab('admin');
      else if (path.startsWith('/player')) setCurrentTab('player');
      else setCurrentTab('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [enrollments, setEnrollments] = useState<EnrollmentState[]>([]);
  const [preselectedDomainId, setPreselectedDomainId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Dual-filtering synchronization states across page thresholds
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedDegreeFilter, setSelectedDegreeFilter] = useState<string>('All');

  // Load persistent user session using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Enforcement: check if user is blocked by admin before granting dashboard access
          const enrollCol = collection(db, 'enrollments');
          const q = query(enrollCol, where('email', '==', firebaseUser.email?.toLowerCase() || ''));
          const rollSnap = await getDocs(q);
          let isUserBlocked = false;
          rollSnap.forEach((docSnap) => {
            if (docSnap.data().blocked) {
              isUserBlocked = true;
            }
          });

          if (isUserBlocked) {
            alert('🚨 Account Blocked: Your internship trainee credentials have been suspended by academic administrators. Please reach out to administrative query portals.');
            await signOut(auth);
            setCurrentUser(null);
            setCurrentTab('home');
            setIsAuthLoading(false);
            return;
          }

          const docRef = doc(db, 'students', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data() as StudentUser;
            setCurrentUser(userData);
            // Only redirect admin to admin panel on auth state change
            if (ADMIN_EMAILS.includes(userData.email.toLowerCase())) {
              setCurrentTab('admin');
            }
          } else {
            // Fallback basic student representation
            const basicUser: StudentUser = {
              id: firebaseUser.uid,
              fullName: firebaseUser.displayName || 'Learner',
              email: firebaseUser.email || '',
              phone: '',
            };
            setCurrentUser(basicUser);
            if (ADMIN_EMAILS.includes(basicUser.email.toLowerCase())) {
              setCurrentTab('admin');
            }
          }
        } catch (e) {
          console.error('Error fetching student profile from Firestore:', e);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync enrollments dynamically in real-time from Firestore when authenticated
  useEffect(() => {
    if (!currentUser) {
      setEnrollments([]);
      return;
    }

    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('email', '==', currentUser.email.toLowerCase())
    );

    const unsubscribe = onSnapshot(
      enrollmentsQuery,
      (snapshot) => {
        const fetchedEnrollments: EnrollmentState[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as EnrollmentState;
          
          // Auto-migrate old IDs
          if (data.candidateId && data.candidateId.startsWith('INV-')) {
             const year = new Date().getFullYear();
             const regNo = data.registrationNo ? data.registrationNo.replace(/\\s+/g, '').toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
             const newId = `${year}IN${regNo}`;
             
             // Run async migration without blocking
             setTimeout(async () => {
               try {
                 const newEnrollment = { ...data, candidateId: newId };
                 await setDoc(doc(db, 'enrollments', newId), newEnrollment);
                 await deleteDoc(doc(db, 'enrollments', data.candidateId));
               } catch (e) {
                 console.error("Migration failed", e);
               }
             }, 0);
          } else {
            fetchedEnrollments.push(data);
          }
        });
        // Sort chronologically desc
        fetchedEnrollments.sort(
          (a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
        );
        setEnrollments(fetchedEnrollments);
      },
      (error) => {
        console.error('Error synchronizing enrollments with Firestore:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleLoginSuccess = (user: StudentUser) => {
    setCurrentUser(user);
    if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      setCurrentTab('admin');
    } else {
      // After login, redirect to HOME page instead of nexus
      setCurrentTab('home');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setCurrentTab('home');
  };

  const handleEnrollmentComplete = async (newEnrollment: EnrollmentState) => {
    try {
      await setDoc(doc(db, 'enrollments', newEnrollment.candidateId), newEnrollment);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `enrollments/${newEnrollment.candidateId}`);
    }
  };

  const handleSelectDomainForEnrollment = (domainId: string) => {
    setPreselectedDomainId(domainId);
  };

  const handleClearEnrollments = async () => {
    // Delete documents for the logged in user
    for (const e of enrollments) {
      try {
        await deleteDoc(doc(db, 'enrollments', e.candidateId));
      } catch (err) {
        console.warn('Failed to delete enrollment:', e.candidateId, err);
      }
    }
    setEnrollments([]);
    setCurrentTab('home');
  };



  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f8fafc] flex-col gap-4 font-sans text-slate-800">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Initializing academic nodes...</p>
      </div>
    );
  }

  // Check if user has completed at least 1 internship (for placement unlock)
  const hasCompletedInternship = enrollments.some(e => e.status === 'Completed' || e.certificateIssued);

  const isAdminUser = currentUser && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

  if (isAdminUser) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800 selection:bg-cyan-100 selection:text-cyan-900 relative overflow-hidden">
        <Header 
          currentTab="admin" 
          setCurrentTab={setCurrentTab} 
          savedEnrollmentsCount={0}
          currentUser={currentUser}
          onLogout={handleLogout}
          hasCompletedInternship={hasCompletedInternship}
        />
        <main className="flex-grow relative z-10">
          <Suspense fallback={<PageLoader />}>
            <AdminPanel 
              currentUser={currentUser} 
              setCurrentTab={setCurrentTab}
            />
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800 selection:bg-cyan-100 selection:text-cyan-900 relative overflow-hidden">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[65%] bg-blue-400/10 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-purple-400/10 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-cyan-300/10 rounded-full blur-[110px] pointer-events-none z-0"></div>

      {/* Translucent Global Header Navbar */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        
        savedEnrollmentsCount={currentUser ? enrollments.filter(e => e.email.toLowerCase() === currentUser.email.toLowerCase()).length : 0}
        currentUser={currentUser}
        onLogout={handleLogout}
        hasCompletedInternship={hasCompletedInternship}
      />

      {/* Main viewport switcher */}
      <main className="flex-grow relative z-10">
        <Suspense fallback={<PageLoader />}>
          {currentTab === 'home' && (
            <HomeView 
              setCurrentTab={setCurrentTab} 
              setSelectedCategoryFilter={setSelectedCategoryFilter}
              setSelectedDegreeFilter={setSelectedDegreeFilter}
              enrollments={currentUser ? enrollments.filter(e => e.email.toLowerCase() === currentUser.email.toLowerCase()) : []}
              onClearEnrollments={handleClearEnrollments}
              onSelectDomainForEnrollment={handleSelectDomainForEnrollment}
            />
          )}
          
          {currentTab === 'internships' && (
            <InternshipsView 
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              selectedCategoryFilter={selectedCategoryFilter}
              setSelectedCategoryFilter={setSelectedCategoryFilter}
              selectedDegreeFilter={selectedDegreeFilter}
              setSelectedDegreeFilter={setSelectedDegreeFilter}
              onSelectDomainForEnrollment={handleSelectDomainForEnrollment}
            />
          )}

          {currentTab === 'about' && (
            <AboutView />
          )}

          {currentTab === 'auth' && (
            <AuthView 
              onLoginSuccess={handleLoginSuccess}
              setCurrentTab={setCurrentTab}
              preselectedDomainId={preselectedDomainId}
            />
          )}

          {currentTab === 'enroll' && (
            currentUser ? (
              <EnrollmentWizard 
                preselectedDomainId={preselectedDomainId}
                setPreselectedDomainId={setPreselectedDomainId}
                onEnrollmentComplete={handleEnrollmentComplete}
                setCurrentTab={setCurrentTab}
                currentUser={currentUser}
              />
            ) : (
              <AuthView 
                onLoginSuccess={handleLoginSuccess}
                setCurrentTab={setCurrentTab}
                preselectedDomainId={preselectedDomainId}
              />
            )
          )}

          {currentTab === 'nexus' && (
            currentUser ? (
              <StudentNexus 
                enrollments={enrollments.filter(e => e.email.toLowerCase() === currentUser.email.toLowerCase())} 
                setCurrentTab={setCurrentTab}
                onSelectDomainForEnrollment={handleSelectDomainForEnrollment}
              />
            ) : (
              <AuthView 
                onLoginSuccess={handleLoginSuccess}
                setCurrentTab={setCurrentTab}
              />
            )
          )}

          {currentTab === 'placements' && (
            <PlacementsView
              hasCompletedInternship={hasCompletedInternship}
              setCurrentTab={setCurrentTab}
              enrollments={enrollments}
            />
          )}

          {currentTab === 'verify' && (
            <VerifyView 
              enrollments={enrollments} 
              setCurrentTab={setCurrentTab}
            />
          )}


          {currentTab === 'player' && (
             <VideoPlayerView setCurrentTab={setCurrentTab} />
          )}
        </Suspense>
      </main>

      {/* Translucent Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Floating WhatsApp Overlay */}
      <a 
        href="https://wa.me/916204266080" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 group ring-4 ring-[#25D366]/30"
        aria-label="Contact on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" className="fill-current">
          <path d="M12.031 21.672C10.36 21.672 8.766 21.24 7.373 20.472L2 22l1.583-5.267A9.577 9.577 0 0 1 2.455 12C2.455 6.721 6.756 2.417 12.031 2.417S21.608 6.721 21.608 12s-4.302 9.672-9.577 9.672zm0-17.653c-4.404 0-7.988 3.585-7.988 7.981 0 1.57.461 3.084 1.309 4.354l-.946 3.144 3.243-.847a7.925 7.925 0 0 0 4.382 1.312c4.403 0 7.987-3.584 7.987-7.98S16.435 4.019 12.031 4.019zm4.417 11.026c-.241-.121-1.428-.705-1.648-.786-.22-.081-.381-.121-.542.121-.161.242-.622.786-.763.948-.14.161-.281.181-.522.06-1.127-.563-2.079-1.282-2.859-2.316-.201-.265-.02-.406.1-.526.108-.108.241-.282.361-.422.12-.14.161-.242.241-.403.08-.161.04-.302-.02-.423-.061-.121-.542-1.308-.743-1.792-.196-.473-.393-.409-.542-.416-.14-.008-.301-.01-.462-.01-.16 0-.422.061-.643.302-.22.242-.843.826-.843 2.015s.863 2.337.983 2.498c.12.161 1.706 2.603 4.133 3.65.577.248 1.027.396 1.378.507.579.183 1.106.157 1.52.095.467-.071 1.428-.584 1.629-1.148.201-.564.201-1.048.14-1.148-.06-.101-.22-.162-.461-.283z" />
        </svg>
        <span className="absolute right-16 bg-white text-slate-800 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Chat with Us
        </span>
      </a>

    </div>
  );
}
