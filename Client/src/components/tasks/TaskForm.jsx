import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/api";

const TaskForm = ({ isEdit = false, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate || "",
    priority: initialData?.priority || "",
  });

  const navigate = useNavigate();
  const { taskId } = useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await apiClient.put(`/api/tasks/${taskId}`, formData);
      } else {
        await apiClient.post("/api/tasks", formData);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return <div></div>;
};

export default TaskForm;
