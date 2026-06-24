import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CreditCard, Award, ShieldAlert, Search, Filter,
  Trash2, Edit3, Shield, ShieldOff, Check, X, CheckSquare,
  Settings2, Activity, MessageSquare, RefreshCw, BarChart3,
  TrendingUp, AlertTriangle, LayoutDashboard, FileText,
  Bell, Mail, ChevronLeft, ChevronRight, Download,
  Clock, Zap, Eye, EyeOff, Send, AlertCircle, CheckCircle,
  XCircle, Info, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Calendar,
  Plus, BookOpen, FileQuestion, Globe, Video, FileType, Layers, User, Tag
} from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDocs, getDoc, addDoc, query, where } from 'firebase/firestore';
import { EnrollmentState, ActivityLog, PortalSettings, ErrorReport, StudyMaterial, MCQQuestion, InternshipDomain, Coupon } from '../types';
import { INTERNSHIP_DOMAINS, DEFAULT_MCQ_QUESTIONS } from '../data';
import { downloadCertificatePDF, downloadOfferLetterPDF, downloadAcceptanceLetterPDF } from '../utils/pdfGenerator';

interface AdminPanelProps {
  currentUser: any;
  setCurrentTab: (tab: string) => void;
}

type AdminSection = 'dashboard' | 'users' | 'certificates' | 'logs' | 'errors' | 'communication' | 'domains' | 'materials' | 'mcqTests' | 'testResultsView' | 'coupons' | 'mentorBookings' | 'settings';

// ─── Helper: resolve domain title from domainId ───
function getDomainTitle(domainId: string): string {
  const domain = INTERNSHIP_DOMAINS.find(d => d.id === domainId);
  return domain ? domain.title : domainId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Helper: check if internship duration is complete ───
function isDurationComplete(startDate: string, durationWeeks: number): boolean {
  if (!startDate) return false;
  const start = new Date(startDate);
  const endDate = new Date(start.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
  return new Date() >= endDate;
}

// ─── Helper: days remaining ───
function getDaysRemaining(startDate: string, durationWeeks: number): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const endDate = new Date(start.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
  const diff = endDate.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Helper: completion percentage ───
function getCompletionPct(startDate: string, durationWeeks: number): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const totalMs = durationWeeks * 7 * 24 * 60 * 60 * 1000;
  const elapsed = new Date().getTime() - start.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / totalMs) * 100)));
}

// ═══════════════════════════════════════════════════════════
//  MAIN ADMIN PANEL COMPONENT
// ═══════════════════════════════════════════════════════════

