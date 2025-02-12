import { useEffect, useState } from "react";
import apiClient from "../services/api";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await apiClient.get("/tasks");
      setTasks(response.data);
    };
    fetchTasks();
  }, []);

  return (
    <div className="container mx-auto p-4 flex items-center ">
      <h1 className="text-2xl font-bold ">Your Task</h1>
      <div className="ml-8">
        <Link
          to="/create-task"
          className="inline-block p-2 px-3 bg-[#3B82F6] text-white rounded hover:bg-[#2563EB]"
        >
          Add Task
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
