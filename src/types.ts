export interface StudentUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName?: string;
  registrationNo?: string;
  degree?: 'B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA' | 'BA' | 'B.Com';
  fieldOfStudy?: string;
  currentYear?: string;
  passingYear?: string;
  blocked?: boolean;
}

export interface InternshipDomain {
  id: string;
  title: string;
  category: 'Tech' | 'Management' | 'Design' | 'Hardware';
  shortDesc: string;
  iconName: string; // Lucide icon lookup
  durationWeeks: number[]; // e.g. [4, 8, 12]
  targetDegrees: ('B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA' | 'BA' | 'B.Com')[];
  targetBranches?: string[];
  skills: string[];
  toolsAndTech: string[];
  gradient: string; // CSS gradient class
  imageUrl?: string; // Domain card banner image
  phases: {
    title: string;
    description: string;
    deliverables: string[];
  }[];
}

export interface EnrollmentState {
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  registrationNo?: string;
  degree: 'B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA' | 'BA' | 'B.Com';
  fieldOfStudy: string;
  currentYear: string; // e.g. '1st Year', '2nd Year', '3rd Year', '4th Year'
  passingYear: string;
  domainId: string;
  durationWeeks: number;
  startDate: string;
  motivation: string;
  candidateId: string;
  enrollmentDate: string;
  status: 'Initiated' | 'Approved' | 'In Progress' | 'Completed';
  trainingMode?: 'online' | 'offline';
  amountPaid?: number;
  paymentTxnId?: string;
  paymentVerified?: boolean;
  paymentStatus?: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  certificateIssued?: boolean;
  certificateDate?: string;
  blocked?: boolean;
  // MCQ Test fields
  testScore?: number;
  testPassed?: boolean;
  testCompletedAt?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  admin: string;
  type: 'payment' | 'certificate' | 'user' | 'setting' | 'error' | 'communication';
}

export interface PortalSettings {
  portalName: string;
  maintenanceMode: boolean;
  announcementText: string;
  supportPhone: string;
  themeAccent: string;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

// Study Material for sequential learning
export interface StudyMaterial {
  id: string;
  domainId: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'video_embed';
  url: string;
  embedCode?: string;
  order: number;
  createdAt: string;
}

// MCQ Question
export interface MCQQuestion {
  id: string;
  domainId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// Test Result
export interface TestResult {
  id: string;
  studentEmail: string;
  domainId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
}

// Material Progress tracking
export interface MaterialProgress {
  id: string;
  studentEmail: string;
  domainId: string;
  completedMaterialIds: string[];
}