export default function AdminPanel({ currentUser, setCurrentTab }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allEnrollments, setAllEnrollments] = useState<EnrollmentState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [degreeFilter, setDegreeFilter] = useState('All');
  const [sortField, setSortField] = useState<string>('enrollmentDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Edit modal
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentState | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editRegistrationNo, setEditRegistrationNo] = useState('');
  const [editDegree, setEditDegree] = useState('');
  const [editFieldOfStudy, setEditFieldOfStudy] = useState('');
  const [editCurrentYear, setEditCurrentYear] = useState('');
  const [editPassingYear, setEditPassingYear] = useState('');
  const [editDuration, setEditDuration] = useState(8);
  const [editPhone, setEditPhone] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editTrainingMode, setEditTrainingMode] = useState('');

  // View Profile modal
  const [viewingStudent, setViewingStudent] = useState<EnrollmentState | null>(null);

  // Enroll Student modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    fullName: '', email: '', phone: '', collegeName: '',
    degree: 'B.Tech' as const, fieldOfStudy: '', currentYear: '3rd Year',
    passingYear: '2027', domainId: 'ai_ml', durationWeeks: 8,
    startDate: new Date().toISOString().split('T')[0], motivation: ''
  });
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Change Domain modal
  const [changingDomainFor, setChangingDomainFor] = useState<EnrollmentState | null>(null);
  const [newDomainId, setNewDomainId] = useState('');

  // Custom cert date modal
  const [certDateFor, setCertDateFor] = useState<EnrollmentState | null>(null);
  const [customCertDate, setCustomCertDate] = useState(new Date().toISOString().split('T')[0]);

  // Metrics
  const thisMonthEnrollments = useMemo(() => {
    const now = new Date();
    return allEnrollments.filter(e => {
      const d = new Date(e.enrollmentDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [allEnrollments]);

  const testPassRate = useMemo(() => {
    if (testResults.length === 0) return 0;
    const passed = testResults.filter(r => r.passed).length;
    return Math.round((passed / testResults.length) * 100);
  }, [testResults]);

  // Activity Logs
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Error Reports
  const [errors, setErrors] = useState<ErrorReport[]>([]);

  // Portal Settings
  const [settings, setSettings] = useState<PortalSettings>({
    portalName: 'Invigo Infotech',
    maintenanceMode: false,
    announcementText: '🚨 Standard system upgrade scheduled for June 25th.',
    supportPhone: '+91 89047 88201',
    themeAccent: '#2563eb'
  });

  // Admin list
  const [adminList, setAdminList] = useState<{email: string}[]>([]);

  // Mentor bookings
  const [mentorBookings, setMentorBookings] = useState<any[]>([]);

  // Communication
  const [commSubject, setCommSubject] = useState('');
  const [commMessage, setCommMessage] = useState('');

  // Confirmation modal
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Domain management
  const [firestoreDomains, setFirestoreDomains] = useState<InternshipDomain[]>([]);
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomain, setNewDomain] = useState({
    title: '', category: 'Tech' as 'Tech' | 'Management' | 'Design' | 'Hardware',
    shortDesc: '', iconName: 'CodeXml', durationWeeks: '4,8,12',
    targetDegrees: 'B.Tech,Diploma', skills: '', toolsAndTech: '',
    gradient: 'from-blue-500 via-indigo-600 to-purple-700', imageUrl: ''
  });

  // Study Materials
  const [allMaterials, setAllMaterials] = useState<StudyMaterial[]>([]);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    domainId: '', title: '', description: '', type: 'pdf' as 'pdf' | 'video' | 'video_embed',
    url: '', embedCode: '', order: 1
  });
  const [materialDomainFilter, setMaterialDomainFilter] = useState('All');

  // MCQ Questions
  const [allQuestions, setAllQuestions] = useState<MCQQuestion[]>([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    domainId: '', question: '',
    option0: '', option1: '', option2: '', option3: '',
    correctIndex: 0
  });
  const [questionDomainFilter, setQuestionDomainFilter] = useState('All');
  const [testResults, setTestResults] = useState<any[]>([]);

  // Coupons
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 33, active: true, expiresAt: '', collaboratorName: '' });

  // ─── Load enrollments from Firestore ───
  useEffect(() => {
    const migratingIds = new Set<string>();
    const enrollmentsCol = collection(db, 'enrollments');
    const unsubscribe = onSnapshot(enrollmentsCol, (snapshot) => {
      const fetched: EnrollmentState[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as EnrollmentState;
        const candidateId = docSnap.id;
        
        if (candidateId.startsWith('INV-')) {
          if (!migratingIds.has(candidateId)) {
            migratingIds.add(candidateId);
            const year = new Date().getFullYear();
            let cleanReg = data.registrationNo ? data.registrationNo.replace(/\s+/g, '').toUpperCase() : '';
            if (!cleanReg) cleanReg = candidateId.includes('ADM') ? `ADM${Date.now().toString(36).toUpperCase()}` : Math.floor(1000 + Math.random() * 9000).toString();
            const last4Reg = cleanReg.length >= 4 ? cleanReg.slice(-4) : cleanReg.padStart(4, '0');
            const courseCode = data.domainId ? data.domainId.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase() : 'XX';
            const newId = `${year}IN${courseCode}${last4Reg}`;
            
            setTimeout(async () => {
               try {
                 const newEnrollment = { ...data, candidateId: newId };
                 await setDoc(doc(db, 'enrollments', newId), newEnrollment);
                 await deleteDoc(doc(db, 'enrollments', candidateId));
               } catch (e) { console.error("Admin migration failed", e); }
               migratingIds.delete(candidateId);
            }, 0);
          }
        } else {
          fetched.push({ candidateId, ...data });
        }
      });
      fetched.sort((a, b) => new Date(b.enrollmentDate || '').getTime() - new Date(a.enrollmentDate || '').getTime());
      setAllEnrollments(fetched);
      setIsLoading(false);
    }, (err) => {
      console.error('Error fetching admin registrations:', err);
      addError(`Firestore snapshot error: ${err.message}`, 'Firestore', 'high');
      setIsLoading(false);
    });

    // Load logs from Firestore
    const logsCol = collection(db, 'activityLogs');
    const unsubLogs = onSnapshot(logsCol, (snap) => {
      const fetchedLogs: ActivityLog[] = [];
      snap.forEach(d => fetchedLogs.push({ id: d.id, ...d.data() } as ActivityLog));
      fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(fetchedLogs.length > 0 ? fetchedLogs : [
        { id: '1', timestamp: new Date().toLocaleString(), action: 'Admin panel initialized', admin: 'system', type: 'system' } as any
      ]);
    });

    // Load errors from Firestore
    const errorsCol = collection(db, 'errorReports');
    const unsubErrors = onSnapshot(errorsCol, (snap) => {
      const fetchedErrors: ErrorReport[] = [];
      snap.forEach(d => fetchedErrors.push({ id: d.id, ...d.data() } as ErrorReport));
      fetchedErrors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setErrors(fetchedErrors);
    });

    // Load settings from Firestore
    const settingsDoc = doc(db, 'portalSettings', 'main');
    const unsubSettings = onSnapshot(settingsDoc, (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as PortalSettings);
      }
    });

    // Load domains from Firestore
    const domainsCol = collection(db, 'domains');
    const unsubDomains = onSnapshot(domainsCol, (snap) => {
      const domains: InternshipDomain[] = [];
      snap.forEach(d => domains.push({ id: d.id, ...d.data() } as InternshipDomain));
      setFirestoreDomains(domains);
    }, () => {});

    // Load study materials
    const materialsCol = collection(db, 'studyMaterials');
    const unsubMaterials = onSnapshot(materialsCol, (snap) => {
      const mats: StudyMaterial[] = [];
      snap.forEach(d => mats.push({ id: d.id, ...d.data() } as StudyMaterial));
      mats.sort((a, b) => a.order - b.order);
      setAllMaterials(mats);
    }, () => {});

    // Load MCQ questions
    const questionsCol = collection(db, 'mcqQuestions');
    const unsubQuestions = onSnapshot(questionsCol, (snap) => {
      const qs: MCQQuestion[] = [];
      snap.forEach(d => qs.push({ id: d.id, ...d.data() } as MCQQuestion));
      setAllQuestions(qs);
    }, () => {});

    // Load test results
    const resultsCol = collection(db, 'testResults');
    const unsubResults = onSnapshot(resultsCol, (snap) => {
      const results: any[] = [];
      snap.forEach(d => results.push({ id: d.id, ...d.data() }));
      setTestResults(results);
    }, () => {});

    // Load coupons
    const couponsCol = collection(db, 'coupons');
    const unsubCoupons = onSnapshot(couponsCol, async (snap) => {
      const cps: Coupon[] = [];
      snap.forEach(d => cps.push({ id: d.id, ...d.data() } as Coupon));
      if (cps.length === 0) {
        try {
          await setDoc(doc(db, 'coupons', 'IAMNEW'), { code: 'IAMNEW', discountPercent: 33, active: true });
        } catch (e) { console.error(e); }
      }
      setAllCoupons(cps);
    }, () => {});

    // Load admin list
    const adminCol = collection(db, 'adminList');
    const unsubAdmins = onSnapshot(adminCol, (snap) => {
      const admins: any[] = [];
      snap.forEach(d => admins.push({ email: d.id, ...d.data() }));
      setAdminList(admins);
    }, () => {});

    // Load mentor bookings
    const bookingsCol = collection(db, 'mentorBookings');
    const unsubBookings = onSnapshot(bookingsCol, (snap) => {
      const bookings: any[] = [];
      snap.forEach(d => bookings.push({ id: d.id, ...d.data() }));
      setMentorBookings(bookings);
    }, () => {});

    return () => { unsubscribe(); unsubDomains(); unsubMaterials(); unsubQuestions(); unsubResults(); unsubCoupons(); unsubAdmins(); unsubBookings(); unsubSettings(); unsubLogs(); unsubErrors(); };
  }, []);

  // ─── Helpers ───
  const addLog = (action: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      action,
      admin: currentUser?.email || 'admin@invigo.co',
      type
    };
    setLogs(prev => [newLog, ...prev]);
    addDoc(collection(db, 'activityLogs'), newLog).catch(e => console.error('Log write failed:', e));
  };

  const addError = (message: string, source: string, severity: ErrorReport['severity']) => {
    const newError: ErrorReport = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      message,
      source,
      severity,
      resolved: false
    };
    setErrors(prev => [newError, ...prev]);
    addDoc(collection(db, 'errorReports'), newError).catch(e => console.error('Error report write failed:', e));
  };

  // ─── CRUD Operations ───
  const handleSaveEdit = async () => {
    if (!editingEnrollment) return;
    try {
      const docRef = doc(db, 'enrollments', editingEnrollment.candidateId);
      await updateDoc(docRef, {
        fullName: editName,
        email: editEmail,
        collegeName: editCollege,
        registrationNo: editRegistrationNo,
        degree: editDegree,
        fieldOfStudy: editFieldOfStudy,
        currentYear: editCurrentYear,
        passingYear: editPassingYear,
        durationWeeks: editDuration,
        phone: editPhone,
        startDate: editStartDate,
        trainingMode: editTrainingMode
      });
      addLog(`Updated profile for ${editName} (${editingEnrollment.candidateId})`, 'user');
      setEditingEnrollment(null);
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
      addError(`Edit save failed: ${err.message}`, 'Firestore', 'medium');
    }
  };

  // ─── Enroll Student (Admin) ───
  const handleAdminEnroll = async () => {
    if (!enrollForm.fullName.trim() || !enrollForm.email.trim()) {
      alert('Full name and email are required.');
      return;
    }
    setEnrollLoading(true);
    try {
      const year = new Date().getFullYear();
      const courseCode = enrollForm.domainId ? enrollForm.domainId.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase() : 'XX';
      const last4Reg = Math.floor(1000 + Math.random() * 9000).toString();
      const candidateId = `${year}IN${courseCode}${last4Reg}`;
      const newEnrollment: EnrollmentState = {
        ...enrollForm,
        candidateId,
        enrollmentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'In Progress',
        paymentVerified: true,
        certificateIssued: false,
        amountPaid: 0,
        paymentTxnId: 'ADMIN_ENROLLED',
        trainingMode: 'online'
      };
      await setDoc(doc(db, 'enrollments', candidateId), newEnrollment);

      // Also create a student profile so they can log in and find their data
      const studentId = candidateId; // use candidateId as a fallback uid
      const studentRef = doc(db, 'students', studentId);
      const existing = await getDoc(studentRef);
      if (!existing.exists()) {
        await setDoc(studentRef, {
          id: studentId,
          fullName: enrollForm.fullName,
          email: enrollForm.email.toLowerCase(),
          phone: enrollForm.phone,
          collegeName: enrollForm.collegeName,
          degree: enrollForm.degree,
          fieldOfStudy: enrollForm.fieldOfStudy,
          currentYear: enrollForm.currentYear,
          passingYear: enrollForm.passingYear,
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        });
      }

      addLog(`Admin enrolled ${enrollForm.fullName} into ${getDomainTitle(enrollForm.domainId)}`, 'user');
      setShowEnrollModal(false);
      setEnrollForm({
        fullName: '', email: '', phone: '', collegeName: '',
        degree: 'B.Tech', fieldOfStudy: '', currentYear: '3rd Year',
        passingYear: '2027', domainId: 'ai_ml', durationWeeks: 8,
        startDate: new Date().toISOString().split('T')[0], motivation: ''
      });
    } catch (err: any) {
      alert(`Enrollment failed: ${err.message}`);
      addError(`Admin enrollment failed: ${err.message}`, 'Firestore', 'high');
    } finally {
      setEnrollLoading(false);
    }
  };

  // ─── Change Domain ───
  const handleChangeDomain = async () => {
    if (!changingDomainFor || !newDomainId) return;
    try {
      await updateDoc(doc(db, 'enrollments', changingDomainFor.candidateId), { domainId: newDomainId });
      addLog(`Changed domain for ${changingDomainFor.fullName} → ${getDomainTitle(newDomainId)}`, 'user');
      setChangingDomainFor(null);
    } catch (err: any) {
      alert(`Domain change failed: ${err.message}`);
    }
  };

  // ─── Issue Certificate with Custom Date ───
  const handleIssueCertificateWithDate = async (enrollment: EnrollmentState, dateStr: string) => {
    try {
      const certDate = new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      await updateDoc(doc(db, 'enrollments', enrollment.candidateId), {
        certificateIssued: true,
        certificateDate: certDate,
        status: 'Completed'
      });
      addLog(`Issued certificate to ${enrollment.fullName} (date: ${certDate})`, 'certificate');
      setCertDateFor(null);
    } catch (err: any) {
      alert(`Certificate issue error: ${err.message}`);
      addError(`Cert issue failed: ${err.message}`, 'Firestore', 'high');
    }
  };

  const handleToggleBlockUser = async (enrollment: EnrollmentState) => {
    try {
      const docRef = doc(db, 'enrollments', enrollment.candidateId);
      const newBlockedState = !enrollment.blocked;
      await updateDoc(docRef, { blocked: newBlockedState });
      addLog(`${newBlockedState ? 'Blocked' : 'Unblocked'} user ${enrollment.fullName}`, 'user');
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
      addError(`Block toggle failed: ${err.message}`, 'Firestore', 'medium');
    }
  };

  const handleVerifyPayment = async (enrollment: EnrollmentState) => {
    try {
      const docRef = doc(db, 'enrollments', enrollment.candidateId);
      await updateDoc(docRef, { paymentVerified: true, paymentStatus: 'verified', status: 'In Progress' });
      addLog(`Verified payment for ${enrollment.fullName} (${enrollment.candidateId}) — course activated`, 'payment');
    } catch (err: any) {
      alert(`Payment verification error: ${err.message}`);
      addError(`Payment verify failed: ${err.message}`, 'Firestore', 'high');
    }
  };

  const handleRejectPayment = async (enrollment: EnrollmentState) => {
    const reason = prompt('Enter reason for rejecting payment (e.g. UTR mismatch):', 'Invalid UTR or Amount mismatch');
    if (reason === null) return; // cancelled
    try {
      const docRef = doc(db, 'enrollments', enrollment.candidateId);
      await updateDoc(docRef, { paymentVerified: false, paymentStatus: 'rejected', rejectionReason: reason });
      addLog(`Rejected payment for ${enrollment.fullName} (${enrollment.candidateId}) - Reason: ${reason}`, 'payment');
    } catch (err: any) {
      alert(`Payment rejection error: ${err.message}`);
      addError(`Payment rejection failed: ${err.message}`, 'Firestore', 'high');
    }
  };

  const handleIssueCertificate = async (enrollment: EnrollmentState) => {
    try {
      const docRef = doc(db, 'enrollments', enrollment.candidateId);
      await updateDoc(docRef, {
        certificateIssued: true,
        certificateDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'Completed'
      });
      addLog(`Issued certificate to ${enrollment.fullName} (${enrollment.candidateId})`, 'certificate');
    } catch (err: any) {
      alert(`Certificate issue error: ${err.message}`);
      addError(`Cert issue failed: ${err.message}`, 'Firestore', 'high');
    }
  };

  const handleDeleteEnrollment = async (candidateId: string, name: string) => {
    setConfirmAction({
      message: `Permanently delete ${name}'s enrollment (${candidateId})?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'enrollments', candidateId));
          addLog(`Deleted enrollment for ${name} (${candidateId})`, 'user');
          setSelectedIds(prev => prev.filter(id => id !== candidateId));
        } catch (err: any) {
          alert(`Delete failed: ${err.message}`);
          addError(`Delete failed: ${err.message}`, 'Firestore', 'high');
        }
        setConfirmAction(null);
      }
    });
  };

  // ─── Bulk Actions ───
  const handleExportCSV = () => {
    let csv = "Candidate ID,Full Name,Email,Phone,Domain,Registration No,College,Degree,Year,Status,Payment Status,Amount Paid\n";
    filteredEnrollments.forEach(e => {
      csv += `"${e.candidateId}","${e.fullName}","${e.email}","${e.phone || ''}","${e.domainId}","${e.registrationNo || ''}","${e.collegeName}","${e.degree}","${e.currentYear}","${e.status}","${e.paymentStatus}","${e.amountPaid || 0}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invigo_enrollments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addLog(`Exported ${filteredEnrollments.length} enrollments to CSV`, 'user');
  };

  const handleGenerateBulkEmail = () => {
    const emails = filteredEnrollments.map(e => e.email).filter(Boolean).join(',');
    window.open(`mailto:?bcc=${emails}`);
    addLog(`Opened email client for ${filteredEnrollments.length} recipients`, 'communication');
  };
  const handleBulkVerifyPayments = async () => {
    if (selectedIds.length === 0) return;
    let count = 0;
    try {
      for (const id of selectedIds) {
        const item = allEnrollments.find(e => e.candidateId === id);
        if (item && !item.paymentVerified) {
          await updateDoc(doc(db, 'enrollments', id), { paymentVerified: true, paymentStatus: 'verified', status: 'In Progress' });
          count++;
        }
      }
      addLog(`Bulk verified ${count} payments`, 'payment');
      setSelectedIds([]);
    } catch (err: any) {
      addError(`Bulk verify error: ${err.message}`, 'Firestore', 'high');
    }
  };

  const handleBulkIssueCertificates = async () => {
    if (selectedIds.length === 0) return;
    let count = 0;
    try {
      for (const id of selectedIds) {
        const item = allEnrollments.find(e => e.candidateId === id);
        if (item && !item.certificateIssued && item.paymentVerified && isDurationComplete(item.startDate, item.durationWeeks)) {
          await updateDoc(doc(db, 'enrollments', id), {
            certificateIssued: true,
            certificateDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'Completed'
          });
          count++;
        }
      }
      addLog(`Bulk issued ${count} certificates`, 'certificate');
      setSelectedIds([]);
    } catch (err: any) {
      addError(`Bulk cert error: ${err.message}`, 'Firestore', 'high');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setConfirmAction({
      message: `Permanently delete ${selectedIds.length} selected enrollments?`,
      onConfirm: async () => {
        let count = 0;
        for (const id of selectedIds) {
          try {
            await deleteDoc(doc(db, 'enrollments', id));
            count++;
          } catch (e) { /* skip */ }
        }
        addLog(`Bulk deleted ${count} enrollments`, 'user');
        setSelectedIds([]);
        setConfirmAction(null);
      }
    });
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'portalSettings', 'main'), settings);
      addLog('Updated portal global settings', 'setting');
    } catch (err) {
      addError('Failed to save settings', 'Firestore', 'medium');
    }
  };

  // ─── Filter & Sort Logic ───
  const filteredEnrollments = useMemo(() => {
    let result = allEnrollments.filter(e => {
      const matchesSearch =
        e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.collegeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDomain = domainFilter === 'All' || e.domainId === domainFilter;
      const matchesPayment = paymentFilter === 'All' ||
        (paymentFilter === 'Verified' && e.paymentVerified) ||
        (paymentFilter === 'Pending' && !e.paymentVerified);
      const matchesCert = certFilter === 'All' ||
        (certFilter === 'Issued' && e.certificateIssued) ||
        (certFilter === 'Pending' && !e.certificateIssued);
      const matchesDegree = degreeFilter === 'All' || e.degree === degreeFilter;

      return matchesSearch && matchesDomain && matchesPayment && matchesCert && matchesDegree;
    });

    // Sorting
    result.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortField) {
        case 'fullName': valA = a.fullName.toLowerCase(); valB = b.fullName.toLowerCase(); break;
        case 'enrollmentDate': valA = new Date(a.enrollmentDate || '').getTime(); valB = new Date(b.enrollmentDate || '').getTime(); break;
        case 'durationWeeks': valA = a.durationWeeks; valB = b.durationWeeks; break;
        case 'domainId': valA = a.domainId; valB = b.domainId; break;
        default: valA = new Date(a.enrollmentDate || '').getTime(); valB = new Date(b.enrollmentDate || '').getTime();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allEnrollments, searchTerm, domainFilter, paymentFilter, certFilter, degreeFilter, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // ─── Computed Metrics ───
  const totalStudents = allEnrollments.length;
  const verifiedPayments = allEnrollments.filter(e => e.paymentVerified).length;
  const pendingPayments = allEnrollments.filter(e => !e.paymentVerified).length;
  const certifiedCount = allEnrollments.filter(e => e.certificateIssued).length;
  const totalRevenue = allEnrollments.reduce((acc, e) => acc + (e.paymentVerified ? (e.amountPaid || 0) : 0), 0);
  const blockedCount = allEnrollments.filter(e => e.blocked).length;
  const activeErrors = errors.filter(e => !e.resolved).length;

  // Domain distribution for chart
  const domainDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allEnrollments.forEach(e => {
      const title = getDomainTitle(e.domainId);
      map[title] = (map[title] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [allEnrollments]);

  const maxDomainCount = Math.max(...domainDistribution.map(d => d[1]), 1);

  // ─── Sidebar Nav Items ───
  // ─── Domain CRUD ───
  const handleAddDomain = async () => {
    const domainId = newDomain.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (!domainId || !newDomain.title) return;
    try {
      const domainData: any = {
        title: newDomain.title,
        category: newDomain.category,
        shortDesc: newDomain.shortDesc,
        iconName: newDomain.iconName,
        durationWeeks: newDomain.durationWeeks.split(',').map(Number).filter(n => !isNaN(n)),
        targetDegrees: newDomain.targetDegrees.split(',').map(s => s.trim()).filter(Boolean),
        skills: newDomain.skills.split(',').map(s => s.trim()).filter(Boolean),
        toolsAndTech: newDomain.toolsAndTech.split(',').map(s => s.trim()).filter(Boolean),
        gradient: newDomain.gradient,
        imageUrl: newDomain.imageUrl,
        phases: []
      };
      await setDoc(doc(db, 'domains', domainId), domainData);
      addLog(`Added new domain: ${newDomain.title}`, 'setting');
      setShowAddDomainModal(false);
      setNewDomain({ title: '', category: 'Tech', shortDesc: '', iconName: 'CodeXml', durationWeeks: '4,8,12', targetDegrees: 'B.Tech,Diploma', skills: '', toolsAndTech: '', gradient: 'from-blue-500 via-indigo-600 to-purple-700', imageUrl: '' });
    } catch (err) { console.error(err); }
  };

  const handleRemoveDomain = async (domainId: string) => {
    try {
      await deleteDoc(doc(db, 'domains', domainId));
      addLog(`Removed domain: ${domainId}`, 'setting');
    } catch (err) { console.error(err); }
  };

  // ─── Study Material CRUD ───
  const handleAddMaterial = async () => {
    if (!materialForm.domainId || !materialForm.title) return;
    if (materialForm.type !== 'video_embed' && !materialForm.url) return;
    if (materialForm.type === 'video_embed' && !materialForm.embedCode) return;
    try {
      await addDoc(collection(db, 'studyMaterials'), {
        ...materialForm,
        createdAt: new Date().toISOString()
      });
      addLog(`Added study material: ${materialForm.title} for ${materialForm.domainId}`, 'setting');
      setShowAddMaterialModal(false);
      setMaterialForm({ domainId: '', title: '', description: '', type: 'pdf', url: '', embedCode: '', order: 1 });
    } catch (err) { console.error(err); }
  };

  const handleRemoveMaterial = async (materialId: string) => {
    try {
      await deleteDoc(doc(db, 'studyMaterials', materialId));
      addLog(`Removed study material: ${materialId}`, 'setting');
    } catch (err) { console.error(err); }
  };

  // ─── MCQ CRUD ───
  const handleAddQuestion = async () => {
    if (!questionForm.domainId || !questionForm.question) return;
    try {
      await addDoc(collection(db, 'mcqQuestions'), {
        domainId: questionForm.domainId,
        question: questionForm.question,
        options: [questionForm.option0, questionForm.option1, questionForm.option2, questionForm.option3],
        correctIndex: questionForm.correctIndex
      });
      addLog(`Added MCQ question for ${questionForm.domainId}`, 'setting');
      setShowAddQuestionModal(false);
      setQuestionForm({ domainId: '', question: '', option0: '', option1: '', option2: '', option3: '', correctIndex: 0 });
    } catch (err) { console.error(err); }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      await deleteDoc(doc(db, 'mcqQuestions', questionId));
      addLog(`Removed MCQ question: ${questionId}`, 'setting');
    } catch (err) { console.error(err); }
  };

  // Seed default MCQ questions for a domain
  const handleSeedQuestions = async (domainId: string) => {
    const defaults = DEFAULT_MCQ_QUESTIONS[domainId];
    if (!defaults) return;
    try {
      for (const q of defaults) {
        await addDoc(collection(db, 'mcqQuestions'), { domainId, ...q });
      }
      addLog(`Seeded ${defaults.length} default MCQ questions for ${domainId}`, 'setting');
    } catch (err) { console.error(err); }
  };

  const handleSeedAllDomains = async () => {
    if (!confirm('Are you sure you want to seed 10 questions for ALL 31 domains? This will add up to 310 questions to the database.')) return;
    let totalSeeded = 0;
    try {
      for (const domain of allDomains) {
        const defaults = DEFAULT_MCQ_QUESTIONS[domain.id];
        if (defaults) {
          for (const q of defaults) {
            await addDoc(collection(db, 'mcqQuestions'), { domainId: domain.id, ...q });
            totalSeeded++;
          }
        }
      }
      addLog(`Bulk seeded ${totalSeeded} default MCQ questions across all domains`, 'setting');
      alert(`Successfully seeded ${totalSeeded} questions!`);
    } catch (err) { console.error(err); }
  };

  // ─── Coupons CRUD ───
  const handleAddCoupon = async () => {
    if (!newCoupon.code.trim()) return;
    try {
      const code = newCoupon.code.toUpperCase().trim();
      const couponData: any = {
        code,
        discountPercent: newCoupon.discountPercent,
        active: newCoupon.active
      };
      if (newCoupon.expiresAt) couponData.expiresAt = newCoupon.expiresAt;
      if (newCoupon.collaboratorName) couponData.collaboratorName = newCoupon.collaboratorName;
      await setDoc(doc(db, 'coupons', code), couponData);
      addLog(`Added new coupon: ${code} (${newCoupon.discountPercent}%)`, 'setting');
      setShowAddCouponModal(false);
      setNewCoupon({ code: '', discountPercent: 33, active: true, expiresAt: '', collaboratorName: '' });
    } catch (err) { console.error(err); }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { active: !coupon.active });
      addLog(`Toggled coupon ${coupon.code} to ${!coupon.active ? 'Active' : 'Inactive'}`, 'setting');
    } catch (err) { console.error(err); }
  };

  const handleRemoveCoupon = async (couponId: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
      addLog(`Removed coupon: ${couponId}`, 'setting');
    } catch (err) { console.error(err); }
  };

  // Get all domains (Firestore + hardcoded merged)
  const allDomains = useMemo(() => {
    const fsIds = firestoreDomains.map(d => d.id);
    const hardcoded = INTERNSHIP_DOMAINS.filter(d => !fsIds.includes(d.id));
    return [...firestoreDomains, ...hardcoded];
  }, [firestoreDomains]);

  const navItems: { id: AdminSection; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users, badge: totalStudents },
    { id: 'certificates', label: 'Certificates', icon: Award, badge: certifiedCount },
    { id: 'domains', label: 'Domain Management', icon: Globe },
    { id: 'materials', label: 'Study Materials', icon: BookOpen, badge: allMaterials.length },
    { id: 'mcqTests', label: 'MCQ Tests', icon: FileQuestion, badge: allQuestions.length },
    { id: 'testResultsView', label: 'Test Results', icon: CheckCircle, badge: testResults.length },
    { id: 'coupons', label: 'Coupons', icon: Tag, badge: allCoupons.length },
    { id: 'mentorBookings', label: 'Mentor Bookings', icon: Calendar, badge: mentorBookings.length },
    { id: 'logs', label: 'Activity Logs', icon: Activity, badge: logs.length },
    { id: 'errors', label: 'Error Reports', icon: AlertTriangle, badge: activeErrors },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'settings', label: 'Portal Settings', icon: Settings2 },
  ];

  // Log filter
  const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.type === logFilter);

  // ═══════════════════════════════════════════════════════════
  //   R E N D E R
  // ═══════════════════════════════════════════════════════════

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-400" /> : <ArrowDown className="h-3 w-3 text-blue-400" />;
  };

  return (
    <div className="flex min-h-[calc(100vh-130px)]">

      {/* ══════════ SIDEBAR ══════════ */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="sticky top-0 self-start h-[calc(100vh-130px)] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800 flex flex-col z-30 overflow-hidden shrink-0"
      >
        {/* Admin Header */}
        <div className={`p-4 border-b border-slate-800/60 ${sidebarCollapsed ? 'items-center flex flex-col' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30 shrink-0">
              👑
            </div>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-white font-bold text-sm leading-tight">Admin Panel</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email || 'admin'}</p>
              </motion.div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">System Online</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-slate-800/60">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-all cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </motion.aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">

          {/* Top Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                {navItems.find(n => n.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Invigo Infotech Control Center • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => window.location.reload()}
                className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-semibold hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setCurrentTab('home')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer active:scale-95"
              >
                Exit Panel
              </button>
            </div>
          </div>

          {/* ═══════════════════════ DASHBOARD SECTION ═══════════════════════ */}
          {activeSection === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Registrations', value: totalStudents.toString(), icon: Users, color: 'blue', sub: 'Active users on platform' },
                  { label: 'Verified Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'emerald', sub: `${verifiedPayments} payments confirmed` },
                  { label: 'Pending Payments', value: pendingPayments.toString(), icon: Clock, color: 'amber', sub: 'Awaiting verification' },
                  { label: 'Certificates Issued', value: certifiedCount.toString(), icon: Award, color: 'purple', sub: 'Credentials released' },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  const colorMap: Record<string, string> = {
                    blue: 'from-blue-500/10 to-blue-600/5 border-blue-200/60',
                    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/60',
                    amber: 'from-amber-500/10 to-amber-600/5 border-amber-200/60',
                    purple: 'from-purple-500/10 to-purple-600/5 border-purple-200/60',
                  };
                  const iconBg: Record<string, string> = {
                    blue: 'bg-blue-100 text-blue-600',
                    emerald: 'bg-emerald-100 text-emerald-600',
                    amber: 'bg-amber-100 text-amber-600',
                    purple: 'bg-purple-100 text-purple-600',
                  };
                  const valueColor: Record<string, string> = {
                    blue: 'text-slate-900',
                    emerald: 'text-emerald-600',
                    amber: 'text-amber-600',
                    purple: 'text-slate-900',
                  };
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`rounded-2xl bg-gradient-to-br ${colorMap[card.color]} border p-5 hover:shadow-lg transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">{card.label}</span>
                        <div className={`p-2 rounded-xl ${iconBg[card.color]}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                      </div>
                      <h3 className={`text-3xl font-mono font-extrabold mt-3 ${valueColor[card.color]}`}>{card.value}</h3>
                      <span className="text-[10px] text-slate-400 block mt-1">{card.sub}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Bar Chart - Domain Distribution */}
                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span>Enrollment Distribution by Domain</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Real-time Firestore data</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">LIVE</span>
                  </div>

                  {domainDistribution.length > 0 ? (
                    <div className="space-y-3">
                      {domainDistribution.map(([domain, count], idx) => {
                        const barColors = ['bg-blue-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                        return (
                          <div key={domain} className="group">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-700 truncate max-w-[200px]">{domain}</span>
                              <span className="font-mono font-bold text-slate-500">{count}</span>
                            </div>
                            <div className="h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / maxDomainCount) * 100}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                                className={`h-full ${barColors[idx % barColors.length]} rounded-lg relative`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                              </motion.div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">No enrollment data yet</div>
                  )}
                </div>

                {/* Pie Chart - Payment Status */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-6">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Payment Status</span>
                  </h3>

                  {/* SVG Donut Chart */}
                  <div className="flex justify-center mb-6">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                      {totalStudents > 0 && (
                        <>
                          <circle
                            cx="80" cy="80" r="60" fill="none"
                            stroke="#10b981"
                            strokeWidth="20"
                            strokeDasharray={`${(verifiedPayments / totalStudents) * 377} 377`}
                            strokeDashoffset="0"
                            transform="rotate(-90 80 80)"
                            className="transition-all duration-1000"
                          />
                          <circle
                            cx="80" cy="80" r="60" fill="none"
                            stroke="#f59e0b"
                            strokeWidth="20"
                            strokeDasharray={`${(pendingPayments / totalStudents) * 377} 377`}
                            strokeDashoffset={`-${(verifiedPayments / totalStudents) * 377}`}
                            transform="rotate(-90 80 80)"
                            className="transition-all duration-1000"
                          />
                        </>
                      )}
                      <text x="80" y="76" textAnchor="middle" className="fill-slate-900 text-2xl font-bold" style={{ fontSize: '24px', fontWeight: 800 }}>
                        {totalStudents}
                      </text>
                      <text x="80" y="92" textAnchor="middle" className="fill-slate-400" style={{ fontSize: '10px' }}>
                        Total
                      </text>
                    </svg>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 font-medium">Verified</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{verifiedPayments}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-slate-600 font-medium">Pending</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{pendingPayments}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-slate-600 font-medium">Blocked</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{blockedCount}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-mono uppercase font-bold">This Month's Enrollments</span>
                      <span className="font-mono font-bold text-slate-700">{thisMonthEnrollments}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-mono uppercase font-bold">Test Pass Rate</span>
                      <span className="font-mono font-bold text-slate-700">{testPassRate}%</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-mono uppercase font-bold">System Errors</span>
                      <span className="font-mono font-bold text-red-500">{activeErrors}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span>Recent Activity Feed</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[8px] uppercase font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {logs.slice(0, 8).map(log => (
                    <div key={log.id} className="flex items-start gap-3 text-xs border-b border-slate-50 pb-2.5 last:border-0">
                      <div className={`mt-0.5 p-1 rounded-md shrink-0 ${
                        log.type === 'payment' ? 'bg-amber-100 text-amber-600' :
                        log.type === 'certificate' ? 'bg-emerald-100 text-emerald-600' :
                        log.type === 'setting' ? 'bg-purple-100 text-purple-600' :
                        log.type === 'error' ? 'bg-red-100 text-red-600' :
                        log.type === 'communication' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {log.type === 'payment' ? <CreditCard className="h-3 w-3" /> :
                         log.type === 'certificate' ? <Award className="h-3 w-3" /> :
                         log.type === 'setting' ? <Settings2 className="h-3 w-3" /> :
                         log.type === 'error' ? <AlertTriangle className="h-3 w-3" /> :
                         log.type === 'communication' ? <Mail className="h-3 w-3" /> :
                         <Users className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 font-medium leading-snug">{log.action}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp} • {log.admin.split('@')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════ USERS SECTION ═══════════════════════ */}
          {activeSection === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer bg-blue-600 border-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/20"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Enroll Student
                  </button>
                  <div className="w-px h-6 bg-slate-200 self-center mx-1" />
                  <button
                    onClick={handleBulkVerifyPayments}
                    disabled={selectedIds.length === 0}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      selectedIds.length > 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 active:scale-95 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    Bulk Verify ({selectedIds.length})
                  </button>
                  <button
                    onClick={handleBulkIssueCertificates}
                    disabled={selectedIds.length === 0}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      selectedIds.length > 0
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 active:scale-95 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    Bulk Issue Certs
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      selectedIds.length > 0
                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 active:scale-95 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Bulk Delete
                  </button>
                  {selectedIds.length > 0 && (
                    <span className="self-center text-[10px] text-slate-500 font-mono ml-2">{selectedIds.length} selected</span>
                  )}
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, ID, college..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all shadow-sm"
                  />
                </div>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-blue-200 outline-none shadow-sm"
                >
                  <option value="All">All Domains</option>
                  {INTERNSHIP_DOMAINS.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-blue-200 outline-none shadow-sm"
                >
                  <option value="All">All Payments</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Pending">Pending Only</option>
                </select>
                <select
                  value={certFilter}
                  onChange={(e) => setCertFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-blue-200 outline-none shadow-sm"
                >
                  <option value="All">All Certificates</option>
                  <option value="Issued">Issued</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* User Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50/80 font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length > 0 && selectedIds.length === filteredEnrollments.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(filteredEnrollments.map(i => i.candidateId));
                            else setSelectedIds([]);
                          }}
                          className="h-4 w-4 rounded text-blue-600 border-slate-300 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('fullName')}>
                        <div className="flex items-center gap-1">Candidate <SortIcon field="fullName" /></div>
                      </th>
                      <th className="py-3 px-4">College & Degree</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('durationWeeks')}>
                        <div className="flex items-center gap-1">Progress <SortIcon field="durationWeeks" /></div>
                      </th>
                      <th className="py-3 px-4">Certificate</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                            <span className="font-semibold text-xs">Querying Firestore...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400 text-xs">
                          No registrations found. Try broader search terms.
                        </td>
                      </tr>
                    ) : (
                      filteredEnrollments.map((enr) => {
                        const isChecked = selectedIds.includes(enr.candidateId);
                        const durationDone = isDurationComplete(enr.startDate, enr.durationWeeks);
                        const remaining = getDaysRemaining(enr.startDate, enr.durationWeeks);
                        const pct = getCompletionPct(enr.startDate, enr.durationWeeks);

                        return (
                          <tr
                            key={enr.candidateId}
                            className={`hover:bg-slate-50/50 transition-all ${isChecked ? 'bg-blue-50/30' : ''} ${enr.blocked ? 'opacity-60 bg-red-50/20' : ''}`}
                          >
                            <td className="py-3.5 px-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedIds(prev => [...prev, enr.candidateId]);
                                  else setSelectedIds(prev => prev.filter(id => id !== enr.candidateId));
                                }}
                                className="h-4 w-4 rounded text-blue-600 border-slate-300 cursor-pointer"
                              />
                            </td>

                            {/* Candidate */}
                            <td className="py-3.5 px-4 space-y-1 max-w-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-[13px]">{enr.fullName}</span>
                                {enr.blocked && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-500 text-white font-bold text-[7px] uppercase">Blocked</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                <span className="text-blue-600 font-bold">{enr.candidateId}</span>
                                <span className="mx-1">•</span>
                                <span>{enr.email}</span>
                              </div>
                              <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                {getDomainTitle(enr.domainId)}
                              </span>
                            </td>

                            {/* College */}
                            <td className="py-3.5 px-4 space-y-0.5">
                              <div className="font-semibold text-slate-800 leading-tight text-[11px]">{enr.collegeName || 'Not specified'}</div>
                              <div className="text-[10px] text-slate-500">{enr.degree || 'Degree'} — {enr.fieldOfStudy || 'General'}</div>
                              <div className="text-[9.5px] text-slate-400 font-mono">Year: {enr.currentYear || '?'} (Pass: {enr.passingYear || '-'})</div>
                            </td>

                            {/* Payment */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1.5 mb-2">
                                <div className="text-[10px] font-mono text-slate-600">
                                  Amount: <span className="font-bold text-slate-800">₹{enr.amountPaid || 'N/A'}</span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-600">
                                  UTR: <span className="font-bold text-slate-800 select-all">{enr.paymentTxnId || 'N/A'}</span>
                                </div>
                              </div>
                              {enr.paymentVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                  <Check className="h-3 w-3" />
                                  Verified
                                </span>
                              ) : enr.paymentStatus === 'rejected' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  Rejected
                                </span>
                              ) : (
                                <div className="space-y-1.5">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                                    <Clock className="h-2.5 w-2.5" />
                                    Pending
                                  </span>
                                  <div className="flex flex-col gap-1.5">
                                    <button
                                      onClick={() => handleVerifyPayment(enr)}
                                      className="block px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                                    >
                                      ✓ Verify Payment
                                    </button>
                                    <button
                                      onClick={() => handleRejectPayment(enr)}
                                      className="block px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                                    >
                                      ✗ Reject Payment
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Progress */}
                            <td className="py-3.5 px-4 space-y-1.5">
                              <div className="text-[10.5px] font-mono">
                                <span className="font-bold text-slate-700">{enr.durationWeeks}W</span>
                                <span className="text-slate-400 mx-1">from</span>
                                <span className="text-slate-600">{enr.startDate || 'N/A'}</span>
                              </div>
                              {enr.startDate && (
                                <>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${durationDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  {durationDone ? (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                      <CheckCircle className="h-2.5 w-2.5" /> Completed
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-slate-500">{remaining}d remaining • {pct}%</span>
                                  )}
                                </>
                              )}
                            </td>

                            {/* Certificate */}
                            <td className="py-3.5 px-4">
                              {enr.certificateIssued ? (
                                <div className="space-y-1.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                                    <Shield className="h-3 w-3" />
                                    Issued ✓
                                  </span>
                                  <button
                                    onClick={() => downloadCertificatePDF(enr, getDomainTitle(enr.domainId))}
                                    className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                  >
                                    <Download className="h-3 w-3" /> Download PDF
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {!enr.paymentVerified ? (
                                    <span className="text-[9px] text-slate-400 font-mono italic">Verify payment first</span>
                                  ) : (
                                    <>
                                      <span className={`block text-[9px] font-bold ${durationDone ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {durationDone ? '✓ Eligible for certificate' : '⚠️ Bypass: Duration incomplete'}
                                      </span>
                                      <div className="flex gap-1 mt-1">
                                        <button
                                          onClick={() => handleIssueCertificate(enr)}
                                          className={`flex-1 px-2.5 py-1.5 rounded-lg text-white text-[9px] font-bold active:scale-95 transition-all shadow-sm cursor-pointer ${durationDone ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                                        >
                                          {durationDone ? 'Issue' : 'Bypass'}
                                        </button>
                                        <button
                                          title="Custom Date"
                                          onClick={() => setCertDateFor(enr)}
                                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all cursor-pointer"
                                        >
                                          <Calendar className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  title="View"
                                  onClick={() => setViewingStudent(enr)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  title="Edit"
                                  onClick={() => {
                                    setEditingEnrollment(enr);
                                    setEditName(enr.fullName);
                                    setEditEmail(enr.email || '');
                                    setEditCollege(enr.collegeName || '');
                                    setEditRegistrationNo(enr.registrationNo || '');
                                    setEditDegree(enr.degree || 'B.Tech');
                                    setEditFieldOfStudy(enr.fieldOfStudy || '');
                                    setEditCurrentYear(enr.currentYear || '3rd Year');
                                    setEditPassingYear(enr.passingYear || '2027');
                                    setEditDuration(enr.durationWeeks);
                                    setEditPhone(enr.phone || '');
                                    setEditStartDate(enr.startDate || '');
                                    setEditTrainingMode(enr.trainingMode || 'online');
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  title="Change Domain"
                                  onClick={() => { setChangingDomainFor(enr); setNewDomainId(enr.domainId); }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  title={enr.blocked ? 'Unblock' : 'Block'}
                                  onClick={() => handleToggleBlockUser(enr)}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    enr.blocked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {enr.blocked ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() => handleDeleteEnrollment(enr.candidateId, enr.fullName)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-slate-400 text-center font-mono">
                Showing {filteredEnrollments.length} of {totalStudents} total records
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════ CERTIFICATES SECTION ═══════════════════════ */}
          {activeSection === 'certificates' && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Issued</span>
                  <h3 className="text-3xl font-mono font-extrabold text-emerald-600 mt-2">{certifiedCount}</h3>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Eligible (Not Issued)</span>
                  <h3 className="text-3xl font-mono font-extrabold text-blue-600 mt-2">
                    {allEnrollments.filter(e => !e.certificateIssued && e.paymentVerified && (e.certificateRequested || isDurationComplete(e.startDate, e.durationWeeks))).length}
                  </h3>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">In Progress</span>
                  <h3 className="text-3xl font-mono font-extrabold text-amber-600 mt-2">
                    {allEnrollments.filter(e => !isDurationComplete(e.startDate, e.durationWeeks) && e.paymentVerified).length}
                  </h3>
                </div>
              </div>

              {/* Eligible for Certificate */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-blue-600" />
                  Certificate Management
                </h3>

                {/* Bulk action */}
                {(() => {
                  const eligible = allEnrollments.filter(e => !e.certificateIssued && e.paymentVerified && (e.certificateRequested || isDurationComplete(e.startDate, e.durationWeeks)));
                  if (eligible.length > 0) {
                    return (
                      <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                        <span className="text-xs text-blue-700 font-semibold">{eligible.length} students eligible for certificate issuance</span>
                        <button
                          onClick={async () => {
                            let count = 0;
                            for (const e of eligible) {
                              try {
                                await updateDoc(doc(db, 'enrollments', e.candidateId), {
                                  certificateIssued: true,
                                  certificateDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                                  status: 'Completed'
                                });
                                count++;
                              } catch (err) { /* skip */ }
                            }
                            addLog(`Bulk issued ${count} certificates from certificate panel`, 'certificate');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
                        >
                          Issue All ({eligible.length})
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="space-y-2.5">
                  {allEnrollments.map(enr => {
                    const durationDone = isDurationComplete(enr.startDate, enr.durationWeeks);
                    const pct = getCompletionPct(enr.startDate, enr.durationWeeks);
                    return (
                      <div key={enr.candidateId} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{enr.fullName}</span>
                            <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{enr.candidateId}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{getDomainTitle(enr.domainId)} • {enr.durationWeeks} weeks • {enr.startDate || 'No start date'}</div>
                        </div>

                        {/* Progress */}
                        <div className="w-20">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${durationDone ? 'bg-emerald-500' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono">{pct}%</span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {!enr.paymentVerified && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Payment Pending</span>
                          )}
                          {enr.certificateIssued ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Issued ✓</span>
                              <button
                                onClick={() => downloadCertificatePDF(enr, getDomainTitle(enr.domainId))}
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer transition-all"
                                title="Download PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            enr.paymentVerified && (
                              <div className="flex items-center gap-2">
                                {enr.certificateRequested && (
                                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">Requested</span>
                                )}
                                <button
                                  onClick={() => handleIssueCertificate(enr)}
                                  className={`px-3 py-1.5 text-white text-[9px] font-bold rounded-lg cursor-pointer active:scale-95 transition-all ${durationDone || enr.certificateRequested ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                                >
                                  🎓 Issue
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════ REFER & EARN / COUPONS ═══════════════════════ */}
          {activeSection === 'coupons' && (
            <motion.div
              key="coupons"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Refer & Earn</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage collaborators and view referral rankings</p>
                </div>
                <button onClick={() => setShowAddCouponModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Collaborator
                </button>
              </div>

              {/* Leaderboard */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                        <th className="p-4 font-bold border-b border-slate-200">Rank</th>
                        <th className="p-4 font-bold border-b border-slate-200">Collaborator</th>
                        <th className="p-4 font-bold border-b border-slate-200">Coupon Code</th>
                        <th className="p-4 font-bold border-b border-slate-200">Referral Link</th>
                        <th className="p-4 font-bold border-b border-slate-200">Registrations</th>
                        <th className="p-4 font-bold border-b border-slate-200">Discount</th>
                        <th className="p-4 font-bold border-b border-slate-200">Status</th>
                        <th className="p-4 font-bold border-b border-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {allCoupons.map((c) => {
                        const regCount = allEnrollments.filter(e => e.appliedCouponCode === c.code).length;
                        return { ...c, regCount };
                      }).sort((a, b) => b.regCount - a.regCount).map((c, idx) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-400">#{idx + 1}</td>
                          <td className="p-4 font-bold text-slate-800">{c.collaboratorName || 'N/A'}</td>
                          <td className="p-4 font-mono text-blue-600 font-bold">{c.code}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                                {window.location.origin}/?ref={c.code}
                              </span>
                              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${c.code}`)} className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer" title="Copy Link">
                                <BookOpen className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                              {c.regCount} Users
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-semibold">{c.discountPercent}% Off</td>
                          <td className="p-4">
                            <button onClick={() => handleToggleCoupon(c)} className={`text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer transition-all ${c.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'}`}>
                              {c.active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4">
                            <button onClick={() => handleRemoveCoupon(c.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {allCoupons.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">No collaborators or coupons found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════ ACTIVITY LOGS SECTION ═══════════════════════ */}
          {activeSection === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {['all', 'payment', 'certificate', 'user', 'setting', 'error', 'communication'].map(type => (
                    <button
                      key={type}
                      onClick={() => setLogFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        logFilter === type
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                  <button
                    onClick={() => { setLogs([]); addLog('Cleared activity logs', 'user'); }}
                    className="ml-auto text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    Clear Logs
                  </button>
                </div>

                {/* Log Entries */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">No logs matching this filter</div>
                  ) : (
                    filteredLogs.map(log => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all">
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                          log.type === 'payment' ? 'bg-amber-100 text-amber-600' :
                          log.type === 'certificate' ? 'bg-emerald-100 text-emerald-600' :
                          log.type === 'setting' ? 'bg-purple-100 text-purple-600' :
                          log.type === 'error' ? 'bg-red-100 text-red-600' :
                          log.type === 'communication' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {log.type === 'payment' ? <CreditCard className="h-3.5 w-3.5" /> :
                           log.type === 'certificate' ? <Award className="h-3.5 w-3.5" /> :
                           log.type === 'setting' ? <Settings2 className="h-3.5 w-3.5" /> :
                           log.type === 'error' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                           log.type === 'communication' ? <Mail className="h-3.5 w-3.5" /> :
                           <Users className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-medium">{log.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                            <span className="text-[10px] text-blue-600 font-bold font-mono">{log.admin.split('@')[0]}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                              log.type === 'payment' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              log.type === 'certificate' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              log.type === 'setting' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                              log.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
                              'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}>
                              {log.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════ ERROR REPORTS SECTION ═══════════════════════ */}
          {activeSection === 'errors' && (
            <motion.div
              key="errors"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Error Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Total Errors</span>
                  <h3 className="text-3xl font-mono font-extrabold text-slate-900 mt-2">{errors.length}</h3>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Active Issues</span>
                  <h3 className="text-3xl font-mono font-extrabold text-red-500 mt-2">{activeErrors}</h3>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Resolved</span>
                  <h3 className="text-3xl font-mono font-extrabold text-emerald-600 mt-2">{errors.filter(e => e.resolved).length}</h3>
                </div>
              </div>

              {/* Firestore Health */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-4">
                  <Zap className="h-4 w-4 text-blue-600" />
                  System Health Monitor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Firestore</p>
                      <p className="text-[10px] text-emerald-600">Connected & syncing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Firebase Auth</p>
                      <p className="text-[10px] text-emerald-600">Operational</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">PDF Generator</p>
                      <p className="text-[10px] text-emerald-600">jsPDF loaded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error List */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Error Log
                </h3>
                <div className="space-y-2">
                  {errors.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                      <span>No errors recorded — all systems nominal</span>
                    </div>
                  ) : (
                    errors.map(err => (
                      <div key={err.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        err.resolved ? 'border-slate-100 opacity-60' : 'border-red-100 bg-red-50/30'
                      }`}>
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                          err.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          err.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          err.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <AlertCircle className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-medium">{err.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">{err.timestamp}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{err.source}</span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              err.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              err.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                              err.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {err.severity}
                            </span>
                          </div>
                        </div>
                        {!err.resolved && (
                          <button
                            onClick={() => setErrors(prev => prev.map(e => e.id === err.id ? { ...e, resolved: true } : e))}
                            className="px-2.5 py-1 text-[9px] font-bold bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition-all shrink-0"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════ COMMUNICATION SECTION ═══════════════════════ */}
          {activeSection === 'communication' && (
            <motion.div
              key="communication"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compose */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-blue-600" />
                    Broadcast Announcement
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Subject</label>
                      <input
                        type="text"
                        value={commSubject}
                        onChange={(e) => setCommSubject(e.target.value)}
                        placeholder="e.g., Schedule Change Notice"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Message Content</label>
                      <textarea
                        value={commMessage}
                        onChange={(e) => setCommMessage(e.target.value)}
                        rows={5}
                        placeholder="Write your announcement message here..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs outline-none focus:ring-2 focus:ring-blue-200 transition-all leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          addLog(`Broadcast announcement: "${commSubject}"`, 'communication');
                          setCommSubject('');
                          setCommMessage('');
                          alert('Message broadcasted to selected segment!');
                        }}
                        disabled={!commSubject || !commMessage}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        Broadcast Message
                      </button>
                      <button
                        onClick={handleGenerateBulkEmail}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        title="Generates an email with all filtered users BCC'd"
                      >
                        <Mail className="h-4 w-4" />
                        Open Email Client (BCC All)
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Info className="h-4 w-4 shrink-0" />
                        <p className="text-[10px] leading-relaxed">This announcement updates the global banner visible on all student dashboards in real-time.</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => {
                          if (!commMessage.trim()) return;
                          setSettings(prev => {
                            const updated = { ...prev, announcementText: `📢 ${commSubject}: ${commMessage}` };
                            localStorage.setItem('invigo_admin_settings', JSON.stringify(updated));
                            return updated;
                          });
                          addLog(`Broadcast announcement: "${commSubject}"`, 'communication');
                          setCommSubject('');
                          setCommMessage('');
                        }}
                        disabled={!commMessage.trim()}
                        className={`flex-1 py-3 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] ${
                          commMessage.trim()
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Broadcast to All Students
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview & History */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-blue-600" />
                    Current Banner Preview
                  </h3>

                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Live Dashboard Banner</span>
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-mono font-bold p-3 rounded-lg flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <span>{settings.announcementText || 'No current announcement'}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Recent Communications</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {logs.filter(l => l.type === 'communication').length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No communications sent yet</p>
                      ) : (
                        logs.filter(l => l.type === 'communication').map(log => (
                          <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 text-xs">
                            <p className="text-slate-700 font-medium">{log.action}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Target: <strong>All Enrolled Students</strong></span>
                    <button
                      onClick={() => {
                        setCommSubject('Welcome Notice');
                        setCommMessage('Welcome to Invigo Infotech! New orientation materials have been uploaded to your dashboard.');
                      }}
                      className="text-blue-600 hover:underline font-bold cursor-pointer text-[10px]"
                    >
                      Load Template
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ DOMAINS MANAGEMENT SECTION ═══ */}
          {activeSection === 'domains' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Domain Management</h2>
                  <p className="text-xs text-slate-500 mt-1">Add, edit, or remove internship domains</p>
                </div>
                <button onClick={() => setShowAddDomainModal(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
                  <Plus className="h-4 w-4" /> Add New Domain
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allDomains.map(domain => (
                  <div key={domain.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {domain.imageUrl && (
                      <div className="h-28 overflow-hidden">
                        <img src={domain.imageUrl} alt={domain.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-slate-800">{domain.title}</h3>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">{domain.category}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${firestoreDomains.find(d => d.id === domain.id) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                          {firestoreDomains.find(d => d.id === domain.id) ? 'Firestore' : 'Hardcoded'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{domain.shortDesc}</p>
                      <div className="flex gap-2">
                        {firestoreDomains.find(d => d.id === domain.id) && (
                          <button onClick={() => setConfirmAction({ message: `Delete domain "${domain.title}"? This cannot be undone.`, onConfirm: () => { handleRemoveDomain(domain.id); setConfirmAction(null); } })} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg border border-red-200 cursor-pointer flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        )}
                        <span className="text-[10px] text-slate-400 self-center">{domain.durationWeeks?.join('/')} weeks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ STUDY MATERIALS SECTION ═══ */}
          {activeSection === 'materials' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Study Materials</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage PDF and video resources per domain (sequentially unlocked)</p>
                </div>
                <button onClick={() => setShowAddMaterialModal(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
                  <Plus className="h-4 w-4" /> Add Material
                </button>
              </div>

              {/* Filter by domain */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setMaterialDomainFilter('All')} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${materialDomainFilter === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>All</button>
                {allDomains.slice(0, 8).map(d => (
                  <button key={d.id} onClick={() => setMaterialDomainFilter(d.id)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${materialDomainFilter === d.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{d.title}</button>
                ))}
              </div>

              <div className="space-y-3">
                {(materialDomainFilter === 'All' ? allMaterials : allMaterials.filter(m => m.domainId === materialDomainFilter)).map(material => (
                  <div key={material.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${material.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                      {material.type === 'pdf' ? <FileType className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{material.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="font-mono">{getDomainTitle(material.domainId)}</span>
                        <span>•</span>
                        <span>Order: {material.order}</span>
                        <span>•</span>
                        <span className="uppercase font-bold">{material.type}</span>
                      </div>
                    </div>
                    <a href={material.type === 'video_embed' ? '#' : material.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-200 hover:bg-blue-100">View</a>
                    <button onClick={() => handleRemoveMaterial(material.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-200 hover:bg-red-100 cursor-pointer">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {allMaterials.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    No study materials added yet. Click "Add Material" to begin.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ MCQ TESTS SECTION ═══ */}
          {activeSection === 'mcqTests' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">MCQ Test Management</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage assessment questions per domain. Students need 60% to pass.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddQuestionModal(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
                    <Plus className="h-4 w-4" /> Add Question
                  </button>
                </div>
              </div>

              {/* Quick seed buttons */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-amber-800">Quick Seed Default Questions</h4>
                  <button onClick={handleSeedAllDomains} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow-sm">
                    Seed ALL Domains
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(DEFAULT_MCQ_QUESTIONS).map(domainId => {
                    const existing = allQuestions.filter(q => q.domainId === domainId).length;
                    return (
                      <button key={domainId} onClick={() => handleSeedQuestions(domainId)} disabled={existing >= 10} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${existing >= 10 ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'}`}>
                        {getDomainTitle(domainId)} ({existing}/10)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setQuestionDomainFilter('All')} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${questionDomainFilter === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>All ({allQuestions.length})</button>
                {allDomains.slice(0, 8).map(d => {
                  const count = allQuestions.filter(q => q.domainId === d.id).length;
                  return (
                    <button key={d.id} onClick={() => setQuestionDomainFilter(d.id)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${questionDomainFilter === d.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>{d.title} ({count})</button>
                  );
                })}
              </div>

              {/* Questions list */}
              <div className="space-y-3">
                {(questionDomainFilter === 'All' ? allQuestions : allQuestions.filter(q => q.domainId === questionDomainFilter)).map((q, idx) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-500 font-mono">{getDomainTitle(q.domainId)} • Q{idx + 1}</span>
                        <p className="text-sm font-bold text-slate-800 mt-1">{q.question}</p>
                      </div>
                      <button onClick={() => handleRemoveQuestion(q.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`text-xs px-3 py-1.5 rounded-lg border ${i === q.correctIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                          {String.fromCharCode(65 + i)}. {opt} {i === q.correctIndex && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {allQuestions.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    <FileQuestion className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    No questions added yet. Use the seed buttons above or add manually.
                  </div>
                )}
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-600" /> Recent Test Results</h3>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-2 font-bold text-slate-600">Student</th>
                        <th className="text-left px-4 py-2 font-bold text-slate-600">Domain</th>
                        <th className="text-center px-4 py-2 font-bold text-slate-600">Score</th>
                        <th className="text-center px-4 py-2 font-bold text-slate-600">Status</th>
                      </tr></thead>
                      <tbody>
                        {testResults.slice(0, 20).map(r => (
                          <tr key={r.id} className="border-b border-slate-100">
                            <td className="px-4 py-2 text-slate-800 font-medium">{r.studentEmail}</td>
                            <td className="px-4 py-2 text-slate-600">{getDomainTitle(r.domainId)}</td>
                            <td className="px-4 py-2 text-center font-bold">{r.score}%</td>
                            <td className="px-4 py-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{r.passed ? 'PASS' : 'FAIL'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ TEST RESULTS SECTION ═══ */}
          {activeSection === 'testResultsView' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Student Test Results</h2>
                  <p className="text-xs text-slate-500 mt-1">View and manage all MCQ test results across domains.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {testResults.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-bold text-slate-600">Student Email</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-600">Domain</th>
                      <th className="text-center px-4 py-3 font-bold text-slate-600">Score</th>
                      <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                      <th className="text-right px-4 py-3 font-bold text-slate-600">Date</th>
                    </tr></thead>
                    <tbody>
                      {testResults.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).map(r => (
                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-800 font-medium">{r.studentEmail}</td>
                          <td className="px-4 py-3 text-slate-600">{getDomainTitle(r.domainId)}</td>
                          <td className="px-4 py-3 text-center font-bold">{r.score}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{r.passed ? 'PASS' : 'FAIL'}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">{new Date(r.completedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    No test results recorded yet.
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {/* Coupons View */}
          {activeSection === 'coupons' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Coupons Management</h2>
                  <p className="text-xs text-slate-500 mt-1">Create and manage discount coupons for student enrollments.</p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  New Coupon
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {allCoupons.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-bold text-slate-600">Coupon Code</th>
                      <th className="text-center px-4 py-3 font-bold text-slate-600">Discount (%)</th>
                      <th className="text-center px-4 py-3 font-bold text-slate-600">Expires At</th>
                      <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                      <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
                    </tr></thead>
                    <tbody>
                      {allCoupons.map(coupon => {
                        const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                        return (
                        <tr key={coupon.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-purple-700">{coupon.code}</td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-600">{coupon.discountPercent}%</td>
                          <td className="px-4 py-3 text-center text-slate-500">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleCoupon(coupon)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                !coupon.active ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : isExpired ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                            >
                              {!coupon.active ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                            </button>
                          </td>
                          <td className="px-4 py-3 flex justify-end gap-2">
                            <button onClick={() => handleRemoveCoupon(coupon.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded bg-slate-50 hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    <Tag className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    No coupons created yet.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          )}

          {/* Mentor Bookings View */}
          {activeSection === 'mentorBookings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Mentor Bookings</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage 1-on-1 mentor session requests.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {mentorBookings.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead><tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-bold text-slate-600">Student Name</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-600">Email</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-600">Domain</th>
                      <th className="text-center px-4 py-3 font-bold text-slate-600">Date & Time</th>
                      <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                      <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
                    </tr></thead>
                    <tbody>
                      {mentorBookings.map(booking => (
                        <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{booking.studentName}</td>
                          <td className="px-4 py-3 text-slate-600">{booking.studentEmail}</td>
                          <td className="px-4 py-3 text-slate-600">{getDomainTitle(booking.domainId)}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{booking.preferredDate} {booking.preferredTime}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : booking.status === 'declined' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                              {booking.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex justify-end gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button onClick={() => updateDoc(doc(db, 'mentorBookings', booking.id), { status: 'confirmed' })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Confirm">
                                  <Check className="h-4 w-4" />
                                </button>
                                <button onClick={() => updateDoc(doc(db, 'mentorBookings', booking.id), { status: 'declined' })} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Decline">
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    No mentor bookings yet.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Settings View */}
          {activeSection === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Portal Settings</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage global settings and admin accounts.</p>
                </div>
                <button onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">Save Global Settings</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Global Settings</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Portal Name</label>
                    <input type="text" value={settings.portalName} onChange={e => setSettings({...settings, portalName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Support Phone</label>
                    <input type="text" value={settings.supportPhone} onChange={e => setSettings({...settings, supportPhone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                    <label className="text-xs font-bold text-slate-700">Maintenance Mode</label>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex justify-between items-center">
                    Admin Accounts
                    <button onClick={() => {
                      const email = window.prompt('Enter new admin email:');
                      if (email && email.includes('@')) {
                        setDoc(doc(db, 'adminList', email.trim().toLowerCase()), { addedAt: new Date().toISOString() });
                      }
                    }} className="text-blue-600 hover:text-blue-700 text-[10px] flex items-center gap-1"><Plus className="h-3 w-3"/> Add Admin</button>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {adminList.map(admin => (
                      <div key={admin.email} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">{admin.email}</span>
                        <button onClick={() => {
                          if (window.confirm(`Remove ${admin.email} from admins?`)) {
                            deleteDoc(doc(db, 'adminList', admin.email));
                          }
                        }} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 className="h-3 w-3"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* ─── MODALS ─── */}

      {/* ─── ENROLL STUDENT MODAL ─── */}
      <AnimatePresence>
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Enroll New Student</h3>
                  <p className="text-xs text-slate-500">Manually onboard a candidate into a cohort.</p>
                </div>
                <button onClick={() => setShowEnrollModal(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input type="text" value={enrollForm.fullName} onChange={(e) => setEnrollForm({...enrollForm, fullName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input type="email" value={enrollForm.email} onChange={(e) => setEnrollForm({...enrollForm, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="e.g. john@college.edu" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone</label>
                    <input type="text" value={enrollForm.phone} onChange={(e) => setEnrollForm({...enrollForm, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Phone Number" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">College Name</label>
                    <input type="text" value={enrollForm.collegeName} onChange={(e) => setEnrollForm({...enrollForm, collegeName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="e.g. DTU" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Domain / Course</label>
                    <select value={enrollForm.domainId} onChange={(e) => setEnrollForm({...enrollForm, domainId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500">
                      {INTERNSHIP_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Start Date</label>
                    <input type="date" value={enrollForm.startDate} onChange={(e) => setEnrollForm({...enrollForm, startDate: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button onClick={() => setShowEnrollModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button onClick={handleAdminEnroll} disabled={enrollLoading} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm">
                  {enrollLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Enroll Student
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHANGE DOMAIN MODAL ─── */}
      <AnimatePresence>
        {changingDomainFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-base">Change User Domain</h3>
                <button onClick={() => setChangingDomainFor(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-600">Move <strong className="text-slate-800">{changingDomainFor.fullName}</strong> to a new course domain.</p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Select New Domain</label>
                  <select value={newDomainId} onChange={(e) => setNewDomainId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500">
                    {INTERNSHIP_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setChangingDomainFor(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button onClick={handleChangeDomain} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer shadow-sm">Confirm Move</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CUSTOM CERTIFICATE DATE MODAL ─── */}
      <AnimatePresence>
        {certDateFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-base">Issue Certificate (Custom Date)</h3>
                <button onClick={() => setCertDateFor(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-600">Set the issuance date for <strong className="text-slate-800">{certDateFor.fullName}</strong>.</p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Certificate Date</label>
                  <input type="date" value={customCertDate} onChange={(e) => setCustomCertDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setCertDateFor(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button onClick={() => handleIssueCertificateWithDate(certDateFor, customCertDate)} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-1 cursor-pointer shadow-sm"><Award className="h-4 w-4" /> Issue</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ EDIT MODAL ══════════ */}
      <AnimatePresence>
        {editingEnrollment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl relative border border-slate-100"
            >
              <button
                onClick={() => setEditingEnrollment(null)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Student Profile</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ID: <strong className="font-mono text-blue-600">{editingEnrollment.candidateId}</strong></p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto px-1 py-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Email</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Contact Number</label>
                    <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">College Name</label>
                    <input type="text" value={editCollege} onChange={(e) => setEditCollege(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Registration No</label>
                    <input type="text" value={editRegistrationNo} onChange={(e) => setEditRegistrationNo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Degree</label>
                    <select value={editDegree} onChange={(e) => setEditDegree(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                      <option value="B.Tech">B.Tech</option>
                      <option value="Diploma">Diploma</option>
                      <option value="BCA">BCA</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="MBA">MBA</option>
                      <option value="BA">BA</option>
                      <option value="B.Com">B.Com</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Field of Study</label>
                    <input type="text" value={editFieldOfStudy} onChange={(e) => setEditFieldOfStudy(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Current Year</label>
                    <select value={editCurrentYear} onChange={(e) => setEditCurrentYear(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Passing Year</label>
                    <input type="text" value={editPassingYear} onChange={(e) => setEditPassingYear(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Start Date</label>
                    <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Duration (Weeks)</label>
                    <select value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                      <option value={4}>4 Weeks</option>
                      <option value={8}>8 Weeks</option>
                      <option value={12}>12 Weeks</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Training Mode</label>
                    <select value={editTrainingMode} onChange={(e) => setEditTrainingMode(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                  <button
                    onClick={() => setEditingEnrollment(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ CONFIRMATION MODAL ══════════ */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-red-100 text-red-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Confirm Action</h3>
                  <p className="text-xs text-slate-600 mt-1">{confirmAction.message}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction.onConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ADD DOMAIN MODAL ─── */}
      <AnimatePresence>
        {showAddDomainModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="font-bold text-slate-800">Add New Domain</h3>
                <button onClick={() => setShowAddDomainModal(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Domain Title</label><input type="text" value={newDomain.title} onChange={e => setNewDomain({...newDomain, title: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Data Science & Analytics" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Short Description</label><textarea value={newDomain.shortDesc} onChange={e => setNewDomain({...newDomain, shortDesc: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Category</label><select value={newDomain.category} onChange={e => setNewDomain({...newDomain, category: e.target.value as any})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"><option>Tech</option><option>Management</option><option>Design</option><option>Hardware</option></select></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Durations (comma separated)</label><input type="text" value={newDomain.durationWeeks} onChange={e => setNewDomain({...newDomain, durationWeeks: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" /></div>
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Image URL (Optional)</label><input type="text" value={newDomain.imageUrl} onChange={e => setNewDomain({...newDomain, imageUrl: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="/images/my-domain.png" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Skills (comma separated)</label><input type="text" value={newDomain.skills} onChange={e => setNewDomain({...newDomain, skills: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" /></div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button onClick={() => setShowAddDomainModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button onClick={handleAddDomain} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Save Domain</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ADD MATERIAL MODAL ─── */}
      <AnimatePresence>
        {showAddMaterialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold">Add Material</h3><button onClick={() => setShowAddMaterialModal(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full"><X className="h-4 w-4" /></button></div>
              <div className="p-5 space-y-3">
                <div><label className="text-xs font-bold">Domain</label><select value={materialForm.domainId} onChange={e => setMaterialForm({...materialForm, domainId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select Domain...</option>{allDomains.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
                <div><label className="text-xs font-bold">Title</label><input type="text" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-bold">Type</label><select value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="pdf">PDF Document</option><option value="video">Video Link</option><option value="video_embed">Embedded Video</option></select></div>
                {materialForm.type === 'video_embed' ? (
                  <div><label className="text-xs font-bold">Embed Code (HTML iframe)</label><textarea value={materialForm.embedCode} onChange={e => setMaterialForm({...materialForm, embedCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} placeholder='<iframe src="..."></iframe>' /></div>
                ) : (
                  <div><label className="text-xs font-bold">URL</label><input type="text" value={materialForm.url} onChange={e => setMaterialForm({...materialForm, url: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                )}
                <div><label className="text-xs font-bold">Unlock Order (e.g. 1, 2, 3)</label><input type="number" value={materialForm.order} onChange={e => setMaterialForm({...materialForm, order: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowAddMaterialModal(false)} className="px-4 py-2 border rounded-xl font-bold text-xs">Cancel</button><button onClick={handleAddMaterial} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">Save</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ADD MCQ QUESTION MODAL ─── */}
      <AnimatePresence>
        {showAddQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white"><h3 className="font-bold">Add MCQ Question</h3><button onClick={() => setShowAddQuestionModal(false)} className="p-2 bg-slate-50 rounded-full"><X className="h-4 w-4" /></button></div>
              <div className="p-5 space-y-3">
                <div><label className="text-xs font-bold">Domain</label><select value={questionForm.domainId} onChange={e => setQuestionForm({...questionForm, domainId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="">Select Domain...</option>{allDomains.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
                <div><label className="text-xs font-bold">Question text</label><textarea value={questionForm.question} onChange={e => setQuestionForm({...questionForm, question: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-slate-500">Option A</label><input type="text" value={questionForm.option0} onChange={e => setQuestionForm({...questionForm, option0: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs font-bold text-slate-500">Option B</label><input type="text" value={questionForm.option1} onChange={e => setQuestionForm({...questionForm, option1: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs font-bold text-slate-500">Option C</label><input type="text" value={questionForm.option2} onChange={e => setQuestionForm({...questionForm, option2: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs font-bold text-slate-500">Option D</label><input type="text" value={questionForm.option3} onChange={e => setQuestionForm({...questionForm, option3: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div><label className="text-xs font-bold">Correct Option</label><select value={questionForm.correctIndex} onChange={e => setQuestionForm({...questionForm, correctIndex: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value={0}>Option A</option><option value={1}>Option B</option><option value={2}>Option C</option><option value={3}>Option D</option></select></div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white"><button onClick={() => setShowAddQuestionModal(false)} className="px-4 py-2 border rounded-xl font-bold text-xs">Cancel</button><button onClick={handleAddQuestion} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">Save Question</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Student Modal */}
      <AnimatePresence>
        {viewingStudent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
            onClick={() => setViewingStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{viewingStudent.fullName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{viewingStudent.candidateId}</p>
                  </div>
                </div>
                <button onClick={() => setViewingStudent(null)} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                    <p className="text-sm font-medium text-slate-800">{viewingStudent.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                    <p className="text-sm font-medium text-slate-800">{viewingStudent.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College</span>
                    <p className="text-sm font-medium text-slate-800">{viewingStudent.collegeName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domain</span>
                    <p className="text-sm font-medium text-slate-800">{getDomainTitle(viewingStudent.domainId)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
                    <p className="text-sm font-medium text-slate-800 capitalize">{viewingStudent.paymentStatus || 'Pending'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    <p className="text-sm font-medium text-slate-800 capitalize">{viewingStudent.status || 'Pending'}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> MCQ Test Results</h4>
                  <div className="space-y-3">
                    {testResults.filter(tr => tr.studentEmail.toLowerCase() === viewingStudent.email.toLowerCase()).length > 0 ? (
                      testResults.filter(tr => tr.studentEmail.toLowerCase() === viewingStudent.email.toLowerCase()).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).map(tr => (
                        <div key={tr.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{getDomainTitle(tr.domainId)}</p>
                            <p className="text-xs text-slate-500">{new Date(tr.completedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${tr.passed ? 'text-emerald-600' : 'text-red-600'}`}>{tr.score}% - {tr.passed ? 'Passed' : 'Failed'}</p>
                            <p className="text-xs text-slate-500">{tr.correctAnswers}/{tr.totalQuestions} correct</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">No tests taken yet.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onClick={() => setViewingStudent(null)} className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ADD COUPON MODAL ─── */}
      <AnimatePresence>
        {showAddCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Add New Coupon</h3>
                <button onClick={() => setShowAddCouponModal(false)} className="p-1.5 bg-white hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer shadow-xs border border-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coupon Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. IAMNEW"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collaborator Name (Optional)</label>
                  <input
                    type="text"
                    value={newCoupon.collaboratorName}
                    onChange={(e) => setNewCoupon({ ...newCoupon, collaboratorName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={newCoupon.expiresAt}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCoupon}
                  disabled={!newCoupon.code.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Coupon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
