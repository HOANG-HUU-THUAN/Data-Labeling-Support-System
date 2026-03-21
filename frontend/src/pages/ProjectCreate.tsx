import { useState } from "react";

export default function ProjectCreate() {
  const [name, setName] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Create project:", name);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input
        className="border p-2 mr-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Create
      </button>
    </form>
  );
}