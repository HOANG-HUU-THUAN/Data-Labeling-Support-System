import { useNavigate } from "react-router-dom";

const projects = [
  { id: 1, name: "Project A" },
  { id: 2, name: "Project B" },
];

export default function ProjectList() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project List</h1>

        {/* BUTTON CREATE */}
        <button
          onClick={() => navigate("/projects/create")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Project
        </button>
      </div>

      {/* LIST PROJECT */}
      <div className="grid grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/projects/${p.id}`)}
            className="border rounded-xl p-4 shadow hover:shadow-lg cursor-pointer transition"
          >
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-gray-500 text-sm">Click to view detail</p>
          </div>
        ))}
      </div>
    </div>
  );
}