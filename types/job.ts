export type ApproveJobStatus = "PENDING" | "APPROVED" | "REJECTED";
export type VisibilityJobStatus = "ACTIVE" | "HIDDEN";

export interface JobResponse {
  id: number;
  logoUrl?: string;
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string;
  jobBenefits: string;
  salaryType: string;
  minimumSalary: number;
  maximumSalary: number;
  address: string;
  deadline: string;
  createdAt: string;
  approvedAt?: string;
  viewCount: number;
  rejectionReason?: string;
  needsReapproval: boolean;
  approveStatus: ApproveJobStatus;
  visibilityStatus: VisibilityJobStatus;

  positionId?: number;
  positionName?: string;

  experienceLevelId?: number;
  experienceLevelName?: string;

  wardId?: number;
  wardName?: string;

  employerId?: number;
  employerName?: string;

  categoryIds?: number[];
  categoryNames?: string[];

  skillIds?: number[];
  skillNames?: string[];

  tagIds?: number[];
  tagNames?: string[];
}

export interface JobRequest {
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string;
  jobBenefits: string;
  salaryType: string;
  minimumSalary: number;
  maximumSalary: number;
  address: string;
  deadline: string;
  positionId: number;
  experienceLevelId?: number;
  wardId: number;
  categoryIds?: number[];
  skillIds?: number[];
  tagIds?: number[];
}

export interface JobUpdateRequest {
  jobTitle?: string;
  jobDescription?: string;
  jobRequirements?: string;
  jobBenefits?: string;
  salaryType?: string;
  minimumSalary?: number;
  maximumSalary?: number;
  address?: string;
  deadline?: string;
  positionId?: number;
  experienceLevelId?: number;
  wardId?: number;
  categoryIds?: number[];
  skillIds?: number[];
  tagIds?: number[];
}

export interface JobApprovalRequest {
  jobIds: number[];
  status: ApproveJobStatus;
  rejectionReason?: string;
}

export interface JobVisibilityRequest {
  jobIds: number[];
  visibilityStatus: VisibilityJobStatus;
}
