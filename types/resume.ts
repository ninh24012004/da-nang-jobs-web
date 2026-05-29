export interface ResumeRequest {
  title: string;
  description: string;
  fileUrl: string;
  isDefault?: boolean;
}

export interface ResumeResponse {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
}
