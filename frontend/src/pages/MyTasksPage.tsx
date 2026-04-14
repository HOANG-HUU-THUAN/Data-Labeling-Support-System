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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getMyTasks } from '../mock/annotatorMock';
import useAuthStore from '../store/authStore';
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

const MyTasksPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyTasks(user.id)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Task của tôi
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
                <TableCell><strong>Tên task</strong></TableCell>
                <TableCell width={140}><strong>Trạng thái</strong></TableCell>
                <TableCell width={80} align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bạn chưa được gán task nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[task.status]}
                        color={STATUS_COLOR[task.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Mở workspace">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/annotation/${task.id}`)}
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

export default MyTasksPage;

