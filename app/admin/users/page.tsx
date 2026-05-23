"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserTable from "@/components/admin/user/AdminUserTable";

export default function AdminUsersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra quyền admin
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!userStr) {
            router.push("/candidate/login");
            return;
        }

        try {
            const user = JSON.parse(userStr);

            if (user.roleName !== "ADMIN") {
                router.push("/candidate/login");
                return;
            }

            setLoading(false);
        } catch (error) {
            console.error("Error parsing user data:", error);
            router.push("/candidate/login");
        }
    }, [router]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-screen">
                <div className="text-gray-600">Đang kiểm tra quyền truy cập...</div>
            </div>
        );
    }

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
