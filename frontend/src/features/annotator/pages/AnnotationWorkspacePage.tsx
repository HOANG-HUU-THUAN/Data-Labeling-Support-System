import { useParams } from "react-router-dom";

const AnnotationWorkspacePage = () => {
  const { id } = useParams();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT: IMAGE */}
      <div style={{ flex: 3, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src="https://via.placeholder.com/600x400"
          alt="task"
          style={{ maxWidth: "90%", maxHeight: "90%" }}
        />
      </div>

      {/* RIGHT: TOOL PANEL */}
      <div style={{ flex: 1, background: "#f5f5f5", padding: 20 }}>
        <h2>Task #{id}</h2>

        <p><b>Label:</b></p>

        <button style={{ display: "block", marginBottom: 10 }}>🐶 Dog</button>
        <button style={{ display: "block", marginBottom: 10 }}>🐱 Cat</button>
        <button style={{ display: "block", marginBottom: 10 }}>🚗 Car</button>

        <hr />

        <button style={{ marginTop: 20 }}>✅ Submit</button>
      </div>
    </div>
  );
};

export default AnnotationWorkspacePage;