import Cookies from "js-cookie";

export const setAuthData = (token, user) => {
  console.log("Setting auth data:", { token, user });
  
  // Store in localStorage
  localStorage.setItem("authToken", token);
  localStorage.setItem("userData", JSON.stringify(user));
  
  // Store in cookies for axios client (same keys as expected by existing code)
  Cookies.set("uat", token, { expires: 1 }); // 1 day
  Cookies.set("ue", user.email, { expires: 1 });
  Cookies.set("account", JSON.stringify(user), { expires: 1 });
  
  console.log("Auth data stored successfully");
  console.log("localStorage authToken:", localStorage.getItem("authToken"));
  console.log("Cookies uat:", Cookies.get("uat"));
};

export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  
  // Clear cookies
  Cookies.remove("uat");
  Cookies.remove("ue");
  Cookies.remove("account");
  localStorage.clear();
};

export const getAuthToken = () => {
  return localStorage.getItem("authToken") || Cookies.get("uat");
};

export const getAuthUser = () => {
  try {
    const userData = localStorage.getItem("userData") || Cookies.get("account");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const isAdmin = () => {
  const user = getAuthUser();
  return user?.isAdmin === true;
};

export const logout = () => {
  clearAuthData();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};