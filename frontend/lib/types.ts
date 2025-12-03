export interface DocumentMetadata {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string;
  uploadedAt: Date | string;
  s3Key: string;
}

export type MembershipType =
  | "Primary"
  | "Spouse"
  | "Son"
  | "Daughter"
  | "Legal Heir";
export type Status =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Document Required";

export interface ShareCertificate {
  _id?: string;
  acknowledgementNumber?: string;
  fullName: string;
  index2ApplicantNames?: string[];
  flatNumber: string;
  wing: "C" | "D";
  email: string;
  mobileNumber: string;
  carpetArea?: number;
  builtUpArea?: number;
  membershipType: MembershipType;
  index2Document: DocumentMetadata;
  possessionLetterDocument: DocumentMetadata;
  aadhaarCardDocument: DocumentMetadata;
  digitalSignature: string;
  declarationAccepted: boolean;
  status?: Status;
  submittedAt?: Date;
  updatedAt?: Date;
  adminNotes?: string;
}

export interface Nominee {
  name: string;
  relationship: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  sharePercentage: number;
  address?: string;
}

export interface Witness {
  name: string;
  address: string;
  signature: string;
}

export interface Nomination {
  _id?: string;
  acknowledgementNumber?: string;
  primaryMemberName?: string;
  primaryMemberEmail?: string;
  primaryMemberMobile?: string;
  flatNumber: string;
  building?: string;
  wing: string;
  email?: string;
  mobileNumber?: string;
  memberAadhaarNumber?: string;
  memberAadhaarDocument?: DocumentMetadata;
  nominees: Nominee[];
  witness1?: Witness;
  witness2?: Witness;
  witnesses?: Witness[];
  memberSignature?: string;
  declarationAccepted: boolean;
  status?: Status;
  submittedAt?: Date;
  updatedAt?: Date;
  adminNotes?: string;
  // Legacy fields for backward compatibility
  memberFullName?: string;
}

export interface DashboardStats {
  shareCertificates: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    documentRequired: number;
  };
  nominations: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    documentRequired: number;
  };
  nocRequests?: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    documentRequired: number;
  };
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
}

export interface NocRequest {
  _id?: string;
  acknowledgementNumber?: string;
  sellerName: string;
  sellerEmail: string;
  sellerMobileNumber: string;
  sellerAlternateMobile?: string;
  buyerName: string;
  buyerEmail: string;
  buyerMobileNumber: string;
  flatNumber: string;
  wing: string;
  reason: string;
  expectedTransferDate?: string;
  status?: Status;
  submittedAt?: Date;
  updatedAt?: Date;
  adminNotes?: string;
  documents?: DocumentMetadata[];
  // Legacy fields for backward compatibility
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  purpose?: string;
  requestDetails?: string;
}
