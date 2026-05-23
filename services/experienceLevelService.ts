import api from "./api";
import { ExperienceLevelRequest, ExperienceLevelResponse } from "@/types/experienceLevel";
import { ApiResponse } from "@/types/apiResponse";

export const experienceLevelService = {
    getAllExperienceLevels: async () => {
        const response = await api.get<ApiResponse<ExperienceLevelResponse[]>>("/experience-levels");
        return response.data;
    },

    getExperienceLevelById: async (id: number) => {
        const response = await api.get<ApiResponse<ExperienceLevelResponse>>(`/experience-levels/${id}`);
        return response.data;
    },

    createExperienceLevel: async (data: ExperienceLevelRequest) => {
        const response = await api.post<ApiResponse<ExperienceLevelResponse>>("/experience-levels", data);
        return response.data;
    },

    updateExperienceLevel: async (id: number, data: ExperienceLevelRequest) => {
        const response = await api.put<ApiResponse<ExperienceLevelResponse>>(`/experience-levels/${id}`, data);
        return response.data;
    },

    deleteExperienceLevel: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/experience-levels/${id}`);
        return response.data;
    },
};
