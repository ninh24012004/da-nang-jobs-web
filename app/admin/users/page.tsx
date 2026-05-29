"use client";

import AdminUserTable from "@/components/admin/user/AdminUserTable";

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Quản lý người dùng</h1>
                    <p className="text-gray-400 mt-1 text-xs font-medium">
                        Tìm kiếm, theo dõi và cập nhật trạng thái tài khoản ứng viên trên hệ thống.
                    </p>
                </div>
            </div>

            <AdminUserTable />
        </div>
    );
}
