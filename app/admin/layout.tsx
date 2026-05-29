"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/admin/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
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

            setAuthorized(true);
        } catch (error) {
            console.error("Error parsing user data in admin layout:", error);
            router.push("/candidate/login");
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="p-6 flex items-center justify-center h-screen bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-2 text-gray-500 font-medium text-xs">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-[#006B7A] border-gray-200" />
                    <span>Đang kiểm tra quyền truy cập hệ thống...</span>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}

