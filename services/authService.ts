import api from "./api";
import { UserRole, LoginRequest, LoginResponse } from "@/types/auth";
import { ApiResponse } from "@/types/apiResponse";

// Map role → endpoint đăng nhập
const loginEndpoints: Record<UserRole, string> = {
  CANDIDATE: "/auth/candidate/login",
  EMPLOYER:  "/auth/employer/login",
  ADMIN:     "/auth/candidate/login",
};

/** POST /auth/:role/login */
export async function loginApi(data: LoginRequest, role: UserRole): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<ApiResponse<LoginResponse>>(loginEndpoints[role], data);
  return response.data;
}

/** POST /auth/forgot-password */
export async function forgotPasswordApi(email: string): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/forgot-password", { email });
  return response.data;
}

/** POST /auth/forgot-password/resend-code */
export async function resendPasswordResetCodeApi(email: string): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/forgot-password/resend-code", { email });
  return response.data;
}

/** POST /auth/forgot-password/verify-code */
export async function verifyPasswordResetCodeApi(email: string, code: string): Promise<ApiResponse<string>> {
  const response = await api.post<ApiResponse<string>>("/auth/forgot-password/verify-code", { email, code });
  return response.data;
}

/** POST /auth/change-password */
export async function changePasswordApi(resetToken: string, password: string): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/change-password", { resetToken, password });
  return response.data;
}

/** POST /auth/candidate/register */
export async function candidateRegisterApi(
  email: string,
  password: string,
  fullName: string
): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/candidate/register", { email, password, fullName });
  return response.data;
}

/** POST /auth/employer/register */
export async function employerRegisterApi(
  email: string,
  password: string,
  fullName: string,
  companyName: string
): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/employer/register", {
    email,
    password,
    fullName,
    companyName,
  });
  return response.data;
}

/** POST /auth/verify-code */
export async function verifyCodeApi(email: string, code: string): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/verify-code", { email, code });
  return response.data;
}

/** POST /auth/resend-code */
export async function resendCodeApi(email: string): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/resend-code", { email });
  return response.data;
}

/** POST /auth/logout */
export async function logoutApi(refreshToken: string): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/auth/logout", { refreshToken });
  return response.data;
}

/** POST /auth/google */
export async function googleLoginApi(token: string, role?: UserRole): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<ApiResponse<LoginResponse>>("/auth/google", { token, role });
  return response.data;
}
