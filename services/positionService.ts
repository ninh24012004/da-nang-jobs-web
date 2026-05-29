import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PositionRequest, PositionResponse } from "@/types/position";
import { getCachedOrFetch } from "@/lib/cache";

export const positionService = {
  /** GET /positions */
  getAllPositions: async (): Promise<PositionResponse[]> => {
    return getCachedOrFetch("cache_positions", async () => {
      const response = await api.get<ApiResponse<PositionResponse[]>>("/positions");
      return response.data.data;
    });
  },

  /** GET /positions/:id */
  getPositionById: async (id: number): Promise<PositionResponse> => {
    const response = await api.get<ApiResponse<PositionResponse>>(`/positions/${id}`);
    return response.data.data;
  },

  /** POST /positions */
  createPosition: async (data: PositionRequest): Promise<PositionResponse> => {
    const response = await api.post<ApiResponse<PositionResponse>>("/positions", data);
    return response.data.data;
  },

  /** PUT /positions/:id */
  updatePosition: async (id: number, data: PositionRequest): Promise<PositionResponse> => {
    const response = await api.put<ApiResponse<PositionResponse>>(`/positions/${id}`, data);
    return response.data.data;
  },

  /** DELETE /positions/:id */
  deletePosition: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/positions/${id}`);
  },
};

export default positionService;
