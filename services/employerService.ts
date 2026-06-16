import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";
import {
  EmployerResponse,
  UpdateEmployerRequest,
  UpdateEmployerNowRequest,
  RejectEmployerRequest,
  EmployerStatus,
  EmployerPublicResponse,
} from "@/types/employer";


export const employerService = {
  /** GET /employers/profile — Lấy profile nhà tuyển dụng đang đăng nhập */
  getEmployerProfile: async (): Promise<EmployerResponse> => {
    const response = await api.get<ApiResponse<EmployerResponse>>("employers/profile");
    return response.data.data;
  },

  /** PUT /employers/profile — Cập nhật profile (cần duyệt) */
  updateEmployerProfile: async (request: UpdateEmployerRequest): Promise<EmployerResponse> => {
    const response = await api.put<ApiResponse<EmployerResponse>>("employers/profile", request);
    return response.data.data;
  },

  /** PUT /employers/profile-now — Cập nhật profile ngay (không cần duyệt) */
  updateEmployerProfileNow: async (request: UpdateEmployerNowRequest): Promise<EmployerResponse> => {
    const response = await api.put<ApiResponse<EmployerResponse>>("employers/profile-now", request);
    return response.data.data;
  },


  /** GET /employers — Lấy tất cả công ty (Admin) */
  getAllCompanies: async (page: number = 0, size: number = 10): Promise<PageResponse<EmployerResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployerResponse>>>("employers", {
      params: { page, size },
    });
    return response.data.data;
  },


  /** GET /employers/status — Lấy công ty theo trạng thái (Admin) */
  getCompaniesByStatus: async (
    status: EmployerStatus,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<EmployerResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployerResponse>>>("employers/status", {
      params: { status, page, size },
    });
    return response.data.data;
  },

  /** POST /employers/:id/approve — Duyệt nhà tuyển dụng (Admin) */
  approveEmployer: async (employerId: number): Promise<void> => {
    await api.post<ApiResponse<void>>(`employers/${employerId}/approve`);
  },

  /** POST /employers/:id/reject — Từ chối nhà tuyển dụng (Admin) */
  rejectEmployer: async (employerId: number, request: RejectEmployerRequest): Promise<void> => {
    await api.post<ApiResponse<void>>(`employers/${employerId}/reject`, request);
  },

  /** PUT /employers/:id/status — Thay đổi trạng thái nhà tuyển dụng (Admin) */
  changeEmployerStatus: async (employerId: number, newStatus: EmployerStatus): Promise<void> => {
    await api.put<ApiResponse<void>>(`employers/${employerId}/status`, null, {
      params: { status: newStatus, newStatus },
    });
  },

  /** GET /employers/companies/public — Lấy danh sách công ty công khai (Public) */
  getCompaniesForPublic: async (page: number = 0, size: number = 10): Promise<PageResponse<EmployerPublicResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployerPublicResponse>>>("employers/companies/public", {
      params: { page, size }
    });
    return response.data.data;
  },

  /** GET /employers/company/:id/public — Lấy chi tiết công ty công khai (Public) */
  getCompanyById: async (id: number): Promise<EmployerPublicResponse> => {
    const response = await api.get<ApiResponse<EmployerPublicResponse>>(`employers/company/${id}/public`);
    return response.data.data;
  },
};

export default employerService;
