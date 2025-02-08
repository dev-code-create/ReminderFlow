import { useEffect, useState } from "react";
import apiClient from "../services/api";

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Task</h1>
      <ul>
        {tasks.map((task) => {
          <li key={task._id} className="mb-2 p-2 border rounded-md">
            <h1 className="font-semibold">{task.title}</h1>
            <p>{task.description}</p>
            <p className="text-sm text-gray-500">
              Due : {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </li>;
        })}
      </ul>
    </div>
  );
};

export default Dashboard;
