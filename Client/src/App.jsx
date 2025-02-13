import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./components/DashBoard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import TaskForm from "./components/tasks/TaskForm";
import Navbar from "./components/common/Navbar";
import TeamManagement from "./components/TeamManagement";
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/signup"];
  const showNavbar = !authRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/create-task" element={<TaskForm />} />
        <Route path="/edit-task/:taskId" element={<TaskForm isEdit={true} />} />
        <Route path="/create-team" element={<TeamManagement />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
