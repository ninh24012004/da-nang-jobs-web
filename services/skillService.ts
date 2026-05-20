import api from "./api";
import { SkillRequest, SkillResponse } from "@/types/skill";
import { ApiResponse } from "@/types/auth";

export const skillService = {
    getAllSkills: async () => {
        const response = await api.get<ApiResponse<SkillResponse[]>>("/skills");
        return response.data;
    },

    getSkillById: async (id: number) => {
        const response = await api.get<ApiResponse<SkillResponse>>(`/skills/${id}`);
        return response.data;
    },

    createSkill: async (data: SkillRequest) => {
        const response = await api.post<ApiResponse<SkillResponse>>("/skills", data);
        return response.data;
    },

    updateSkill: async (id: number, data: SkillRequest) => {
        const response = await api.put<ApiResponse<SkillResponse>>(`/skills/${id}`, data);
        return response.data;
    },

    deleteSkill: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/skills/${id}`);
        return response.data;
    },
};
