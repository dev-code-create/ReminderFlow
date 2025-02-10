import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    console.log("Logging in with:", email, password);
    try {
      const response = await apiClient.post("/users/signin", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error("Login error details:", error.response?.data); // Debug
      throw error.response?.data?.message || "Login failed";
    }
  };

  const register = async (formData) => {
    try {
      const response = await apiClient.post("/users/register", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);

      return response.data;
    } catch (error) {
      console.error("Registration error details:", error.response?.data);
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiClient
        .get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setUser(response.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
