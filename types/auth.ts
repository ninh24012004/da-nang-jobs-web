export type LoginRequest = {
    email: string;
    password: string;
};

export type UserRole = "ADMIN" | "CANDIDATE" | "EMPLOYER";

export type AuthUser = {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    roleName: UserRole;
};

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    user: AuthUser;
};

