import api from "./api";
import { 
  DashboardSummaryResponse, 
  DailyTrendResponse,
  EmployerDashboardSummaryResponse,
  EmployerDailyTrendResponse
} from "@/types/dashboard";
import { ApiResponse } from "@/types/apiResponse";

export const dashboardService = {
  // Admin dashboard endpoints
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await api.get<ApiResponse<DashboardSummaryResponse>>("admin/dashboard/summary");
    return response.data.data;
  },

  getTrends: async (days: number = 30): Promise<DailyTrendResponse[]> => {
    const response = await api.get<ApiResponse<DailyTrendResponse[]>>("admin/dashboard/trends", {
      params: { days },
    });
    return response.data.data;
  },

  // Employer dashboard endpoints
  getEmployerSummary: async (): Promise<EmployerDashboardSummaryResponse> => {
    const response = await api.get<ApiResponse<EmployerDashboardSummaryResponse>>("employer/dashboard/summary");
    return response.data.data;
  },

  getEmployerTrends: async (days: number = 30): Promise<EmployerDailyTrendResponse[]> => {
    const response = await api.get<ApiResponse<EmployerDailyTrendResponse[]>>("employer/dashboard/trends", {
      params: { days },
    });
    return response.data.data;
  }
};

export default dashboardService;
