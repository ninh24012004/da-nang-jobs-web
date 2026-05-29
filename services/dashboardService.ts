import api from "./api";
import { DashboardSummaryResponse, DailyTrendResponse } from "@/types/dashboard";
import { ApiResponse } from "@/types/apiResponse";

export const dashboardService = {
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
};
