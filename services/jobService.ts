import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";
import {
  JobResponse,
  JobApprovalRequest,
  JobVisibilityRequest,
  ApproveJobStatus,
  VisibilityJobStatus,
  JobRequest,
  JobUpdateRequest
} from "@/types/job";


export const jobService = {
  /**
   * Get all jobs with pagination
   */
  getAllJobs: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs", {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Search jobs by keyword with pagination
   */
  searchJobs: async (keyword: string, page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/search", {
      params: { keyword, page, size }
    });
    return response.data.data;
  },

  /**
   * Get jobs by approval status (for Admin)
   */
  getJobsByApproveStatus: async (status: ApproveJobStatus, page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>(`jobs/approve-status/${status}`, {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Get jobs by visibility status
   */
  getJobsByVisibilityStatus: async (status: VisibilityJobStatus, page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>(`jobs/visibility-status/${status}`, {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Get pending jobs for Admin approval
   */
  getPendingJobsForApproval: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/admin/pending", {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Get jobs needing re-approval (due to updates)
   */
  getJobsNeedingReapproval: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/admin/reapproval-needed", {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Admin approves/rejects one or multiple jobs
   */
  approveJobs: async (request: JobApprovalRequest): Promise<void> => {
    await api.post<ApiResponse<void>>("jobs/admin/approve", request);
  },

  /**
   * Admin updates visibility status (ACTIVE/HIDDEN) of one or multiple jobs
   */
  updateJobVisibility: async (request: JobVisibilityRequest): Promise<void> => {
    await api.put<ApiResponse<void>>("jobs/visibility/update", request);
  },

  /**
   * Employer posts a new job
   */
  createJob: async (request: JobRequest): Promise<JobResponse> => {
    const response = await api.post<ApiResponse<JobResponse>>("jobs", request);
    return response.data.data;
  },

  /**
   * Get jobs posted by the logged-in Employer
   */
  getJobsByEmployer: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/employer/my-jobs", {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Employer updates their own job by ID
   */
  updateJob: async (id: number, request: JobUpdateRequest): Promise<JobResponse> => {
    const response = await api.put<ApiResponse<JobResponse>>(`jobs/${id}`, request);
    return response.data.data;
  },

  /**
   * Employer deletes a job by ID
   */
  deleteJob: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`jobs/${id}`);
  },

  /**
   * Get job details by ID
   */
  getJobById: async (id: number): Promise<JobResponse> => {
    const response = await api.get<ApiResponse<JobResponse>>(`jobs/${id}`);
    return response.data.data;
  },

  /**
   * Get recommended jobs for candidate
   */
  getRecommendedJobs: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/recommended", {
      params: { page, size }
    });
    return response.data.data;
  },

  /**
   * Advanced search jobs
   * POST /jobs/advanced-search
   */
  advancedSearchJobs: async (
    request: {
      keyword?: string;
      categoryIds?: number[];
      skillIds?: number[];
      tagIds?: number[];
      positionId?: number;
      experienceLevelId?: number;
      wardId?: number;
      salaryType?: string;
      minSalary?: number;
      maxSalary?: number;
      sortBy?: string;
    },
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<JobResponse>> => {
    const response = await api.post<ApiResponse<PageResponse<JobResponse>>>("jobs/advanced-search", request, {
      params: { page, size }
    });
    return response.data.data;
  }
};

export default jobService;
