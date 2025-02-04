import React from "react";
import AuthForm from "../components/AuthForm";

const Login = () => {
  const handleLogin = async (credentials) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      // Handle successful login (e.g., save token, redirect to dashboard)
      console.log("Login successful:", data);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <AuthForm type="login" onSubmit={handleLogin} />
    </div>
  );
};

export default Login;
