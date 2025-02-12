import apiClient from "../services/api";

const TeamManagement = () => {
  const [teams, setTeams] = useState("");
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");

  const addMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember]);
      setNewMember("");
    }
  };

  const handleSubmit = async () => {
    try {
      await apiClient.post("/teams", { name: teamName, members });
      alert("Team created successfully");
    } catch (error) {
      console.error(error);
    }
    return <div></div>;
  };
};

export default TeamManagement;
