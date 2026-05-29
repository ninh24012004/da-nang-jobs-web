"use client";

import { useState, useCallback } from "react";
import { experienceLevelService } from "@/services/experienceLevelService";
import { ExperienceLevelResponse, ExperienceLevelFormData } from "@/types/experienceLevel";
import { toast } from "sonner";

export function useExperienceLevels() {
    const [experienceLevels, setExperienceLevels] = useState<ExperienceLevelResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchExperienceLevels = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await experienceLevelService.getAllExperienceLevels();
            setExperienceLevels(data);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách cấp độ kinh nghiệm");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createExperienceLevel = useCallback(async (data: ExperienceLevelFormData) => {
        try {
            setIsSubmitting(true);
            const response = await experienceLevelService.createExperienceLevel(data);
            toast.success("Thêm cấp độ kinh nghiệm thành công!");
            await fetchExperienceLevels();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi lưu cấp độ kinh nghiệm";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchExperienceLevels]);

    const updateExperienceLevel = useCallback(async (id: number, data: ExperienceLevelFormData) => {
        try {
            setIsSubmitting(true);
            const response = await experienceLevelService.updateExperienceLevel(id, data);
            toast.success("Cập nhật cấp độ kinh nghiệm thành công!");
            await fetchExperienceLevels();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật cấp độ kinh nghiệm";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchExperienceLevels]);

    const deleteExperienceLevel = useCallback(async (id: number) => {
        try {
            setIsSubmitting(true);
            await experienceLevelService.deleteExperienceLevel(id);
            toast.success("Xóa cấp độ kinh nghiệm thành công!");
            await fetchExperienceLevels();
            return { success: true };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi xóa cấp độ kinh nghiệm";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchExperienceLevels]);

    return {
        experienceLevels,
        isLoading,
        isSubmitting,
        fetchExperienceLevels,
        createExperienceLevel,
        updateExperienceLevel,
        deleteExperienceLevel,
    };
}
