import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";
import { NotificationResponse } from "@/types/notification";

const notificationService = {
  /**
   * Lấy danh sách thông báo của user đang đăng nhập (phân trang)
   * GET /api/notifications?page=0&size=20
   */
  getNotifications: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<NotificationResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<NotificationResponse>>>(
      "notifications",
      { params: { page, size } }
    );
    return response.data.data;
  },

  /**
   * Đánh dấu đã đọc theo danh sách id
   * POST /api/notifications/read
   * Backend nhận List<Long> notificationIds qua @RequestBody
   */
  markAsRead: async (notificationIds: number[]): Promise<void> => {
    if (notificationIds.length === 0) return;
    await api.post<ApiResponse<void>>("notifications/read", notificationIds);
  },
};

export default notificationService;
