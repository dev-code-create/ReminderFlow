import React from "react";
import AuthForm from "../components/AuthForm";

const Signup = () => {
  const handleSignup = async (credentials) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      const data = await response.json();
      // Handle successful signup (e.g., save token, redirect to dashboard)
      console.log("Signup successful:", data);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <AuthForm type="signup" onSubmit={handleSignup} />
    </div>
  );
};

export default Signup;
