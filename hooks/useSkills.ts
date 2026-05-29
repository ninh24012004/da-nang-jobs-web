"use client";

import { useState, useCallback } from "react";
import { skillService } from "@/services/skillService";
import { SkillResponse, SkillFormData } from "@/types/skill";
import { toast } from "sonner";

export function useSkills() {
    const [skills, setSkills] = useState<SkillResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSkills = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await skillService.getAllSkills();
            setSkills(data);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách kỹ năng");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createSkill = useCallback(async (data: SkillFormData) => {
        try {
            setIsSubmitting(true);
            const response = await skillService.createSkill(data);
            toast.success("Thêm kỹ năng thành công!");
            await fetchSkills();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi lưu kỹ năng";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchSkills]);

    const updateSkill = useCallback(async (id: number, data: SkillFormData) => {
        try {
            setIsSubmitting(true);
            const response = await skillService.updateSkill(id, data);
            toast.success("Cập nhật kỹ năng thành công!");
            await fetchSkills();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật kỹ năng";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchSkills]);

    const deleteSkill = useCallback(async (id: number) => {
        try {
            setIsSubmitting(true);
            await skillService.deleteSkill(id);
            toast.success("Xóa kỹ năng thành công!");
            await fetchSkills();
            return { success: true };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi xóa kỹ năng";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchSkills]);

    return {
        skills,
        isLoading,
        isSubmitting,
        fetchSkills,
        createSkill,
        updateSkill,
        deleteSkill,
    };
}
