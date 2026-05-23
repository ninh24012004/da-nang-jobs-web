import api from "./api";
import {
    DistrictRequest,
    DistrictResponse,
    WardRequest,
    WardResponse,
} from "@/types/location";
import { ApiResponse } from "@/types/apiResponse";

export const locationService = {
    getAllDistricts: async () => {
        const response = await api.get<ApiResponse<DistrictResponse[]>>("/districts");
        return response.data;
    },

    getDistrictById: async (id: number) => {
        const response = await api.get<ApiResponse<DistrictResponse>>(`/districts/${id}`);
        return response.data;
    },

    createDistrict: async (data: DistrictRequest) => {
        const response = await api.post<ApiResponse<DistrictResponse>>("/districts", data);
        return response.data;
    },

    updateDistrict: async (id: number, data: DistrictRequest) => {
        const response = await api.put<ApiResponse<DistrictResponse>>(`/districts/${id}`, data);
        return response.data;
    },

    deleteDistrict: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/districts/${id}`);
        return response.data;
    },

    getAllWards: async () => {
        const response = await api.get<ApiResponse<WardResponse[]>>("/wards");
        return response.data;
    },

    getWardById: async (id: number) => {
        const response = await api.get<ApiResponse<WardResponse>>(`/wards/${id}`);
        return response.data;
    },

    getWardsByDistrict: async (districtId: number) => {
        const response = await api.get<ApiResponse<WardResponse[]>>(`/wards/district/${districtId}`);
        return response.data;
    },

    createWard: async (data: WardRequest) => {
        const response = await api.post<ApiResponse<WardResponse>>("/wards", data);
        return response.data;
    },

    updateWard: async (id: number, data: WardRequest) => {
        const response = await api.put<ApiResponse<WardResponse>>(`/wards/${id}`, data);
        return response.data;
    },

    deleteWard: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/wards/${id}`);
        return response.data;
    },
};
