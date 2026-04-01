import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReviewTask } from '../api/reviewerApi'
import { getReviewerTasks } from '../api/reviewerApi'

export default function ReviewerTaskList() {
      const [tasks, setTasks] = useState<ReviewTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const data = await getReviewerTasks()
        setTasks(data)
        setError(null)
      } catch (err) {
        setError('Failed to load tasks')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handleReview = (taskId: string) => {
    navigate(`/reviewer/${taskId}`)
  }

  if (loading) {
    return <div className="container">Loading tasks...</div>
  }

  if (error) {
    return <div className="container error">{error}</div>
  }

  return (
    <div className="container">
      <h1>Review Tasks</h1>
      <div className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.name}</td>
                  <td>
                    <span className={`status status-${task.status}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-review"
                      onClick={() => handleReview(task.id)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
