import api from "./api";
import { PositionRequest, PositionResponse } from "@/types/position";
import { ApiResponse } from "@/types/apiResponse";

export const positionService = {
    getAllPositions: async () => {
        const response = await api.get<ApiResponse<PositionResponse[]>>( "/positions");
        return response.data;
    },

    getPositionById: async (id: number) => {
        const response = await api.get<ApiResponse<PositionResponse>>(`/positions/${id}`);
        return response.data;
    },

    createPosition: async (data: PositionRequest) => {
        const response = await api.post<ApiResponse<PositionResponse>>( "/positions", data);
        return response.data;
    },

    updatePosition: async (id: number, data: PositionRequest) => {
        const response = await api.put<ApiResponse<PositionResponse>>(`/positions/${id}`, data);
        return response.data;
    },

    deletePosition: async (id: number) => {
        const response = await api.delete<ApiResponse<void>>(`/positions/${id}`);
        return response.data;
    }
};
