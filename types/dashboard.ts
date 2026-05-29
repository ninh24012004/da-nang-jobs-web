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
