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

