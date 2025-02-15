import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token and get user data
          const response = await apiClient.get("/users/me");
          setUser(response.data);
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/users/signin", {
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
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

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
