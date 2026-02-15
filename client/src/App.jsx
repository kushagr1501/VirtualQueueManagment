import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback } from "react";
import axios from "axios";
import Landing from "./components/Landing";
import Home from "./components/Home";
import QueuePage from "./components/QueuePage";
import AdminAddPlace from "./components/AdminAddPlace";
import AdminPanel from "./components/AdminPanel";
import BusinessLogin from "./components/BusinessLogin";
import BusinessSignup from "./components/BusinessSignup";
import VerifyUser from "./components/VerifyUser";
import MyQueues from "./components/MyQueues";
import Analytics from "./components/Analytics";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Configure axios defaults
axios.defaults.baseURL = API;

// Add request interceptor to attach JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401/403
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints themselves
    if (originalRequest.url?.includes("/api/auth/")) {
      return Promise.reject(error);
    }

    // If 401/403 and we haven't already retried this request
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("/api/auth/refresh", { refreshToken });
        const { token, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear auth and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("businessId");
        localStorage.removeItem("lastPlaceId");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        if (!e.newValue) {
          window.location.href = "/";
        } else if (e.oldValue !== e.newValue) {
          window.location.reload();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Redirect authenticated users away from public pages
  const redirectIfAuthenticated = useCallback(async () => {
    const token = localStorage.getItem("token");
    const businessId = localStorage.getItem("businessId");
    const publicPaths = ["/", "/business/login", "/business/signup"];

    if (!token || !businessId || !publicPaths.includes(location.pathname)) {
      return;
    }

    const lastPlace = localStorage.getItem("lastPlaceId");
    if (lastPlace) {
      navigate(`/admin/place/${lastPlace}`);
      return;
    }

    try {
      const res = await axios.get("/api/places", { params: { businessId } });
      if (res.data?.length > 0) {
        localStorage.setItem("lastPlaceId", res.data[0]._id);
        navigate(`/admin/place/${res.data[0]._id}`);
      } else {
        navigate("/admin/add-place");
      }
    } catch (e) {
      // Stay on current page if API fails
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    redirectIfAuthenticated();
  }, [redirectIfAuthenticated]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/place/:id" element={<QueuePage />} />
      <Route path="/admin/add-place" element={<AdminAddPlace />} />
      <Route path="/admin/place/:id" element={<AdminPanel />} />
      <Route path="/admin/place/:id/analytics" element={<Analytics />} />
      <Route path="/business/signup" element={<BusinessSignup />} />
      <Route path="/business/login" element={<BusinessLogin />} />
      <Route path="/admin/verify" element={<VerifyUser />} />
      <Route path="/my-queues" element={<MyQueues />} />
    </Routes>
  );
}

export default App;
