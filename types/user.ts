export type UserResponse = {
    id: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    roleName?: string;
    status: UserStatus;
}

export type UserUpdateData = {
    fullName: string;
    avatarUrl?: string;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";