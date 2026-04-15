import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTasks, deleteTask } from '../api/taskApi';
import type { Task, TaskStatus } from '../types/task';

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  SUBMITTED: 'Đã nộp',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

const STATUS_COLOR: Record<TaskStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  TODO: 'default',
  IN_PROGRESS: 'warning',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
};

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTasks = () => {
    setLoading(true);
    getTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`Bạn có chắc muốn xóa task "${task.name}" không?`)) return;
    setDeletingId(task.id);
    await deleteTask(task.id);
    setDeletingId(null);
    loadTasks();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Quản lý Task
        </Typography>
        <Button variant="contained" onClick={() => navigate('/tasks/create')}>
          Tạo task
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell width={60}><strong>ID</strong></TableCell>
                <TableCell><strong>Tên task</strong></TableCell>
                <TableCell width={110}><strong>Project ID</strong></TableCell>
                <TableCell width={140}><strong>Trạng thái</strong></TableCell>
                <TableCell width={130}><strong>Người được gán</strong></TableCell>
                <TableCell width={120} align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có task
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.projectId}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[task.status]}
                        color={STATUS_COLOR[task.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {task.assigneeId ? `User #${task.assigneeId}` : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem">
                        <IconButton size="small" onClick={() => navigate(`/tasks/${task.id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton size="small" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={deletingId === task.id}
                            onClick={() => handleDelete(task)}
                          >
                            {deletingId === task.id
                              ? <CircularProgress size={16} color="error" />
                              : <DeleteIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TasksPage;

