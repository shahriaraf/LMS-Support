export type Role = 'student' | 'support_engineer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  priceCents: number;
  instructor: string;
  videoUrl: string;
  isLocked: boolean;
  maxSeats: number;
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  status: 'pending_payment' | 'active' | 'cancelled';
  createdAt: string;
}

export interface Payment {
  _id: string;
  userId: string;
  courseId: string;
  amountCents: number;
  status: 'succeeded' | 'failed';
  failureReason?: string;
  mockCardLast4: string;
  providerRef: string;
  createdAt: string;
}

export type IssueCategory =
  | 'COURSE_403'
  | 'PAYMENT_FAILURE'
  | 'VIDEO_CORS'
  | 'CSS_MISALIGNMENT'
  | 'ENROLLMENT_DB_ERROR'
  | 'OTHER';

export type IssueStatus = 'open' | 'investigating' | 'resolved';

export interface SuggestedFix {
  title: string;
  likelyRootCause: string;
  steps: string[];
  relevantLogQuery: string;
}

export interface Issue {
  _id: string;
  reporterId: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  relatedCourseId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  suggestedFix: SuggestedFix;
}

export interface ActivityLog {
  _id: string;
  userId?: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ApiLog {
  _id: string;
  method: string;
  path: string;
  statusCode: number;
  requestBody?: any;
  responseBody?: any;
  userId?: string | null;
  durationMs?: number;
  isError: boolean;
  createdAt: string;
}

export interface Settings {
  key: string;
  paymentFailureRate: number;
  videoCorsErrorEnabled: boolean;
  enrollmentValidationErrorEnabled: boolean;
  cssMisalignmentBugEnabled: boolean;
}
