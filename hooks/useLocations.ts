"use client";

import { useState, useCallback } from "react";
import { locationService } from "@/services/locationService";
import {
    DistrictResponse,
    WardResponse,
    DistrictFormData,
    WardFormData,
} from "@/types/location";
import { toast } from "sonner";

export function useLocations() {
    const [districts, setDistricts] = useState<DistrictResponse[]>([]);
    const [wards, setWards] = useState<WardResponse[]>([]);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDistricts = useCallback(async () => {
        try {
            setIsLoadingDistricts(true);
            const data = await locationService.getAllDistricts();
            setDistricts(data);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách quận/huyện");
        } finally {
            setIsLoadingDistricts(false);
        }
    }, []);

    const fetchAllWards = useCallback(async () => {
        try {
            setIsLoadingWards(true);
            const data = await locationService.getAllWards();
            setWards(data);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách phường/xã");
        } finally {
            setIsLoadingWards(false);
        }
    }, []);


    const fetchWards = useCallback(async (districtId: number | null) => {
        if (districtId === null) {
            setWards([]);
            return [];
        }
        try {
            setIsLoadingWards(true);
            const data = await locationService.getWardsByDistrict(districtId);
            setWards(data);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách phường/xã");
            return [];
        } finally {
            setIsLoadingWards(false);
        }
    }, []);

    const fetchWardById = useCallback(async (id: number) => {
        try {
            setIsLoadingWards(true);
            const data = await locationService.getWardById(id);
            return data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải thông tin phường/xã");
        } finally {
            setIsLoadingWards(false);
        }
    }, []);


    const createDistrict = useCallback(async (data: DistrictFormData) => {
        try {
            setIsSubmitting(true);
            const response = await locationService.createDistrict(data);
            toast.success("Thêm quận/huyện thành công!");
            await fetchDistricts();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi tạo quận/huyện";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchDistricts]);

    const updateDistrict = useCallback(async (id: number, data: DistrictFormData) => {
        try {
            setIsSubmitting(true);
            const response = await locationService.updateDistrict(id, data);
            toast.success("Cập nhật quận/huyện thành công!");
            await fetchDistricts();
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật quận/huyện";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchDistricts]);

    const deleteDistrict = useCallback(async (id: number) => {
        try {
            setIsSubmitting(true);
            await locationService.deleteDistrict(id);
            toast.success("Xóa quận/huyện thành công!");
            await fetchDistricts();
            return { success: true };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi xóa quận/huyện";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchDistricts]);

    const createWard = useCallback(async (data: WardFormData) => {
        try {
            setIsSubmitting(true);
            const response = await locationService.createWard(data);
            toast.success("Thêm phường/xã thành công!");
            await fetchWards(data.districtId);
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi tạo phường/xã";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchWards]);

    const updateWard = useCallback(async (id: number, data: WardFormData) => {
        try {
            setIsSubmitting(true);
            const response = await locationService.updateWard(id, data);
            toast.success("Cập nhật phường/xã thành công!");
            await fetchWards(data.districtId);
            return { success: true, data: response };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật phường/xã";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchWards]);

    const deleteWard = useCallback(async (id: number, districtId: number) => {
        try {
            setIsSubmitting(true);
            await locationService.deleteWard(id);
            toast.success("Xóa phường/xã thành công!");
            await fetchWards(districtId);
            return { success: true };
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi xóa phường/xã";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchWards]);

    return {
        districts,
        wards,
        isLoadingDistricts,
        isLoadingWards,
        isSubmitting,
        fetchDistricts,
        fetchWards,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        createWard,
        updateWard,
        deleteWard,
        setWards,
        fetchWardById,
        fetchAllWards,
    };
}
