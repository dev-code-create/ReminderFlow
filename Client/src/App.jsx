import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./components/DashBoard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import TaskForm from "./components/tasks/TaskForm";
import Navbar from "./components/common/Navbar";
import TeamManagement from "./components/team/TeamManagement";
import Settings from "./components/Settings";
import CalendarSync from "./components/calendar/CalenderSync";
import { Toaster } from "react-hot-toast";
import TeamDashboard from "./components/team/TeamDashboard";
import TeamDetails from "./components/team/TeamDetails";
import TeamTaskDashboard from "./components/team/TeamTaskDashboard";

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
    <>
      <Toaster position="top-right" />
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
          <Route
            path="/edit-task/:taskId"
            element={<TaskForm isEdit={true} />}
          />
          <Route path="/create-team" element={<TeamManagement />} />
          <Route path="/calendar-sync" element={<CalendarSync />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/teams" element={<TeamDashboard />} />
          <Route path="/team/:teamId" element={<TeamDetails />} />
          <Route path="/team/:teamId/tasks" element={<TeamTaskDashboard />} />
          <Route path="/manage-teams" element={<TeamManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </>
  );
};

export default App;
