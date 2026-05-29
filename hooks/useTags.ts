"use client";

import { useState, useCallback } from "react";
import { tagService } from "@/services/tagService";
import { TagResponse, TagFormData } from "@/types/tag";
import { toast } from "sonner";

export function useTags() {
    const [tags, setTags] = useState<TagResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTags = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await tagService.getAllTags();
            setTags(data);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách tag");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createTag = useCallback(async (data: TagFormData) => {
        try {
            setIsSubmitting(true);
            const response = await tagService.createTag(data);
            toast.success("Thêm loại công việc thành công");
            await fetchTags();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi tạo tag";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchTags]);

    const updateTag = useCallback(async (id: number, data: TagFormData) => {
        try {
            setIsSubmitting(true);
            const response = await tagService.updateTag(id, data);
            toast.success("Cập nhật loại công việc thành công");
            await fetchTags();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật tag";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchTags]);

    const deleteTag = useCallback(async (id: number) => {
        try {
            setIsSubmitting(true);
            await tagService.deleteTag(id);
            toast.success("Xóa loại công việc thành công");
            await fetchTags();
            return { success: true };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi xóa tag";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchTags]);

    return {
        tags,
        isLoading,
        isSubmitting,
        fetchTags,
        createTag,
        updateTag,
        deleteTag,
    };
}
