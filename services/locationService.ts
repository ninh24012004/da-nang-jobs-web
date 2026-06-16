import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import {
  DistrictRequest,
  DistrictResponse,
  WardRequest,
  WardResponse,
} from "@/types/location";
import { getCachedOrFetch, invalidateCache } from "@/lib/cache";

export const locationService = {
  // ---- Districts ----

  /** GET /districts */
  getAllDistricts: async (): Promise<DistrictResponse[]> => {
    return getCachedOrFetch("cache_districts", async () => {
      const response = await api.get<ApiResponse<DistrictResponse[]>>("/districts");
      return response.data.data;
    });
  },

  /** GET /districts/:id */
  getDistrictById: async (id: number): Promise<DistrictResponse> => {
    const response = await api.get<ApiResponse<DistrictResponse>>(`/districts/${id}`);
    return response.data.data;
  },

  /** POST /districts */
  createDistrict: async (data: DistrictRequest): Promise<DistrictResponse> => {
    const response = await api.post<ApiResponse<DistrictResponse>>("/districts", data);
    invalidateCache("cache_districts");
    return response.data.data;
  },

  /** PUT /districts/:id */
  updateDistrict: async (id: number, data: DistrictRequest): Promise<DistrictResponse> => {
    const response = await api.put<ApiResponse<DistrictResponse>>(`/districts/${id}`, data);
    invalidateCache("cache_districts");
    return response.data.data;
  },

  /** DELETE /districts/:id */
  deleteDistrict: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/districts/${id}`);
    invalidateCache("cache_districts");
  },

  // ---- Wards ----

  /** GET /wards */
  getAllWards: async (): Promise<WardResponse[]> => {
    const response = await api.get<ApiResponse<WardResponse[]>>("/wards");
    return response.data.data;
  },

  /** GET /wards/:id */
  getWardById: async (id: number): Promise<WardResponse> => {
    const response = await api.get<ApiResponse<WardResponse>>(`/wards/${id}`);
    return response.data.data;
  },

  /** GET /wards/district/:districtId */
  getWardsByDistrict: async (districtId: number): Promise<WardResponse[]> => {
    const response = await api.get<ApiResponse<WardResponse[]>>(`/wards/district/${districtId}`);
    return response.data.data;
  },

  /** POST /wards */
  createWard: async (data: WardRequest): Promise<WardResponse> => {
    const response = await api.post<ApiResponse<WardResponse>>("/wards", data);
    return response.data.data;
  },

  /** PUT /wards/:id */
  updateWard: async (id: number, data: WardRequest): Promise<WardResponse> => {
    const response = await api.put<ApiResponse<WardResponse>>(`/wards/${id}`, data);
    return response.data.data;
  },

  /** DELETE /wards/:id */
  deleteWard: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/wards/${id}`);
  },
};

export default locationService;
