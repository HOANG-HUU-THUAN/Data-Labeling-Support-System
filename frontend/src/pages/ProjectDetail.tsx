import { useParams, useNavigate } from "react-router-dom";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Detail</h1>

        <button
          onClick={() => navigate("/projects")}
          className="bg-gray-300 px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {/* CONTENT */}
      <div className="border rounded-xl p-6 shadow">
        <p className="mb-2">
          <span className="font-semibold">Project ID:</span> {id}
        </p>

        <p className="mb-2">
          <span className="font-semibold">Name:</span> Project {id}
        </p>

        <p>
          <span className="font-semibold">Description:</span> Demo project detail
        </p>
      </div>
    </div>
  );
}