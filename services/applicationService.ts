import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";
import {
  ApplicationRequest,
  ApplicationResponse,
  UpdateStatusRequest
} from "@/types/application";

// Local storage key for mock persistence
const LOCAL_APP_KEY = "danang_job_web_local_applications";

// Helper to get local mock list
const getLocalApplications = (): ApplicationResponse[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_APP_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

// Helper to save local mock list
const saveLocalApplications = (apps: ApplicationResponse[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_APP_KEY, JSON.stringify(apps));
  }
};

function getMockPageResponse<T>(items: T[], page: number, size: number): PageResponse<T> {
  const start = page * size;
  const end = start + size;
  const pagedItems = items.slice(start, end);
  const totalPages = Math.ceil(items.length / size) || 1;
  return {
    content: pagedItems,
    pageNumber: page,
    pageSize: size,
    totalElements: items.length,
    totalPages: totalPages,
    last: page >= totalPages - 1
  };
}

export const applicationService = {
  /**
   * Post a new job application (Candidate)
   * POST /api/applications
   */
  applyJob: async (request: ApplicationRequest): Promise<ApplicationResponse> => {
    try {
      const response = await api.post<ApiResponse<ApplicationResponse>>("applications", request);
      // Also sync to local so candidate list stays in sync when backend is online
      try {
        const localApps = getLocalApplications();
        const exists = localApps.some(a => a.jobId === request.jobId);
        if (!exists && response.data.data) {
          localApps.unshift(response.data.data);
          saveLocalApplications(localApps);
        }
      } catch (e) {}
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw error;
      }

      console.warn("applyJob API failed. Falling back to local persistence:", error?.message || error);

      const localApps = getLocalApplications();
      const existing = localApps.find(a => a.jobId === request.jobId);
      if (existing) return existing;

      const jobTitle = "Vị trí lập trình viên";

      const newApp: ApplicationResponse = {
        id: Date.now(),
        candidateId: 1,
        candidateName: "Ứng viên",
        candidateEmail: "",
        candidateAddress: "",
        candidateWardName: "",
        jobId: request.jobId,
        jobTitle,
        resumeId: request.resumeId,
        resumeTitle: `CV trực tuyến #${request.resumeId}`,
        resumeFileUrl: "",
        status: "PENDING",
        appliedAt: new Date().toISOString()
      };

      localApps.unshift(newApp);
      saveLocalApplications(localApps);
      return newApp;
    }
  },

  /**
   * Get applications submitted by candidate
   * GET /api/applications/my-applications
   */
  getMyApplications: async (page: number = 0, size: number = 10): Promise<PageResponse<ApplicationResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<ApplicationResponse>>>("applications/my-applications", {
        params: { page, size }
      });
      // Sync to local so offline fallback stays fresh
      try {
        if (response.data.data?.content) {
          saveLocalApplications(response.data.data.content);
        }
      } catch (e) {}
      return response.data.data;
    } catch (error: any) {
      console.warn("getMyApplications API failed. Falling back to local persistence:", error?.message || error);
      const localApps = getLocalApplications();
      return getMockPageResponse(localApps, page, size);
    }
  },

  /**
   * Get all applications for an employer
   * GET /api/applications/employer
   */
  getApplicationsForEmployer: async (page: number = 0, size: number = 10): Promise<PageResponse<ApplicationResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<ApplicationResponse>>>("applications/employer", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error: any) {
      console.warn("getApplicationsForEmployer API failed. Falling back to local persistence:", error?.message || error);
      const localApps = getLocalApplications();
      return getMockPageResponse(localApps, page, size);
    }
  },

  /**
   * Get applications for a specific job
   * GET /api/applications/job/{jobId}
   */
  getApplicationsByJob: async (jobId: number, page: number = 0, size: number = 10): Promise<PageResponse<ApplicationResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<ApplicationResponse>>>(`applications/job/${jobId}`, {
        params: { page, size }
      });
      return response.data.data;
    } catch (error: any) {
      console.warn(`getApplicationsByJob API failed for jobId ${jobId}:`, error?.message || error);
      const localApps = getLocalApplications();
      const filtered = localApps.filter(a => a.jobId === jobId);
      return getMockPageResponse(filtered, page, size);
    }
  },

  /**
   * Update application status (Employer)
   * PUT /api/applications/{id}/status
   */
  updateStatus: async (id: number, request: UpdateStatusRequest): Promise<ApplicationResponse> => {
    try {
      const response = await api.put<ApiResponse<ApplicationResponse>>(`applications/${id}/status`, request);
      // Sync to local cache
      try {
        const localApps = getLocalApplications();
        const appIndex = localApps.findIndex(a => a.id === id);
        if (appIndex !== -1 && response.data.data) {
          localApps[appIndex] = response.data.data;
          saveLocalApplications(localApps);
        }
      } catch (e) {}
      return response.data.data;
    } catch (error: any) {
      console.warn(`updateStatus API failed for id ${id}. Updating local persistence:`, error?.message || error);
      const localApps = getLocalApplications();
      const appIndex = localApps.findIndex(a => a.id === id);
      if (appIndex !== -1) {
        localApps[appIndex].status = request.status;
        saveLocalApplications(localApps);
        return localApps[appIndex];
      }
      throw error;
    }
  },

  /**
   * Cancel an application (Candidate)
   * PUT /api/applications/{id}/cancel
   */
  cancelApplication: async (id: number): Promise<ApplicationResponse> => {
    try {
      const response = await api.put<ApiResponse<ApplicationResponse>>(`applications/${id}/cancel`);
      // Sync to local cache
      try {
        const localApps = getLocalApplications();
        const appIndex = localApps.findIndex(a => a.id === id);
        if (appIndex !== -1 && response.data.data) {
          localApps[appIndex] = response.data.data;
          saveLocalApplications(localApps);
        }
      } catch (e) {}
      return response.data.data;
    } catch (error: any) {
      console.warn(`cancelApplication API failed for id ${id}. Updating local persistence:`, error?.message || error);
      const localApps = getLocalApplications();
      const appIndex = localApps.findIndex(a => a.id === id);
      if (appIndex !== -1) {
        localApps[appIndex].status = "CANCELED";
        saveLocalApplications(localApps);
        return localApps[appIndex];
      }
      throw error;
    }
  },

  /**
   * Export candidate applications to Excel (Employer)
   * GET /api/applications/employer/export
   */
  exportApplicationsToExcel: async (status?: string): Promise<Blob> => {
    const response = await api.get("applications/employer/export", {
      params: { status: status === "ALL" ? undefined : status },
      responseType: "blob"
    });
    return response.data;
  }
};

export default applicationService;
