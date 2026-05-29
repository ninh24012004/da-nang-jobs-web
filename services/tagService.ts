import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { TagRequest, TagResponse } from "@/types/tag";

export const tagService = {
  /** GET /tags */
  getAllTags: async (): Promise<TagResponse[]> => {
    const response = await api.get<ApiResponse<TagResponse[]>>("/tags");
    return response.data.data;
  },

  /** GET /tags/:id */
  getTagById: async (id: number): Promise<TagResponse> => {
    const response = await api.get<ApiResponse<TagResponse>>(`/tags/${id}`);
    return response.data.data;
  },

  /** POST /tags */
  createTag: async (data: TagRequest): Promise<TagResponse> => {
    const response = await api.post<ApiResponse<TagResponse>>("/tags", data);
    return response.data.data;
  },

  /** PUT /tags/:id */
  updateTag: async (id: number, data: TagRequest): Promise<TagResponse> => {
    const response = await api.put<ApiResponse<TagResponse>>(`/tags/${id}`, data);
    return response.data.data;
  },

  /** DELETE /tags/:id */
  deleteTag: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/tags/${id}`);
  },
};

export default tagService;
