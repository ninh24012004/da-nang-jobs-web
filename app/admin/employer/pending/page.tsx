"use client";

import AdminEmployerTable from "@/components/admin/employer/AdminEmployerTable";

export default function AdminEmployerPendingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Duyệt hồ sơ doanh nghiệp</h1>
        <p className="text-gray-500 mt-2 text-xs font-medium">
          Duyệt hoặc từ chối các yêu cầu cập nhật thông tin pháp lý doanh nghiệp, kiểm tra đối chiếu giấy phép ĐKKD (PDF) và mã số thuế.
        </p>
      </div>

      <AdminEmployerTable mode="PENDING" />
    </div>
  );
}
