export interface StudentUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName?: string;
  degree?: 'B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA';
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
  targetDegrees: ('B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA')[];
  skills: string[];
  toolsAndTech: string[];
  gradient: string; // CSS gradient class
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
  degree: 'B.Tech' | 'Diploma' | 'BCA' | 'B.Sc' | 'MBA';
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
  certificateIssued?: boolean;
  certificateDate?: string;
  blocked?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}
