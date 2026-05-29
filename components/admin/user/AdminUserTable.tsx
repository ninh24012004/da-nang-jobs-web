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
  Unlock,
  UserCheck
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
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        Hoạt động
                    </span>
                );
            case "BLOCKED":
                return (
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-650 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100 shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-650 shadow-[0_0_6px_rgba(220,38,38,0.8)]" />
                        Đã Khóa
                    </span>
                );
            case "INACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-150 shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Chưa Kích Hoạt
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-150 shadow-xs">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters controls */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input Group */}
                <div className="relative w-full md:w-96 shadow-inner flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo email, họ tên..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full bg-gray-50/50 border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl pl-10 pr-24 py-2.5 text-xs text-gray-700 outline-none transition-all font-medium"
                    />
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button
                        onClick={handleSearch}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#006B7A] hover:bg-[#005a66] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Tìm kiếm
                    </button>
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
                    {/* Role Filter */}
                    <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200/50">
                        <Filter size={12} className="text-gray-400 ml-1.5" />
                        <select
                            value={role}
                            onChange={(e) => handleRoleFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold text-gray-600 outline-none pr-3 cursor-pointer"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="ADMIN">Quản trị viên (Admin)</option>
                            <option value="CANDIDATE">Ứng viên (Candidate)</option>
                            <option value="EMPLOYER">Nhà tuyển dụng (Employer)</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200/50">
                        <Filter size={12} className="text-gray-400 ml-1.5" />
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                handleStatusFilter(e.target.value as UserStatus | "")
                            }
                            className="bg-transparent text-xs font-bold text-gray-600 outline-none pr-3 cursor-pointer"
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
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-semibold text-gray-700">
                        <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4 w-16 text-center">Avatar</th>
                                <th className="p-4">Họ tên</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Vai trò</th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4 text-right">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-[#006B7A]" />
                                            <span className="text-[11px] font-bold text-gray-400">Đang tải danh sách người dùng...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-gray-400 font-medium">
                                        Không tìm thấy người dùng nào phù hợp!
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const nextStatus: UserStatus =
                                        u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";

                                    return (
                                        <tr key={u.id} className="hover:bg-[#F8FAFC]/80 transition-all duration-200 group border-b border-gray-100">
                                            <td className="p-4 text-center">
                                                <div className="h-10 w-10 mx-auto rounded-full border border-gray-100 overflow-hidden flex items-center justify-center shadow-inner relative transition-transform group-hover:scale-105">
                                                    {u.avatarUrl && u.avatarUrl.trim() !== "" ? (
                                                        <img
                                                            src={u.avatarUrl}
                                                            alt="avatar"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-[#006B7A] to-[#009fb2] text-white flex items-center justify-center font-bold tracking-wider uppercase font-mono text-xs shadow-inner">
                                                            {u.fullName ? u.fullName.slice(0, 2).toUpperCase() : "US"}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4 font-extrabold text-gray-800 text-sm leading-snug group-hover:text-[#006B7A] transition-colors">
                                                {u.fullName}
                                            </td>

                                            <td className="p-4 text-gray-600 font-mono">
                                                {u.email}
                                            </td>

                                            <td className="p-4">
                                                <span className="bg-teal-50 text-[#006B7A] px-2.5 py-1 rounded-lg text-[10px] font-extrabold border border-teal-100">
                                                    {u.roleName}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                {getStatusBadge(u.status)}
                                            </td>

                                            <td className="p-4 text-right">
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
                                                    className={`px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                                                        nextStatus === "BLOCKED"
                                                            ? "bg-red-50 hover:bg-red-100 text-red-650 border border-red-200"
                                                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    }`}
                                                >
                                                    {loadingStatusId === u.id ? (
                                                        <>
                                                            <Loader2 size={12} className="animate-spin" />
                                                            <span>Đang xử lý...</span>
                                                        </>
                                                    ) : nextStatus === "BLOCKED" ? (
                                                        <>
                                                            <Lock size={12} />
                                                            <span>Khóa tài khoản</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Unlock size={12} />
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
            <div className="flex items-center justify-between px-2 text-xs font-semibold">
                <div className="text-gray-500">
                    Trang {page + 1} / {totalPages} (Tổng cộng: {totalElements} người dùng)
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        Trang trước
                    </button>

                    <button
                        onClick={() =>
                            setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={page >= totalPages - 1 || loading}
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        Trang sau
                    </button>
                </div>
            </div>
        </div>
    );
}