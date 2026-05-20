import api from "./api";
import { 
    CategoryRequest, 
    CategoryResponse, 
    CategoryTreeResponse 
} from "@/types/category";
import { ApiResponse } from "@/types/auth";

export const categoryService = {
    getCategoryTree: async () => {
        const response = await api.get<ApiResponse<CategoryTreeResponse[]>>("/categories/tree");
        return response.data;
    },

    createCategory: async (data: CategoryRequest) => {
        const response = await api.post<ApiResponse<CategoryResponse>>("/categories", data);
        return response.data;
    },

    updateCategory: async (id: number, data: CategoryRequest) => {
        const response = await api.put<ApiResponse<CategoryResponse>>(`/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
        return response.data;
    },

    getCategoryById: async (id: number) => {
        const response = await api.get<ApiResponse<CategoryResponse>>(`/categories/${id}`);
        return response.data;
    },

    searchCategories: async (keyword: string) => {
        const response = await api.get<ApiResponse<CategoryResponse[]>>(`/categories/search`, {
            params: { keyword }
        });
        return response.data;
    },
};
