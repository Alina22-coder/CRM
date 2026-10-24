import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

const refreshTokens = () => {
    if (!refreshPromise) {
        const refreshToken = localStorage.getItem("refreshToken");

        refreshPromise = axios
            .post(
                `${import.meta.env.VITE_API_URL}/auth/refresh`,
                { refreshToken },
                { headers: { Authorization: `Bearer ${refreshToken}` } },
            )
            .then(({ data }) => {
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
                return data;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const url = error.config?.url ?? "";
        if (
            error.response?.status === 401 &&
            !error.config?._retry &&
            !url.includes("/auth/login") &&
            !url.includes("/auth/refresh")
        ) {
            error.config._retry = true;
            try {
                const data = await refreshTokens();

                error.config.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(error.config);
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/auth/login";
            }
        }

        return Promise.reject(error);
    },
);

export default api;
