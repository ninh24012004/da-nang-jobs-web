import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { SkillRequest, SkillResponse } from "@/types/skill";

export const skillService = {
  /** GET /skills */
  getAllSkills: async (): Promise<SkillResponse[]> => {
    const response = await api.get<ApiResponse<SkillResponse[]>>("/skills");
    return response.data.data;
  },

  /** GET /skills/:id */
  getSkillById: async (id: number): Promise<SkillResponse> => {
    const response = await api.get<ApiResponse<SkillResponse>>(`/skills/${id}`);
    return response.data.data;
  },

  /** POST /skills */
  createSkill: async (data: SkillRequest): Promise<SkillResponse> => {
    const response = await api.post<ApiResponse<SkillResponse>>("/skills", data);
    return response.data.data;
  },

  /** PUT /skills/:id */
  updateSkill: async (id: number, data: SkillRequest): Promise<SkillResponse> => {
    const response = await api.put<ApiResponse<SkillResponse>>(`/skills/${id}`, data);
    return response.data.data;
  },

  /** DELETE /skills/:id */
  deleteSkill: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/skills/${id}`);
  },
};

export default skillService;
