// ---- Enums / Union types ----
export type EmployerStatus = "PENDING" | "APPROVED" | "REJECTED" | "INCOMPLETE" | "BLOCKED";
export type EmployerUpdateStatus = "PENDING" | "APPROVED" | "REJECTED";

// ---- Response types ----
export interface EmployerResponse {
  id: number;
  companyName: string;
  emailCompany: string;
  phoneNumber: string;
  address?: string;
  website?: string;
  companySize?: string;
  description?: string;
  logoUrl?: string;
  businessLicense: string;
  taxCode: string;
  wardId?: number | string;
  status: EmployerStatus;
  createdAt: string;
  approvedAt?: string;
  totalActiveJobs?: number;
}

export interface EmployerPublicResponse {
  id: number;
  companyName: string;
  wardId?: number | string;
  address?: string;
  website?: string;
  totalActiveJobs?: number;
  companySize?: string;
  description?: string;
  logoUrl?: string;
}

export interface EmployerUpdateResponse {
  id: number;
  employerId: number;
  companyName: string;
  taxCode: string;
  businessLicense: string;
  wardId?: number | string;
  address?: string;
  website?: string;
  companySize?: string;
  description?: string;
  logoUrl?: string;
  reason?: string;
  status: EmployerUpdateStatus;
  createdAt: string;
  approvedAt?: string;
}

// ---- Request types ----
export interface UpdateEmployerRequest {
  companyName: string;
  emailCompany?: string;
  phoneNumber: string;
  businessLicense: string;
  taxCode: string;
  wardId?: number;
  address?: string;
  website?: string;
  companySize?: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateEmployerNowRequest {
  emailCompany?: string;
  phoneNumber: string;
  wardId?: number;
  address?: string;
  website?: string;
  companySize?: string;
  description?: string;
  logoUrl?: string;
}

export interface RejectEmployerRequest {
  reason: string;
}
