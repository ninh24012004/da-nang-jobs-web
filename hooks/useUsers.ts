"use client";

import { useState, useCallback } from "react";
import { userService } from "@/services/userService";
import { UserResponse, UserStatus } from "@/types/user";
import { toast } from "sonner";

export interface FetchUsersParams {
    query?: string;
    role?: string;
    statusFilter?: UserStatus | "";
    page: number;
    size: number;
}

export function useUsers() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [loadingStatusId, setLoadingStatusId] = useState<number | null>(null);

    const fetchUsers = useCallback(async (params: FetchUsersParams) => {
        const { query, role, statusFilter, page, size } = params;
        setIsLoading(true);
        setError("");

        try {
            let res;

            if (query) {
                res = await userService.searchUsers(query, page, size);
            } else if (role) {
                res = await userService.getUsersByRole(role, page, size);
            } else if (statusFilter) {
                res = await userService.getUserByStatus(statusFilter, page, size);
            } else {
                res = await userService.getAllUsers(page, size);
            }

            setUsers(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
            return res;
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Lỗi khi tải danh sách người dùng";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const changeUserStatus = useCallback(async (userId: number, newStatus: UserStatus, onRefresh: () => void) => {
        setLoadingStatusId(userId);

        try {
            await userService.changeUserStatus([userId], newStatus);
            toast.success(newStatus === "BLOCKED" ? "Đã khóa tài khoản thành công!" : "Đã mở khóa tài khoản thành công!");
            onRefresh();
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi thay đổi trạng thái";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoadingStatusId(null);
        }
    }, []);

    return {
        users,
        totalPages,
        totalElements,
        isLoading,
        error,
        loadingStatusId,
        fetchUsers,
        changeUserStatus,
    };
}
