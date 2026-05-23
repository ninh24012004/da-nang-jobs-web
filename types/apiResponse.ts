export type ApiResponse<T> = {
    data: T;
    message: string;
    status: number;
    success: boolean;
    timestamp: string;
};

export type ApiErrorResponse = {
    errors?: string[];
    message: string;
    status: number;
    success: boolean;
    timestamp: string;
};