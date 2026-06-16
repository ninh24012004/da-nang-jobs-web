"use client";

import React, { useEffect, useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserResponse, UserStatus } from "@/types/user";
import { 
  Search, 
  Users, 
  Filter, 
  Loader2, 
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";

type AdminUser = UserResponse;

export default function AdminUserTable() {
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [query, setQuery] = useState("");
    const [role, setRole] = useState("");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");

    const {
        users,
        totalPages,
        totalElements,
        isLoading: loading,
        error,
        loadingStatusId,
        fetchUsers,
        changeUserStatus,
    } = useUsers();

    useEffect(() => {
        fetchUsers({ query, role, statusFilter, page, size });
    }, [page, role, statusFilter, fetchUsers]);

    async function handleStatusChange(userId: number, newStatus: UserStatus) {
        await changeUserStatus(userId, newStatus, () => {
            fetchUsers({ query, role, statusFilter, page, size });
        });
    }

    function handleSearch() {
        setPage(0);
        setRole("");
        setStatusFilter("");
        fetchUsers({ query, role: "", statusFilter: "", page: 0, size });
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

    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-100">
                        Hoạt động
                    </span>
                );
            case "BLOCKED":
                return (
                    <span className="inline-flex items-center bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-semibold border border-red-100">
                        Đã khóa
                    </span>
                );
            case "INACTIVE":
                return (
                    <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
                        Chưa kích hoạt
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters controls */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input Group */}
                <div className="relative w-full md:w-96 flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo email, họ tên..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-md pl-10 pr-24 py-2 text-xs text-slate-700 outline-none transition-colors"
                    />
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                        onClick={handleSearch}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Tìm kiếm
                    </button>
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
                    {/* Role Filter */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-md border border-slate-200/80">
                        <Filter size={12} className="text-slate-400 ml-1" />
                        <select
                            value={role}
                            onChange={(e) => handleRoleFilter(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-slate-600 outline-none pr-3 cursor-pointer"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="ADMIN">Quản trị viên (Admin)</option>
                            <option value="CANDIDATE">Ứng viên (Candidate)</option>
                            <option value="EMPLOYER">Nhà tuyển dụng (Employer)</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-md border border-slate-200/80">
                        <Filter size={12} className="text-slate-400 ml-1" />
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                handleStatusFilter(e.target.value as UserStatus | "")
                            }
                            className="bg-transparent text-xs font-semibold text-slate-600 outline-none pr-3 cursor-pointer"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                            <option value="INACTIVE">Chưa kích hoạt (INACTIVE)</option>
                            <option value="BLOCKED">Đã khóa (BLOCKED)</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>{error}</span>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-3 w-16 text-center">Avatar</th>
                                <th className="p-3">Họ tên</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Vai trò</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3 text-right">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
                                            <span className="text-[11px] font-semibold text-slate-400">Đang tải danh sách người dùng...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                                        Không tìm thấy người dùng nào phù hợp!
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const nextStatus: UserStatus =
                                        u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors duration-150 border-b border-slate-100">
                                            <td className="p-3 text-center">
                                                <div className="h-9 w-9 mx-auto rounded-full border border-slate-200 overflow-hidden flex items-center justify-center relative">
                                                    {u.avatarUrl && u.avatarUrl.trim() !== "" ? (
                                                        <img
                                                            src={u.avatarUrl}
                                                            alt="avatar"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-slate-900 text-white flex items-center justify-center font-semibold uppercase font-mono text-xs">
                                                            {u.fullName ? u.fullName.slice(0, 2).toUpperCase() : "US"}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3 font-semibold text-slate-900 text-xs">
                                                {u.fullName}
                                            </td>

                                            <td className="p-3 text-slate-550 font-mono text-xs">
                                                {u.email}
                                            </td>

                                            <td className="p-3">
                                                <span className="bg-slate-100 text-slate-750 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                                                    {u.roleName}
                                                </span>
                                            </td>

                                            <td className="p-3">
                                                {getStatusBadge(u.status)}
                                            </td>

                                            <td className="p-3 text-right">
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
                                                    className={`px-2.5 py-1 rounded-md transition-colors font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[11px] ${
                                                        nextStatus === "BLOCKED"
                                                            ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    }`}
                                                >
                                                    {loadingStatusId === u.id ? (
                                                        <>
                                                            <Loader2 size={11} className="animate-spin" />
                                                            <span>Đang xử lý...</span>
                                                        </>
                                                    ) : nextStatus === "BLOCKED" ? (
                                                        <>
                                                            <Lock size={11} />
                                                            <span>Khóa tài khoản</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Unlock size={11} />
                                                            <span>Mở khóa</span>
                                                        </>
                                                    )}
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

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-1 text-xs">
                <div className="text-slate-500">
                    Trang {page + 1} / {totalPages} (Tổng cộng: {totalElements} người dùng)
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                    >
                        Trang trước
                    </button>

                    <button
                        onClick={() =>
                            setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={page >= totalPages - 1 || loading}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                    >
                        Trang sau
                    </button>
                </div>
            </div>
        </div>
    );
}