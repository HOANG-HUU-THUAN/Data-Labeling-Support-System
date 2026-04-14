export default function ProjectCard({ project }: any) {
  return (
    <div className="border p-4 rounded-xl shadow">
      <h2 className="font-bold">{project.name}</h2>
    </div>
  );
}