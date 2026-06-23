export interface DashboardMetrics {
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  pendingJobs: number;
  pendingEmployers: number;
}

export interface DailyTrendResponse {
  date: string; // YYYY-MM-DD
  candidates: number;
  employers: number;
  jobs: number;
  applications: number;
}

export interface CategoryStatsResponse {
  categoryName: string;
  jobCount: number;
}

export interface StatusStatsResponse {
  statusName: string;
  count: number;
}

export interface DashboardSummaryResponse {
  metrics: DashboardMetrics;
  jobsByCategory: CategoryStatsResponse[];
  applicationsByStatus: StatusStatsResponse[];
}

// ==================== EMPLOYER DASHBOARD TYPES ====================

export interface EmployerDashboardMetrics {
  totalJobs: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  cancelledApplications: number;
}

export interface EmployerJobStatsResponse {
  categoryName: string;
  jobCount: number;
}

export interface EmployerApplicationStatsResponse {
  statusName: string;
  count: number;
}

export interface EmployerJobResponse {
  jobId: number;
  jobTitle: string;
  applicationCount: number;
  approveStatus: string;
  visibilityStatus: string;
  createdAt: string;
}

export interface EmployerApplicationResponse {
  applicationId: number;
  candidateName: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
}

export interface EmployerDailyTrendResponse {
  date: string; // YYYY-MM-DD
  jobPosts: number;
  applications: number;
}

export interface EmployerDashboardSummaryResponse {
  metrics: EmployerDashboardMetrics;
  recentJobs: EmployerJobResponse[];
  recentApplications: EmployerApplicationResponse[];
  jobsByCategory: EmployerJobStatsResponse[];
  applicationsByStatus: EmployerApplicationStatsResponse[];
}
