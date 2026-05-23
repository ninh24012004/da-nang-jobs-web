"use client";

import React, { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { UserResponse, UserStatus } from "@/types/user";

type AdminUser = UserResponse;

export default function AdminUserTable() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [role, setRole] = useState("");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
    const [error, setError] = useState("");
    const [loadingStatusId, setLoadingStatusId] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [page, role, statusFilter]);

    async function fetchUsers() {
        setLoading(true);
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
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Lỗi khi tải danh sách người dùng"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(userId: number, newStatus: UserStatus) {
        setLoadingStatusId(userId);

        try {
            await userService.changeUserStatus([userId], newStatus);
            await fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Lỗi khi thay đổi trạng thái");
        } finally {
            setLoadingStatusId(null);
        }
    }

    function handleSearch() {
        setPage(0);
        setRole("");
        setStatusFilter("");
        fetchUsers();
    }

    function handleRoleFilter(newRole: string) {
        setPage(0);
        setQuery("");
        setStatusFilter("");
        setRole(newRole);
    }

    function handleStatusFilter(newStatus: UserStatus | "") {
        setPage(0);
        setQuery("");
        setRole("");
        setStatusFilter(newStatus);
    }

    return (
        <div>
            <div className="bg-white p-4 rounded shadow mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <input
                        placeholder="Tìm kiếm theo email, tên..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="border border-gray-300 px-3 py-2 rounded flex-1 min-w-64"
                    />

                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Tìm kiếm
                    </button>

                    <select
                        value={role}
                        onChange={(e) => handleRoleFilter(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CANDIDATE">Candidate</option>
                        <option value="EMPLOYER">Employer</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            handleStatusFilter(e.target.value as UserStatus | "")
                        }
                        className="border border-gray-300 px-3 py-2 rounded"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="BLOCKED">BLOCKED</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-semibold">Lỗi: {error}</p>
                </div>
            )}

            <div className="bg-white rounded shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-3 w-12">Avatar</th>
                                <th className="p-3">Họ tên</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Vai trò</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-4 text-center text-gray-500"
                                    >
                                        Không có người dùng
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const nextStatus: UserStatus =
                                        u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";

                                    return (
                                        <tr
                                            key={u.id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="p-3">
                                                <img
                                                    src={
                                                        u.avatarUrl && u.avatarUrl.trim() !== ""
                                                            ? u.avatarUrl
                                                            : "/images/avatar-default.png"
                                                    }
                                                    alt="avatar"
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            </td>

                                            <td className="p-3 font-medium">
                                                {u.fullName}
                                            </td>

                                            <td className="p-3 text-gray-600">
                                                {u.email}
                                            </td>

                                            <td className="p-3">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {u.roleName}
                                                </span>
                                            </td>

                                            <td className="p-3">
                                                <span
                                                    className={
                                                        u.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                                                            : u.status === "BLOCKED"
                                                                ? "bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                                                                : "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                                    }
                                                >
                                                    {u.status}
                                                </span>
                                            </td>

                                            <td className="p-3">
                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            u.id,
                                                            nextStatus
                                                        )
                                                    }
                                                    disabled={
                                                        loadingStatusId === u.id
                                                    }
                                                    className={
                                                        nextStatus === "BLOCKED"
                                                            ? "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                                                            : "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                                    }
                                                >
                                                    {loadingStatusId === u.id
                                                        ? "Đang xử lý..."
                                                        : nextStatus === "BLOCKED"
                                                            ? "BLOCKED"
                                                            : "ACTIVE"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-4">
                <div className="text-sm text-gray-600">
                    Trang {page + 1} / {totalPages} (Tổng: {totalElements} người dùng)
                </div>

                <div className="space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trang trước
                    </button>

                    <button
                        onClick={() =>
                            setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={page >= totalPages - 1}
                        className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trang sau
                    </button>
                </div>
            </div>
        </div>
    );
}