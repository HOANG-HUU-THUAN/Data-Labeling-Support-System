import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fakeData = [
      { id: 1, name: "Task 1" },
      { id: 2, name: "Task 2" },
    ];
    setTasks(fakeData);
  }, []);

  return (
    <div>
      <h1>Task của tôi</h1>

      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => navigate(`/task/${task.id}`)}
          style={{ cursor: "pointer", marginBottom: "10px" }}
        >
          <p>{task.name}</p>
        </div>
      ))}
    </div>
  );
}

export default MyTasksPage;