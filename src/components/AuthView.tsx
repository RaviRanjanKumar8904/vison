import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, CheckCircle, Smartphone } from 'lucide-react';
import { StudentUser } from '../types';
import { auth, db, googleProvider } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { 
  setDoc, 
  getDoc, 
  doc 
} from 'firebase/firestore';

interface AuthViewProps {
  onLoginSuccess: (user: StudentUser) => void;
  setCurrentTab: (tab: string) => void;
  preselectedDomainId?: string;
}

export default function AuthView({ onLoginSuccess, setCurrentTab, preselectedDomainId }: AuthViewProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthNotAllowed, setIsAuthNotAllowed] = useState(false);

  // Load or initialize registered accounts
  const getRegisteredUsers = (): any[] => {
    try {
      const saved = localStorage.getItem('invigo_registered_students');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    // Pre-registered demo students
    return [
      {
        id: 'user_dtu',
        fullName: 'Priyanshu Ranjan',
        email: 'priyanshu@university.edu',
        phone: '9876543210',
        password: 'password123',
        collegeName: 'Delhi Technological University (DTU)',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Engineering',
        currentYear: '3rd Year',
        passingYear: '2027'
      }
    ];
  };

  // ─── Google Sign-In Handler ───
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsAuthNotAllowed(false);
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Check if student profile already exists in Firestore
      const userDocRef = doc(db, 'students', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData: StudentUser;

      if (userDocSnap.exists()) {
        const fetchedData = userDocSnap.data();
        profileData = {
          id: fbUser.uid,
          fullName: fetchedData.fullName || fbUser.displayName || 'Invigo Student',
          email: fetchedData.email || fbUser.email || '',
          phone: fetchedData.phone || fbUser.phoneNumber || '',
          collegeName: fetchedData.collegeName || '',
          degree: fetchedData.degree || 'B.Tech',
          fieldOfStudy: fetchedData.fieldOfStudy || '',
          currentYear: fetchedData.currentYear || '1st Year',
          passingYear: fetchedData.passingYear || '2028'
        };
      } else {
        // Create new student profile from Google account
        profileData = {
          id: fbUser.uid,
          fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Invigo Student',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          collegeName: '',
          degree: 'B.Tech',
          fieldOfStudy: '',
          currentYear: '1st Year',
          passingYear: '2028'
        };

        // Save to Firestore
        await setDoc(userDocRef, {
          ...profileData,
          uid: fbUser.uid,
          createdAt: new Date().toISOString(),
          authProvider: 'google'
        });
      }

      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        onLoginSuccess(profileData);
        setIsLoading(false);
        if (preselectedDomainId) {
          setCurrentTab('enroll');
        } else {
          setCurrentTab('nexus');
        }
      }, 600);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      let errorText = 'Google sign-in failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorText = 'Sign-in popup was closed. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorText = 'Pop-up was blocked by browser. Please allow popups for this site.';
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsAuthNotAllowed(true);
        errorText = 'Google Sign-In is not enabled. Please enable Google provider in Firebase Console → Authentication → Sign-in method.';
      } else if (err.message) {
        errorText = `${err.message}`;
      }
      setErrorMsg(errorText);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsAuthNotAllowed(false);

    const trimmedEmail = loginEmail.trim().toLowerCase();

    if (!trimmedEmail || !loginPassword.trim()) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      let fbUser;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, loginPassword);
        fbUser = userCredential.user;
      } catch (authError: any) {
        // Special case: If user logged in as demo student, auto register inside auth if not exists
        if (trimmedEmail.toLowerCase() === 'priyanshu@university.edu' && loginPassword === 'password123') {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, 'priyanshu@university.edu', 'password123');
            fbUser = createCred.user;
            // Write demo metadata
            const demoProfile = {
              fullName: 'Priyanshu Ranjan',
              email: 'priyanshu@university.edu',
              phone: '9876543210',
              collegeName: 'Delhi Technological University (DTU)',
              degree: 'B.Tech',
              fieldOfStudy: 'Computer Engineering',
              currentYear: '3rd Year',
              passingYear: '2027',
              uid: fbUser.uid,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'students', fbUser.uid), demoProfile);
          } catch (createError) {
            throw authError; // fall through if already exists or fails
          }
        } else {
          throw authError;
        }
      }

      if (!fbUser) {
        throw new Error('Could not resolve authenticated user.');
      }

      // Load additional user profiling metrics from Firestore
      let profileData: StudentUser = {
        id: fbUser.uid,
        fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Invigo Student',
        email: fbUser.email || trimmedEmail,
        phone: fbUser.phoneNumber || '',
        collegeName: '',
        degree: 'B.Tech',
        fieldOfStudy: '',
        currentYear: '1st Year',
        passingYear: '2028'
      };

      try {
        const userDocRef = doc(db, 'students', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const fetchedData = userDocSnap.data();
          profileData = {
            id: fbUser.uid,
            fullName: fetchedData.fullName || profileData.fullName,
            email: fetchedData.email || profileData.email,
            phone: fetchedData.phone || profileData.phone,
            collegeName: fetchedData.collegeName || '',
            degree: fetchedData.degree || 'B.Tech',
            fieldOfStudy: fetchedData.fieldOfStudy || '',
            currentYear: fetchedData.currentYear || '1st Year',
            passingYear: fetchedData.passingYear || '2028'
          };
        } else {
          // If Firestore is empty/unconfigured, fall back to check if they have local profile
          const users = getRegisteredUsers();
          const localMatch = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
          if (localMatch) {
            profileData = {
              id: fbUser.uid,
              fullName: localMatch.fullName,
              email: localMatch.email,
              phone: localMatch.phone,
              collegeName: localMatch.collegeName,
              degree: localMatch.degree,
              fieldOfStudy: localMatch.fieldOfStudy,
              currentYear: localMatch.currentYear,
              passingYear: localMatch.passingYear
            };
            // Sync local profile metadata back up to Firestore
            await setDoc(userDocRef, { ...localMatch, uid: fbUser.uid });
          }
        }
      } catch (docErr) {
        console.warn('Could not load user profile from Firestore:', docErr);
      }

      // Success
      setSuccessMsg('Signed in successfully with Firebase!');
      setTimeout(() => {
        onLoginSuccess(profileData);
        setIsLoading(false);
        // If there was a pre-selected course, go straight to the enrollment wizard
        if (preselectedDomainId) {
          setCurrentTab('enroll');
        } else {
          setCurrentTab('nexus');
        }
      }, 800);

    } catch (err: any) {
      console.error('Firebase sign in error:', err);
      let errorText = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorText = 'Incorrect password or email. Please check your credentials and try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorText = 'No account found with this email. Please check spelling or create an account.';
      } else if (err.code === 'auth/invalid-email') {
        errorText = 'Please enter a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsAuthNotAllowed(true);
        errorText = 'Firebase Authentication: Email/Password login is not enabled in this project yet. Please enable it in your Firebase console under Authentication > Sign-in method.';
      } else if (err.message) {
        errorText = `${err.message}`;
      }
      setErrorMsg(errorText);
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsAuthNotAllowed(false);

    const trimmedEmail = registerEmail.trim().toLowerCase();

    if (!fullName.trim() || !trimmedEmail || !phone.trim() || !registerPassword.trim()) {
      setErrorMsg('All fields are required. Please fill them out.');
      return;
    }

    if (phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMsg('Your password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create user in Firebase auth
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, registerPassword);
      const fbUser = userCredential.user;

      // 2. Prepare Profile Metadata
      const newUserProfile = {
        fullName: fullName.trim(),
        email: trimmedEmail,
        phone: phone.trim(),
        collegeName: '',
        degree: 'B.Tech' as const,
        fieldOfStudy: '',
        currentYear: '1st Year',
        passingYear: '2028',
        uid: fbUser.uid,
        createdAt: new Date().toISOString()
      };

      // 3. Write User metadata to Firestore students collection
      try {
        const userDocRef = doc(db, 'students', fbUser.uid);
        await setDoc(userDocRef, newUserProfile);
      } catch (err: any) {
        console.warn('Failed to save profile in Firestore:', err);
      }

      // Local storage fallback for maximum safety
      try {
        const users = getRegisteredUsers();
        const updatedUsers = [...users, { ...newUserProfile, id: fbUser.uid, password: registerPassword }];
        localStorage.setItem('invigo_registered_students', JSON.stringify(updatedUsers));
      } catch (lsErr) {
        console.warn('Could not persist registration account locally:', lsErr);
      }

      setSuccessMsg('Account registered successfully under your Firebase project!');
      setIsLoading(false);
      
      // Auto toggle back to login tab and prefill
      setTimeout(() => {
        setLoginEmail(trimmedEmail);
        setLoginPassword(registerPassword);
        setIsLoginTab(true);
        setSuccessMsg('');
      }, 1500);

    } catch (err: any) {
      console.error('Firebase registration error:', err);
      let errorText = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorText = 'An account with this email already exists inside Firebase. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        errorText = 'The password is too weak. Please pick a stronger password (min 6 chars).';
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsAuthNotAllowed(true);
        errorText = 'Firebase Authentication: Email/Password login is not enabled in this project yet. Please enable it in your Firebase console under Authentication > Sign-in method.';
      } else if (err.message) {
        errorText = `${err.message}`;
      }
      setErrorMsg(errorText);
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setLoginEmail('priyanshu@university.edu');
    setLoginPassword('password123');
    setIsLoginTab(true);
  };

  return (
    <div className="py-12 bg-transparent text-slate-850 min-h-[700px] flex items-center font-sans">
      <div className="mx-auto max-w-md w-full px-4 sm:px-6 space-y-8">
        
        {/* Header with Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 bg-white shadow-sm">
            <img src="/logo.jpg" alt="Invigo Infotech" className="h-14 w-14 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            {isLoginTab ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
            {isLoginTab 
              ? 'Sign in to register for online internship courses and read project sheets.' 
              : 'Join our academic learner community to get your free verified certificates.'}
          </p>
        </div>

        {/* Segmented Switcher Control */}
        <div className="flex justify-center">
          <div className="bg-slate-50 border border-slate-200 p-1 rounded-full flex gap-1 w-full max-w-[300px]">
            <button
              onClick={() => {
                setIsLoginTab(true);
                setErrorMsg('');
                setSuccessMsg('');
                setIsAuthNotAllowed(false);
              }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isLoginTab
                  ? 'bg-blue-650 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                setIsLoginTab(false);
                setErrorMsg('');
                setSuccessMsg('');
                setIsAuthNotAllowed(false);
              }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isLoginTab
                  ? 'bg-blue-650 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Auth Body Card */}
        <div className="bg-white border border-slate-205 rounded-[1.8rem] p-6 sm:p-8 shadow-sm space-y-6">
          
          {errorMsg && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-150 text-xs text-rose-800 font-bold flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-ping" />
                <span>{errorMsg}</span>
              </div>
              {isAuthNotAllowed && (
                <div className="border border-slate-200 bg-slate-50 p-4 rounded-2xl space-y-3 text-slate-705 text-xs shadow-xs">
                  <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-650 animate-pulse" />
                    <span>How to enable Authentication Providers:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 ml-1 leading-relaxed text-slate-600">
                    <li>Go to your <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId || 'your-firebase-project'}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="text-blue-650 underline font-extrabold hover:text-blue-800">Firebase console</a>.</li>
                    <li>Select <strong>Authentication</strong> &rarr; click <strong>Sign-in method</strong> tab.</li>
                    <li>Click <strong>Add new provider</strong> (or edit <strong>Email/Password</strong> and <strong>Google</strong>).</li>
                    <li>Toggle the <strong>Enable</strong> switch to ON, then click <strong>Save</strong>.</li>
                    <li>Once saved, come back here and try again!</li>
                  </ol>
                  <a
                    href={`https://console.firebase.google.com/project/${auth.app.options.projectId || 'your-firebase-project'}/authentication/providers`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center p-2.5 bg-blue-650 hover:bg-blue-700 text-white font-bold text-center text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Open Sign-in Providers Console &rarr;
                  </a>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-150 text-xs text-emerald-800 font-bold flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-650 shrink-0 mt-0.5 animate-pulse" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign-In Button — shown on both login and register tabs */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {isLoginTab ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. Priyanshu@university.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-10 pr-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Access Dashboard</span>
                  </>
                )}
              </button>



            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Priyanshu Ranjan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. student@university.edu"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Contact Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
                  />
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="A secure password (min 6 chars)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-10 pr-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Register Account</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
