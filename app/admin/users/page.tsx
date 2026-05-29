"use client";

import AdminUserTable from "@/components/admin/user/AdminUserTable";

export default function AdminUsersPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
                <p className="text-gray-600 mt-2">Quản lý, tìm kiếm và thay đổi trạng thái người dùng trong hệ thống</p>
            </div>

            <AdminUserTable />
        </div>
    );
}
