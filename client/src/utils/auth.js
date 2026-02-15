import axios from "axios";

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

export const getBusinessId = () => {
    return localStorage.getItem("businessId");
};

export const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    // Revoke refresh token on server
    try {
        if (refreshToken) {
            await axios.post("/api/auth/logout", { refreshToken });
        }
    } catch (e) {
        // Proceed with local logout even if server call fails
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("businessId");
    localStorage.removeItem("lastPlaceId");

    window.location.replace(`${window.location.origin}/`);
};

// Save auth tokens after login/signup
export const saveAuthTokens = ({ token, refreshToken, businessId }) => {
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (businessId) localStorage.setItem("businessId", businessId);
};
