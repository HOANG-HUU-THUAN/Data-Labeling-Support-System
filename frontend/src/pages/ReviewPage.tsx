import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getTasksForReview } from '../api/taskApi';
import useAuthStore from '../store/authStore';
import type { TaskStatus, MyTask } from '../types/task';

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  IN_REVIEW: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

const STATUS_COLOR: Record<TaskStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'default',
  IN_PROGRESS: 'warning',
  IN_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
};

const ReviewPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getTasksForReview()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Task cần kiểm duyệt
      </Typography>

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
                <TableCell><strong>Tên project</strong></TableCell>
                <TableCell width={140}><strong>Trạng thái</strong></TableCell>
                <TableCell width={80} align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có task nào cần kiểm duyệt
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.taskId} hover>
                    <TableCell>{task.taskId}</TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[task.status]}
                        color={STATUS_COLOR[task.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Mở workspace duyệt">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/annotation/${task.taskId}`)}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
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

export default ReviewPage;
