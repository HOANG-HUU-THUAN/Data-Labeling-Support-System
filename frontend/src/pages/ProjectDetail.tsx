import { useParams } from "react-router-dom";

export default function ProjectDetail() {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Project Detail</h1>
      <p>ID: {id}</p>
    </div>
  );
}