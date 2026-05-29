import api from "./api";
import { UserResponse, UserStatus } from "@/types/user";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";


export const userService = {
  getAllUsers: async (page: number = 0, size: number = 10): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<UserResponse>>>("users", {
      params: { page, size },
    });
    return response.data.data;
  },

  searchUsers: async (keyword: string, page: number = 0, size: number = 10): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<UserResponse>>>("users/search", {
      params: { keyword, page, size },
    });
    return response.data.data;
  },

  getUsersByRole: async (role: string, page: number = 0, size: number = 10): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<UserResponse>>>("users/by-role", {
      params: { role, page, size },
    });
    return response.data.data;
  },

  getUserByStatus: async (status: UserStatus, page: number = 0, size: number = 10): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<UserResponse>>>("users/by-status", {
      params: { status, page, size },
    });
    return response.data.data;
  },

  changeUserStatus: async (userIds: number[], status: UserStatus): Promise<void> => {
    await api.post("users/change-status", {
      userIds,
      status,
    });
  },
};