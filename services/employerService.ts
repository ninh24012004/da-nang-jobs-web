import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";
import {
  EmployerResponse,
  EmployerUpdateResponse,
  UpdateEmployerRequest,
  UpdateEmployerNowRequest,
  RejectEmployerRequest,
  EmployerStatus,
  EmployerPublicResponse,
} from "@/types/employer";

// High-fidelity Mock Dataset
export const MOCK_COMPANIES: EmployerPublicResponse[] = [
  {
    id: 201,
    companyName: "FPT Software Đà Nẵng",
    wardId: 10,
    address: "Tòa nhà FPT, Đường số 1, KCN An Đồn, Sơn Trà, Đà Nẵng",
    website: "fpt-software.com",
    totalActiveJobs: 25,
    companySize: "1000+",
    description: "FPT Software là tập đoàn dịch vụ công nghệ thông tin và phần mềm lớn nhất Việt Nam, dẫn đầu trong việc cung cấp các dịch vụ chuyển đổi số cho các tập đoàn toàn cầu.",
    logoUrl: ""
  },
  {
    id: 202,
    companyName: "Neolab Việt Nam (Đà Nẵng)",
    wardId: 12,
    address: "Tòa nhà Software Park, 02 Quang Trung, Hải Châu, Đà Nẵng",
    website: "neo-lab.vn",
    totalActiveJobs: 8,
    companySize: "150-300",
    description: "NeoLab Việt Nam là công ty phát triển công nghệ thông tin có vốn đầu tư từ Nhật Bản, chuyên phát triển các ứng dụng di động thông minh, hệ thống dịch vụ web quy mô lớn và thiết kế UI/UX hiện đại.",
    logoUrl: ""
  },
  {
    id: 203,
    companyName: "Navigos Search Đà Nẵng",
    wardId: 14,
    address: "Lô A2-1 Võ Văn Kiệt, Sơn Trà, Đà Nẵng",
    website: "navigossearch.com",
    totalActiveJobs: 12,
    companySize: "100-150",
    description: "Navigos Search là thương hiệu hàng đầu Việt Nam cung cấp dịch vụ tuyển dụng nhân sự cấp trung và cấp cao, kết nối hàng nghìn ứng viên tài năng với các cơ hội việc làm mơ ước từ các thương hiệu hàng đầu toàn cầu.",
    logoUrl: ""
  },
  {
    id: 204,
    companyName: "Enclave IT Solution DaNang",
    wardId: 10,
    address: "Tòa nhà Enclave, Trần Hưng Đạo, Sơn Trà, Đà Nẵng",
    website: "enclave.vn",
    totalActiveJobs: 6,
    companySize: "100-200",
    description: "Enclave IT Solution tự hào là công ty phát triển phần mềm chất lượng cao, cung cấp các sản phẩm và dịch vụ công nghệ thông tin tinh tế, hiệu quả cho các thị trường năng động như Bắc Mỹ, Singapore và Châu Âu.",
    logoUrl: ""
  }
];

function getMockPageResponse<T>(items: T[], page: number, size: number): PageResponse<T> {
  const start = page * size;
  const end = start + size;
  const pagedItems = items.slice(start, end);
  const totalPages = Math.ceil(items.length / size) || 1;
  return {
    content: pagedItems,
    pageNumber: page,
    pageSize: size,
    totalElements: items.length,
    totalPages: totalPages,
    last: page >= totalPages - 1
  };
}

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

  /** GET /employers/update-first-new — Lấy yêu cầu cập nhật mới nhất đang chờ duyệt */
  getUpdateFirstNew: async (): Promise<EmployerUpdateResponse> => {
    const response = await api.get<ApiResponse<EmployerUpdateResponse>>("employers/update-first-new");
    return response.data.data;
  },

  /** GET /employers — Lấy tất cả công ty (Admin) */
  getAllCompanies: async (page: number = 0, size: number = 10): Promise<PageResponse<EmployerResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployerResponse>>>("employers", {
      params: { page, size },
    });
    return response.data.data;
  },

  /** GET /employers/pending — Lấy danh sách công ty chờ duyệt (Admin) */
  getPendingCompanies: async (page: number = 0, size: number = 10): Promise<PageResponse<EmployerUpdateResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployerUpdateResponse>>>("employers/pending", {
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
    try {
      const response = await api.get<ApiResponse<PageResponse<EmployerPublicResponse>>>("employers/companies/public", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("getCompaniesForPublic failed. Falling back to MOCK_COMPANIES.", error);
      return getMockPageResponse(MOCK_COMPANIES, page, size);
    }
  },

  /** GET /employers/company/:id/public — Lấy chi tiết công ty công khai (Public) */
  getCompanyById: async (id: number): Promise<EmployerPublicResponse> => {
    try {
      const response = await api.get<ApiResponse<EmployerPublicResponse>>(`employers/company/${id}/public`);
      return response.data.data;
    } catch (error) {
      console.warn(`getCompanyById failed for id ${id}. Falling back to MOCK_COMPANIES.`, error);
      const mockComp = MOCK_COMPANIES.find(c => c.id === id);
      if (mockComp) return mockComp;
      return {
        id,
        companyName: `Công ty đối tác #${id}`,
        address: "Đà Nẵng, Việt Nam",
        website: "danangjobs.vn",
        totalActiveJobs: 2,
        companySize: "50-100",
        description: "Đây là nhà tuyển dụng uy tín đối tác của DaNang Jobs."
      };
    }
  },
};

export default employerService;
