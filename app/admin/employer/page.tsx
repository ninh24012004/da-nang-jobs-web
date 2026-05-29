"use client";

import AdminEmployerTable from "@/components/admin/employer/AdminEmployerTable";

export default function AdminEmployerPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Danh sách nhà tuyển dụng</h1>
        <p className="text-gray-500 mt-2 text-xs font-medium">
          Xem danh sách tất cả các doanh nghiệp đã đăng ký trên hệ thống, quản lý thông tin hồ sơ và website.
        </p>
      </div>

      <AdminEmployerTable mode="ALL" />
    </div>
  );
}
