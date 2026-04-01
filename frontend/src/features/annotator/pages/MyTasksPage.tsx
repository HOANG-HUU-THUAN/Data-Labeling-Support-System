import { useNavigate } from "react-router-dom";

const MyTasksPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h1>Task của tôi</h1>

      <div onClick={() => navigate("/task/1")} style={{ cursor: "pointer", marginTop: 10 }}>
        🔹 Task 1
      </div>

      <div onClick={() => navigate("/task/2")} style={{ cursor: "pointer", marginTop: 10 }}>
        🔹 Task 2
      </div>
    </div>
  );
};

export default MyTasksPage;