import apiClient from "../services/api";

const TeamManagement = () => {
  const [teams, setTeams] = useState("");
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");

  const handleSubmit = async () => {
    try {
      await apiClient.post("/teams", { name: teamName, members });
      alert("Team created successfully");
    } catch (error) {
      console.error(error)
  };
};

export default TeamManagement;
