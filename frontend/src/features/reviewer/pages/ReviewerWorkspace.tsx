import { useState } from 'react'

interface Annotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  label?: string
}

// Mock annotations
const mockAnnotations: Annotation[] = [
  { id: 'ann1', x: 50, y: 80, width: 120, height: 150, label: 'car' },
  { id: 'ann2', x: 200, y: 120, width: 100, height: 140, label: 'person' },
  { id: 'ann3', x: 350, y: 100, width: 90, height: 110, label: 'bicycle' },
]

export default function ReviewerWorkspace() {
  const [showBoxes, setShowBoxes] = useState(true)

  const handleApprove = () => {
    alert('Task approved')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h1>Reviewer Workspace</h1>

      {/* Image container with bounding boxes */}
      <div
        style={{
          position: 'relative',
          width: 'fit-content',
          margin: '20px 0',
          border: '1px solid #ccc',
        }}
      >
        <img
          src="https://picsum.photos/600/400"
          alt="Sample review"
          style={{ display: 'block' }}
        />

        {/* Bounding boxes overlay */}
        {showBoxes &&
          mockAnnotations.map((annotation) => (
            <div
              key={annotation.id}
              style={{
                position: 'absolute',
                left: `${annotation.x}px`,
                top: `${annotation.y}px`,
                width: `${annotation.width}px`,
                height: `${annotation.height}px`,
                border: '2px solid #FF0000',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              }}
            >
              {annotation.label && (
                <div
                  style={{
                    color: '#FF0000',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '2px 4px',
                    width: 'fit-content',
                  }}
                >
                  {annotation.label}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => setShowBoxes(!showBoxes)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {showBoxes ? 'Hide' : 'Show'} Boxes
        </button>
        <button
          onClick={handleApprove}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Approve
        </button>
      </div>
    </div>
  )
}
