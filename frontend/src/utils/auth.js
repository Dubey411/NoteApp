import jwtDecode from "jwt-decode";

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // seconds
    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return false;
    }
    return true;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return false;
  }
};
