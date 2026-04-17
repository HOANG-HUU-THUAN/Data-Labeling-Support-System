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
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import { getTasks, deleteTask } from '../api/taskApi';
import type { Task, TaskStatus } from '../types/task';

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  IN_REVIEW: 'Đang duyệt',
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

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter & Pagination States
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('');

  const loadTasks = () => {
    setLoading(true);
    const params = {
      page,
      size: pageSize,
      sortBy,
      sortDirection,
      status: filterStatus || undefined,
    };

    getTasks(params)
      .then((res) => {
        setTasks(res.data);
        setTotalElements(res.totalElements);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, [page, pageSize, sortBy, sortDirection, filterStatus]);

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

      {/* Filter Bar */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
                <TableCell width={80}>
                  <TableSortLabel
                    active={sortBy === 'id'}
                    direction={sortBy === 'id' ? sortDirection : 'asc'}
                    onClick={() => {
                      const isAsc = sortBy === 'id' && sortDirection === 'asc';
                      setSortDirection(isAsc ? 'desc' : 'asc');
                      setSortBy('id');
                    }}
                  >
                    <strong>ID</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell width={150}><strong>Tên dự án</strong></TableCell>
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
                    {/* <TableCell>{task.name}</TableCell> */}
                    <TableCell>{task.projectName || task.projectId}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[task.status]}
                        color={STATUS_COLOR[task.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {task.assigneeUsername || '—'}
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

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Số dòng mỗi trang:"
      />
    </Box>
  );
};

export default TasksPage;

