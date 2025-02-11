import { useEffect, useState } from "react";
import apiClient from "../../services/api";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await apiClient.get("/task");
      setTasks(response.data);
    };
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return <div></div>;
};

export default TaskList;
