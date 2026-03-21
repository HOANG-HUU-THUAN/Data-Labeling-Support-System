import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    console.log({
      name,
      description,
    });

    // giả lập tạo xong → quay về list
    navigate("/projects");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NAME */}
        <div>
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded-lg"
            placeholder="Enter project name"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded-lg"
            placeholder="Enter description"
          />
        </div>

        {/* BUTTON */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Create
          </button>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="bg-gray-300 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}