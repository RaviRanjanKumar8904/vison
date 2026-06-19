import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import InternshipsView from './components/InternshipsView';
import EnrollmentWizard from './components/EnrollmentWizard';
import StudentNexus from './components/StudentNexus';
import VerifyView from './components/VerifyView';
import AuthView from './components/AuthView';
import AdminPanel from './components/AdminPanel';
import { EnrollmentState, StudentUser } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
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
            if (userData.email.toLowerCase() === 'raviranjan8904@gmail.com') {
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
            if (basicUser.email.toLowerCase() === 'raviranjan8904@gmail.com') {
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
          fetchedEnrollments.push(docSnap.data() as EnrollmentState);
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
    if (user.email.toLowerCase() === 'raviranjan8904@gmail.com') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('nexus');
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

  const handleInitiateDemo = () => {
    setCurrentTab('internships');
    setSelectedCategoryFilter('All');
    setSelectedDegreeFilter('All');
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f8fafc] flex-col gap-4 font-sans text-slate-800">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Initializing academic nodes...</p>
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
        onInitiateDemo={handleInitiateDemo}
        savedEnrollmentsCount={currentUser ? enrollments.filter(e => e.email.toLowerCase() === currentUser.email.toLowerCase()).length : 0}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main viewport switcher */}
      <main className="flex-grow relative z-10">
        {currentTab === 'home' && (
          <HomeView 
            setCurrentTab={setCurrentTab} 
            setSelectedCategoryFilter={setSelectedCategoryFilter}
            setSelectedDegreeFilter={setSelectedDegreeFilter}
            enrollments={currentUser ? enrollments.filter(e => e.email.toLowerCase() === currentUser.email.toLowerCase()) : []}
            onClearEnrollments={handleClearEnrollments}
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

        {currentTab === 'verify' && (
          <VerifyView 
            enrollments={enrollments} 
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'admin' && (
          currentUser && currentUser.email.toLowerCase() === 'raviranjan8904@gmail.com' ? (
            <AdminPanel 
              currentUser={currentUser} 
              setCurrentTab={setCurrentTab}
            />
          ) : (
            <AuthView 
              onLoginSuccess={handleLoginSuccess}
              setCurrentTab={setCurrentTab}
            />
          )
        )}
      </main>

      {/* Translucent Footer */}
      <Footer setCurrentTab={setCurrentTab} />

    </div>
  );
}
