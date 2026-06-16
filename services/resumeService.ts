import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { ResumeRequest, ResumeResponse } from "@/types/resume";

// Local storage key for fallback persistence
const LOCAL_RESUME_KEY = "danang_job_web_local_resumes";

// Helper to get local resumes list from localStorage
const getLocalResumes = (): ResumeResponse[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_RESUME_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_RESUME_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

// Helper to save local resumes list to localStorage
const saveLocalResumes = (resumes: ResumeResponse[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_RESUME_KEY, JSON.stringify(resumes));
  }
};

export const resumeService = {
  /**
   * Tạo mới CV
   * POST /api/resumes -> "resumes"
   */
  createResume: async (request: ResumeRequest): Promise<ResumeResponse> => {
    try {
      const response = await api.post<ApiResponse<ResumeResponse>>("resumes", request);
      if (response.data.data) {
        const local = getLocalResumes();
        if (request.isDefault) {
          local.forEach(r => r.isDefault = false);
        }
        local.unshift(response.data.data);
        saveLocalResumes(local);
        return response.data.data;
      }
      throw new Error("Empty API response");
    } catch (error: any) {
      console.warn("createResume API failed. Falling back to local storage:", error?.message || error);
      const local = getLocalResumes();
      if (request.isDefault) {
        local.forEach(r => r.isDefault = false);
      }
      const newResume: ResumeResponse = {
        id: Date.now(),
        title: request.title,
        description: request.description,
        fileUrl: request.fileUrl,
        isDefault: request.isDefault || local.length === 0,
        createdAt: new Date().toISOString()
      };
      local.unshift(newResume);
      saveLocalResumes(local);
      return newResume;
    }
  },

  /**
   * Lấy danh sách CV của tôi
   * GET /api/resumes/my-resumes -> "resumes/my-resumes"
   */
  getMyResumes: async (): Promise<ResumeResponse[]> => {
    try {
      const response = await api.get<ApiResponse<ResumeResponse[]>>("resumes/my-resumes");
      if (response.data.data) {
        saveLocalResumes(response.data.data);
        return response.data.data;
      }
      return getLocalResumes();
    } catch (error: any) {
      console.log("getMyResumes API fell back to local storage (Backend endpoint offline/404):", error?.message || error);
      return getLocalResumes();
    }
  },

  /**
   * Lấy CV theo ID
   * GET /api/resumes/{id} -> "resumes/{id}"
   */
  getResumeById: async (id: number): Promise<ResumeResponse> => {
    try {
      const response = await api.get<ApiResponse<ResumeResponse>>(`resumes/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.warn(`getResumeById API failed for ID ${id}. Falling back to local storage:`, error?.message || error);
      const local = getLocalResumes();
      const found = local.find(r => r.id === id);
      if (found) return found;
      throw error;
    }
  },

  /**
   * Đặt CV mặc định
   * PUT /api/resumes/{id}/default -> "resumes/{id}/default"
   */
  setDefaultResume: async (id: number): Promise<ResumeResponse> => {
    try {
      const response = await api.put<ApiResponse<ResumeResponse>>(`resumes/${id}/default`);
      if (response.data.data) {
        const local = getLocalResumes();
        local.forEach(r => r.isDefault = (r.id === id));
        saveLocalResumes(local);
        return response.data.data;
      }
      throw new Error("Empty API response");
    } catch (error: any) {
      console.warn(`setDefaultResume API failed for ID ${id}. Falling back to local storage:`, error?.message || error);
      const local = getLocalResumes();
      let updatedResume: ResumeResponse | null = null;
      local.forEach(r => {
        r.isDefault = (r.id === id);
        if (r.id === id) updatedResume = r;
      });
      saveLocalResumes(local);
      if (updatedResume) return updatedResume;
      throw error;
    }
  },

  /**
   * Xóa CV
   * DELETE /api/resumes/{id} -> "resumes/{id}"
   */
  deleteResume: async (id: number): Promise<void> => {
    try {
      await api.delete<ApiResponse<void>>(`resumes/${id}`);
      const local = getLocalResumes();
      const filtered = local.filter(r => r.id !== id);
      saveLocalResumes(filtered);
    } catch (error: any) {
      console.warn(`deleteResume API failed for ID ${id}. Falling back to local storage:`, error?.message || error);
      const local = getLocalResumes();
      const filtered = local.filter(r => r.id !== id);
      saveLocalResumes(filtered);
    }
  }
};

export default resumeService;
