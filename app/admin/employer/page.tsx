"use client";

import AdminEmployerTable from "@/components/admin/employer/AdminEmployerTable";

export default function AdminEmployerPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Quản lý nhà tuyển dụng</h1>
          <p className="text-gray-400 mt-1 text-xs font-medium">
            Xem, duyệt, từ chối và quản lý tài khoản doanh nghiệp trên hệ thống.
          </p>
        </div>
      </div>

      <AdminEmployerTable mode="ALL" />
    </div>
  );
}
