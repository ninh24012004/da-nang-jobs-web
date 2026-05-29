import { useState, useCallback } from "react";
import notificationService from "@/services/notificationService";
import { NotificationResponse } from "@/types/notification";
import { toast } from "sonner";

/**
 * Hook quản lý thông báo.
 * - Fetch lazy: gọi fetchNotifications() khi cần (ví dụ khi mở dropdown)
 * - Optimistic update cho markAsRead và markAllAsRead
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  /** Tải danh sách thông báo từ server */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const pageData = await notificationService.getNotifications(0, 20);
      setNotifications(pageData.content);
      setFetched(true);
    } catch (err) {
      console.warn("Không thể tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Đánh dấu đã đọc một hoặc nhiều thông báo theo ids (optimistic) */
  const markAsRead = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
    );
    try {
      await notificationService.markAsRead(ids);
    } catch (err) {
      console.warn("Không thể đánh dấu đã đọc:", err);
    }
  }, []);

  /** Đánh dấu tất cả chưa đọc thành đã đọc (optimistic) */
  const markAllAsRead = useCallback(
    async (currentNotifications: NotificationResponse[]) => {
      const unreadIds = currentNotifications
        .filter((n) => !n.isRead)
        .map((n) => n.id);
      if (unreadIds.length === 0) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      try {
        await notificationService.markAsRead(unreadIds);
        toast.success("Đã đánh dấu đọc tất cả thông báo!");
      } catch (err) {
        console.warn("Không thể đánh dấu tất cả đã đọc:", err);
      }
    },
    []
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    loading,
    fetched,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
