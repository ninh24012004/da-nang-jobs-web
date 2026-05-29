// Trạng thái user tài khoản
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type UserResponse = {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roleName?: string;
  status: UserStatus;
};

export type UserUpdateData = {
  fullName: string;
  avatarUrl?: string;
};