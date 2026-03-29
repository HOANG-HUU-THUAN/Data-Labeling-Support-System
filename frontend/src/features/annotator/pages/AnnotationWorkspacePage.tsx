import { useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../api/axios"; // chỉnh path nếu khác

function AnnotationWorkspacePage() {
  const { id } = useParams();

  const [boxes, setBoxes] = useState<any[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<any>(null);
  const [currentBox, setCurrentBox] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const labels = ["Car", "Person", "Dog"];

  // 🎯 DRAW
  const handleMouseDown = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStart({ x, y });
    setDrawing(true);
  };

  const handleMouseMove = (e: any) => {
    if (!drawing || !start) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentBox({
      x: Math.min(start.x, x),
      y: Math.min(start.y, y),
      width: Math.abs(x - start.x),
      height: Math.abs(y - start.y),
      label: "",
    });
  };

  const handleMouseUp = () => {
    if (currentBox) {
      setBoxes((prev) => [...prev, currentBox]);
    }
    setDrawing(false);
    setCurrentBox(null);
  };

  // 🗑 DELETE
  const handleDelete = () => {
    if (selectedIndex === null) return;
    setBoxes(boxes.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
  };

  // 🏷 LABEL
  const handleSetLabel = (label: string) => {
    if (selectedIndex === null) return;

    const newBoxes = [...boxes];
    newBoxes[selectedIndex].label = label;
    setBoxes(newBoxes);
  };

  // 💾 SAVE API
  const handleSave = async () => {
    try {
      await axiosInstance.post("/annotations", {
        taskId: id,
        annotations: boxes,
      });

      alert("Save thành công!");
    } catch (error) {
      console.error(error);
      alert("Save lỗi!");
    }
  };

  // 🚀 SUBMIT API
  const handleSubmit = async () => {
    try {
      await axiosInstance.post(`/tasks/${id}/submit`);
      alert("Submit thành công!");
    } catch (error) {
      console.error(error);
      alert("Submit lỗi!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Workspace Task {id}</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        
        {/* TOOLBAR */}
        <div>
          <button onClick={handleDelete}>Xóa box</button>

          <button onClick={handleSave} style={{ marginTop: "10px" }}>
            Save
          </button>

          <button onClick={handleSubmit} style={{ marginTop: "10px" }}>
            Submit
          </button>

          <div style={{ marginTop: "10px" }}>
            <p>Label:</p>
            {labels.map((label) => (
              <button
                key={label}
                onClick={() => handleSetLabel(label)}
                style={{ display: "block", marginBottom: "5px" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* CANVAS */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            border: "1px solid black",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            src="/OIP.jpg"
            alt="demo"
            style={{ display: "block", width: "400px" }}
          />

          {/* đang vẽ */}
          {currentBox && (
            <div
              style={{
                position: "absolute",
                border: "2px dashed blue",
                left: currentBox.x,
                top: currentBox.y,
                width: currentBox.width,
                height: currentBox.height,
              }}
            />
          )}

          {/* đã vẽ */}
          {boxes.map((box, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(index);
              }}
              style={{
                position: "absolute",
                border:
                  selectedIndex === index
                    ? "2px solid blue"
                    : "2px solid red",
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
                cursor: "pointer",
              }}
            >
              {/* LABEL HIỂN THỊ */}
              {box.label && (
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "0",
                    background: "yellow",
                    padding: "2px 5px",
                    fontSize: "12px",
                  }}
                >
                  {box.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnnotationWorkspacePage;