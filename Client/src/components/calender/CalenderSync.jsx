import apiClient from "../../services/api";

const CalenderSync = () => {
  const handleConnectGoogle = async () => {
    window.location.href = "/calender/connect/google";
  };

  const handleSyncTasks = async () => {
    try {
      await apiClient.post("/calender/sync-to-calender");
      alert("Tasks synced to google calender successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Calender Integration</h1>
      <button onClick={handleConnectGoogle}>Connect Google Calender</button>
      <button onClick={handleSyncTasks}>Sync Tasks to Calender</button>
    </div>
  );
};

export default CalenderSync;
