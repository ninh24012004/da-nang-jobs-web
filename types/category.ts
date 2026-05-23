import { ApiResponse } from "./apiResponse";

export interface CategoryResponse {
    id: number;
    categoryName: string;
    parentCategoryId: number | null;
    createdAt: string;
}

export interface CategoryRequest {
    categoryName: string;
    parentCategoryId: number | null;
}

export interface CategoryTreeResponse {
    id: number;
    categoryName: string;
    children: CategoryTreeResponse[];
}

export interface Category {
    id: number;
    categoryName: string;
    parentId: number | null;
    children?: Category[];
}

export type CategoryFormData = {
    categoryName: string;
    parentId: number | null;
};
