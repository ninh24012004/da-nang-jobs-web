// Enum loại thông báo — khớp với backend NotificationType
export type NotificationType =
  | "JOB_APPLICATION"
  | "APPLICATION_STATUS"
  | "JOB_APPROVAL"
  | "SYSTEM"
  | (string & {});

// Khớp với backend NotificationDto.NotificationResponse
export type NotificationResponse = {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO-8601 datetime string
};
