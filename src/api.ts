import axios from "axios";

const BASE_URL = "https://shoppingwepapi-ercpgggcdxffbbat.polandcentral-01.azurewebsites.net/api";

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (!!localStorage.getItem('token') && error?.response.status === 401 && !original._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    queue.push((token) => {
                        original.headers.Authorization = `Bearer  ${token}`;
                        resolve(api(original));
                    });
                });
            }

            original._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${BASE_URL}/accounts/refresh`,
                    {},
                    { withCredentials: true }
                );

                localStorage.setItem("token", data.accessToken);
                api.defaults.headers.common.Authorization = `Bearer  ${data.accessToken}`;

                queue.forEach((cb) => cb(data.accessToken));
                queue = [];

                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch {
                localStorage.removeItem("token");
                window.location.href = "/auth/login";
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;