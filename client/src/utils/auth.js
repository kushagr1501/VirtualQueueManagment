export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

export const getBusinessId = () => {
    return localStorage.getItem("businessId");
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("businessId");
    localStorage.removeItem("lastPlaceId");

    // The storage event will automatically notify other tabs
    window.location.replace(`${window.location.origin}/`);
};
