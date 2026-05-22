import api from "./api";
import { TagRequest, TagResponse } from "@/types/tag";
import { ApiResponse } from "@/types/auth";

export const tagService = {
    getAllTags: async () => {
        const response = await api.get<ApiResponse<TagResponse[]>>( "/tags");
        return response.data;
    },

    getTagById: async (id: number) => {
        const response = await api.get<ApiResponse<TagResponse>>(`/tags/${id}`);
        return response.data;
    },

    createTag: async (data: TagRequest) => {
        const response = await api.post<ApiResponse<TagResponse>>( "/tags", data);
        return response.data;
    },

    updateTag: async (id: number, data: TagRequest) => {
        const response = await api.put<ApiResponse<TagResponse>>(`/tags/${id}`, data);
        return response.data;
    },

    deleteTag: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/tags/${id}`);
        return response.data;
    }
};
