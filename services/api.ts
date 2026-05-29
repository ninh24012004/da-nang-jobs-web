import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const storage =
        localStorage.getItem("accessToken")
            ? localStorage
            : sessionStorage;

    const accessToken =
        storage.getItem("accessToken");

    const tokenType =
        storage.getItem("tokenType") || "Bearer";

    if (accessToken) {
        config.headers.Authorization =
            `${tokenType} ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            // If request had no authorization, it is a guest request. Reject immediately.
            if (!originalRequest.headers.Authorization) {
                return Promise.reject(error);
            }

            try {
                const storage =
                    localStorage.getItem("refreshToken")
                        ? localStorage
                        : sessionStorage;

                const refreshToken =
                    storage.getItem("refreshToken");

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                    {
                        token: refreshToken,
                    }
                );

                const data = response.data.data;

                storage.setItem("accessToken", data.accessToken);
                storage.setItem("refreshToken", data.refreshToken);

                originalRequest.headers.Authorization =
                    `${data.tokenType} ${data.accessToken}`;
                
                return api(originalRequest);

            } catch (refreshError) {
                const userJson = localStorage.getItem("user") || sessionStorage.getItem("user");
                let redirectPath = "/candidate/login";

                if (userJson) {
                    try {
                        const user = JSON.parse(userJson);
                        if (user.roleName === "ADMIN") redirectPath = "/admin/login";
                        else if (user.roleName === "EMPLOYER") redirectPath = "/employer/login";
                    } catch (e) {}
                }

                localStorage.clear();
                sessionStorage.clear();
                // Clear cookies too if any
                document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                window.location.href = redirectPath;

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;