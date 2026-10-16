import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api/v1",
  // Render's free API can take about a minute to wake after inactivity.
  timeout: 70000,
});

axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("restock-token");
  if (token && !["/auth/login", "/auth/register"].includes(config.url)) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
axiosClient.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith("/auth/")) {
    sessionStorage.removeItem("restock-token");
    window.dispatchEvent(new Event("restock-session-expired"));
  }
  return Promise.reject(error);
});

export default axiosClient;
