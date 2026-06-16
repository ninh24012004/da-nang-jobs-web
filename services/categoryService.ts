import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import {
  CategoryRequest,
  CategoryResponse,
  CategoryTreeResponse,
} from "@/types/category";
import { getCachedOrFetch, invalidateCache } from "@/lib/cache";

export const categoryService = {
  /**
   * Lấy cây danh mục ngành nghề
   * GET /categories/tree
   */
  getCategoryTree: async (): Promise<CategoryTreeResponse[]> => {
    return getCachedOrFetch("cache_categories_tree", async () => {
      const response = await api.get<ApiResponse<CategoryTreeResponse[]>>("/categories/tree");
      return response.data.data;
    });
  },

  /**
   * Lấy toàn bộ danh mục (dạng flat list, từ tree)
   * GET /categories/tree
   */
  getAllCategories: async (): Promise<CategoryResponse[]> => {
    return getCachedOrFetch("cache_categories_flat", async () => {
      const response = await api.get<ApiResponse<CategoryTreeResponse[]>>("/categories/tree");
      const flatList: CategoryResponse[] = [];
      const flatten = (nodes: CategoryTreeResponse[]) => {
        for (const node of nodes) {
          const parentId = node.parentId ?? node.parentCategoryId ?? null;
          flatList.push({
            id: node.id,
            categoryName: node.categoryName,
            parentId: parentId,
            parentCategoryId: node.parentCategoryId ?? parentId,
          });
          if (node.children && node.children.length > 0) {
            flatten(node.children);
          }
        }
      };
      flatten(response.data.data ?? []);
      return flatList;
    });
  },

  /**
   * Tìm kiếm danh mục theo từ khóa
   * GET /categories/search?keyword=...
   */
  searchCategories: async (keyword: string): Promise<CategoryResponse[]> => {
    const response = await api.get<ApiResponse<CategoryResponse[]>>("/categories/search", {
      params: { keyword },
    });
    return response.data.data;
  },

  /**
   * Lấy danh mục theo id
   * GET /categories/:id
   */
  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    const response = await api.get<ApiResponse<CategoryResponse>>(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Tạo mới danh mục
   * POST /categories
   */
  createCategory: async (data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await api.post<ApiResponse<CategoryResponse>>("/categories", data);
    invalidateCache("cache_categories_tree");
    invalidateCache("cache_categories_flat");
    return response.data.data;
  },

  /**
   * Cập nhật danh mục
   * PUT /categories/:id
   */
  updateCategory: async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await api.put<ApiResponse<CategoryResponse>>(`/categories/${id}`, data);
    invalidateCache("cache_categories_tree");
    invalidateCache("cache_categories_flat");
    return response.data.data;
  },

  /**
   * Xóa danh mục
   * DELETE /categories/:id
   */
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/categories/${id}`);
    invalidateCache("cache_categories_tree");
    invalidateCache("cache_categories_flat");
  },
};

export default categoryService;
