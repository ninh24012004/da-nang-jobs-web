export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";

export interface ApplicationRequest {
  jobId: number;
  resumeId: number;
}

export interface UpdateStatusRequest {
  status: ApplicationStatus;
}

export interface ApplicationResponse {
  id: number;
  candidateId: number;
  candidateName?: string;
  candidateEmail?: string;
  candidateAddress?: string;
  candidateWardName?: string;
  jobId: number;
  jobTitle: string;
  resumeId: number;
  resumeTitle: string;
  resumeFileUrl: string;
  status: ApplicationStatus;
  appliedAt: string;
}
