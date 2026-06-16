import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { ExperienceLevelRequest, ExperienceLevelResponse } from "@/types/experienceLevel";
import { getCachedOrFetch, invalidateCache } from "@/lib/cache";

export const experienceLevelService = {
  /** GET /experience-levels */
  getAllExperienceLevels: async (): Promise<ExperienceLevelResponse[]> => {
    return getCachedOrFetch("cache_experience_levels", async () => {
      const response = await api.get<ApiResponse<ExperienceLevelResponse[]>>("/experience-levels");
      return response.data.data;
    });
  },

  /** GET /experience-levels/:id */
  getExperienceLevelById: async (id: number): Promise<ExperienceLevelResponse> => {
    const response = await api.get<ApiResponse<ExperienceLevelResponse>>(`/experience-levels/${id}`);
    return response.data.data;
  },

  /** POST /experience-levels */
  createExperienceLevel: async (data: ExperienceLevelRequest): Promise<ExperienceLevelResponse> => {
    const response = await api.post<ApiResponse<ExperienceLevelResponse>>("/experience-levels", data);
    invalidateCache("cache_experience_levels");
    return response.data.data;
  },

  /** PUT /experience-levels/:id */
  updateExperienceLevel: async (id: number, data: ExperienceLevelRequest): Promise<ExperienceLevelResponse> => {
    const response = await api.put<ApiResponse<ExperienceLevelResponse>>(`/experience-levels/${id}`, data);
    invalidateCache("cache_experience_levels");
    return response.data.data;
  },

  /** DELETE /experience-levels/:id */
  deleteExperienceLevel: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/experience-levels/${id}`);
    invalidateCache("cache_experience_levels");
  },
};

export default experienceLevelService;
