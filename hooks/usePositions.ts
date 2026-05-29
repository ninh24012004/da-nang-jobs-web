"use client";

import { useState, useCallback } from "react";
import { positionService } from "@/services/positionService";
import { PositionResponse, PositionFormData } from "@/types/position";
import { toast } from "sonner";

export function usePositions() {
    const [positions, setPositions] = useState<PositionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPositions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await positionService.getAllPositions();
            setPositions(data);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách cấp bậc");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createPosition = useCallback(async (data: PositionFormData) => {
        try {
            setIsSubmitting(true);
            const response = await positionService.createPosition(data);
            toast.success("Thêm cấp bậc thành công!");
            await fetchPositions();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi lưu cấp bậc";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchPositions]);

    const updatePosition = useCallback(async (id: number, data: PositionFormData) => {
        try {
            setIsSubmitting(true);
            const response = await positionService.updatePosition(id, data);
            toast.success("Cập nhật cấp bậc thành công!");
            await fetchPositions();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật cấp bậc";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchPositions]);

    const deletePosition = useCallback(async (id: number) => {
        try {
            setIsSubmitting(true);
            await positionService.deletePosition(id);
            toast.success("Xóa cấp bậc thành công!");
            await fetchPositions();
            return { success: true };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi xóa cấp bậc";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchPositions]);

    return {
        positions,
        isLoading,
        isSubmitting,
        fetchPositions,
        createPosition,
        updatePosition,
        deletePosition,
    };
}
