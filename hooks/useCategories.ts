"use client";

import { useState, useCallback } from "react";
import { categoryService } from "@/services/categoryService";
import { Category, CategoryFormData, CategoryTreeResponse } from "@/types/category";
import { toast } from "sonner";

// Map API Tree to UI Tree helper inside the hook
const mapTree = (tree: CategoryTreeResponse[], parentId: number | null = null): Category[] => {
    return tree.map(node => ({
        id: node.id,
        categoryName: node.categoryName,
        parentId: parentId,
        children: node.children ? mapTree(node.children, node.id) : []
    }));
};

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchResults, setSearchResults] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await categoryService.getCategoryTree();
            const mapped = mapTree(data);
            setCategories(mapped);
            return mapped;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh mục");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFlatCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await categoryService.getAllCategories();
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách ngành nghề");
        } finally {
            setIsLoading(false);
        }
    }, []);


    const searchCategories = useCallback(async (keyword: string) => {
        if (!keyword.trim()) {
            setSearchResults([]);
            return [];
        }
        try {
            setIsSearching(true);
            const data = await categoryService.searchCategories(keyword);
            const mapped = data.map(item => ({
                id: item.id,
                categoryName: item.categoryName,
                parentId: item.parentId,
                children: []
            }));
            setSearchResults(mapped);
            return mapped;
        } catch (error) {
            console.error("Search error:", error);
            return [];
        } finally {
            setIsSearching(false);
        }
    }, []);

    const createCategory = useCallback(async (data: CategoryFormData) => {
        try {
            setIsSubmitting(true);
            const requestData = {
                categoryName: data.categoryName,
                parentId: data.parentId
            };
            const response = await categoryService.createCategory(requestData);
            toast.success("Thêm danh mục thành công!");
            await fetchCategories();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi lưu danh mục";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchCategories]);

    const updateCategory = useCallback(async (id: number, data: CategoryFormData) => {
        try {
            setIsSubmitting(true);
            const requestData = {
                categoryName: data.categoryName,
                parentId: data.parentId
            };
            const response = await categoryService.updateCategory(id, requestData);
            toast.success("Cập nhật danh mục thành công!");
            await fetchCategories();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật danh mục";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchCategories]);

    const deleteCategory = useCallback(async (id: number) => {
        try {
            setIsSubmitting(true);
            await categoryService.deleteCategory(id);
            toast.success("Xóa danh mục thành công!");
            await fetchCategories();
            return { success: true };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi xóa danh mục";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchCategories]);

    return {
        categories,
        searchResults,
        isLoading,
        isSearching,
        isSubmitting,
        fetchCategories,
        searchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        setSearchResults,
        fetchFlatCategories,
    };
}
