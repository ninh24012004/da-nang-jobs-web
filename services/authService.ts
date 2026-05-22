import api from "./api";
import { ApiResponse, UserRole, LoginRequest, LoginResponse } from "@/types/auth";

const authApi: Record<UserRole, string> = {
    CANDIDATE: "/auth/candidate/login",
    EMPLOYER: "/auth/employer/login",
    ADMIN: "/auth/candidate/login"
};

export async function loginApi(
    data: LoginRequest,
    role: UserRole
) {
    const response = await api.post<ApiResponse<LoginResponse>>(
        authApi[role],
        data
    );

    return response.data;
}

export async function forgotPasswordApi(email: string) {
    const response = await api.post<ApiResponse<void>>(
        "/auth/forgot-password",
        { email }
    );

    return response.data;
}

export async function resendPasswordResetCodeApi(email: string) {
    const response = await api.post<ApiResponse<void>>(
        "/auth/forgot-password/resend-code",
        { email }
    );

    return response.data;
}

export async function verifyPasswordResetCodeApi(email: string, code: string) {
    const response = await api.post<ApiResponse<string>>(
        "/auth/forgot-password/verify-code",
        { email, code }
    );

    return response.data;
}

export async function changePasswordApi(resetToken: string, password: string) {
    const response = await api.post<ApiResponse<void>>(
        "/auth/change-password",
        { resetToken, password }
    );

    return response.data;
}

export async function candidateRegisterApi(email: string, password: string, fullName: string) {
    const response = await api.post<ApiResponse<any>>(
        "/auth/candidate/register",
        { email, password, fullName }
    );

    return response.data;
}

export async function employerRegisterApi(email: string, password: string, fullName: string, companyName: string) {
    const response = await api.post<ApiResponse<any>>(
        "/auth/employer/register",
        { email, password, fullName, companyName }
    );

    return response.data;
}

export async function verifyCodeApi(email: string, code: string) {
    const response = await api.post<ApiResponse<void>>(
        "/auth/verify-code",
        { email, code }
    );

    return response.data;
}

export async function resendCodeApi(email: string) {
    const response = await api.post<ApiResponse<void>>(
        "/auth/resend-code",
        { email }
    );

    return response.data;
}

export async function logoutApi(refreshToken: string) {
    const response = await api.post<ApiResponse<void>>(
        "/auth/logout",
        { refreshToken }
    );

    return response.data;
}

