"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginApi, logoutApi, googleLoginApi } from "@/services/authService";
import { LoginRequest, UserRole } from "@/types/auth";

export default function useAuth() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const redirectByRole = (roleName: string) => {
        if (roleName === "ADMIN") {
            router.push("/admin/dashboard");
            return;
        }

        if (roleName === "EMPLOYER") {
            router.push("/employer/dashboard");
            return;
        }

        const redirectUrl = searchParams?.get("redirect");
        if (redirectUrl) {
            router.push(redirectUrl);
            return;
        }

        router.push("/candidate");
    };

    const login = async (data: LoginRequest, remember: boolean, role: UserRole) => {
        try {
            setLoading(true);
            setError("");

            const response = await loginApi(data, role);

            const storage = remember ? localStorage : sessionStorage;

            localStorage.setItem("remember", remember ? "true" : "false");

            storage.setItem("accessToken", response.data.accessToken);
            storage.setItem("refreshToken", response.data.refreshToken);
            storage.setItem("tokenType", response.data.tokenType);
            storage.setItem("user", JSON.stringify(response.data.user));

            // Set cookie for middleware
            const cookieValue = encodeURIComponent(JSON.stringify(response.data.user));
            const maxAge = remember ? 30 * 24 * 60 * 60 : ""; // 30 days or session
            document.cookie = `user=${cookieValue}; path=/; ${maxAge ? `max-age=${maxAge};` : ""}`;
            document.cookie = `accessToken=${response.data.accessToken}; path=/; ${maxAge ? `max-age=${maxAge};` : ""}`;

            redirectByRole(response.data.user.roleName);

            return {
                success: response.success,
                message: response.message,
            };
        } catch (err: any) {
            const message =
                err.response?.data?.message || "Đăng nhập thất bại";

            setError(message);

            return {
                success: false,
                message,
            };
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = async (token: string, remember: boolean, role?: UserRole) => {
        try {
            setLoading(true);
            setError("");

            const response = await googleLoginApi(token, role);

            const storage = remember ? localStorage : sessionStorage;

            localStorage.setItem("remember", remember ? "true" : "false");

            storage.setItem("accessToken", response.data.accessToken);
            storage.setItem("refreshToken", response.data.refreshToken);
            storage.setItem("tokenType", response.data.tokenType);
            storage.setItem("user", JSON.stringify(response.data.user));

            // Set cookie for middleware
            const cookieValue = encodeURIComponent(JSON.stringify(response.data.user));
            const maxAge = remember ? 30 * 24 * 60 * 60 : ""; // 30 days or session
            document.cookie = `user=${cookieValue}; path=/; ${maxAge ? `max-age=${maxAge};` : ""}`;
            document.cookie = `accessToken=${response.data.accessToken}; path=/; ${maxAge ? `max-age=${maxAge};` : ""}`;

            redirectByRole(response.data.user.roleName);

            return {
                success: response.success,
                message: response.message,
            };
        } catch (err: any) {
            const message =
                err.response?.data?.message || "Đăng nhập bằng Google thất bại";

            setError(message);

            return {
                success: false,
                message,
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async (redirectTo: string = "/candidate/login") => {
        const refreshToken =
            localStorage.getItem("refreshToken") ||
            sessionStorage.getItem("refreshToken");

        try {
            if (refreshToken) {
                await logoutApi(refreshToken);
            }
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("tokenType");
            localStorage.removeItem("user");
            localStorage.removeItem("remember");

            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("tokenType");
            sessionStorage.removeItem("user");

            document.cookie =
                "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            document.cookie =
                "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

            router.push(redirectTo);
        }
    };

    return {
        login,
        googleLogin,
        logout,
        loading,
        error,
    };
}