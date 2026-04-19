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
  Stack,
  Fade,
  alpha,
  useTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getTasks, deleteTask } from '../api/taskApi';
import type { Task, TaskStatus } from '../types/task';

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  IN_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING: '#9e9e9e',
  IN_PROGRESS: '#ed6c02',
  IN_REVIEW: '#0288d1',
  APPROVED: '#2e7d32',
  REJECTED: '#d32f2f',
};

const TasksPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('');

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  };

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
    if (!window.confirm(`Xóa task "${task.name}"?`)) return;
    setDeletingId(task.id);
    await deleteTask(task.id);
    setDeletingId(null);
    loadTasks();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          Quản lý Task
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/tasks/create')}
          sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold', px: 3 }}
        >
          Tạo task hàng loạt
        </Button>
      </Stack>

      <Paper sx={{ ...glassStyle, p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FilterListIcon color="primary" sx={{ ml: 1 }} />
        <FormControl size="small" sx={{ width: 220 }}>
          <InputLabel>Lọc trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Lọc trạng thái"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            sx={{ borderRadius: 2, bgcolor: 'white' }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Fade in timeout={800}>
          <TableContainer component={Paper} sx={{ ...glassStyle, overflow: 'hidden' }}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell width={80}>
                    <TableSortLabel
                      active={sortBy === 'id'}
                      direction={sortBy === 'id' ? sortDirection : 'asc'}
                      onClick={() => {
                        const isAsc = sortBy === 'id' && sortDirection === 'asc';
                        setSortDirection(isAsc ? 'desc' : 'asc');
                        setSortBy('id');
                      }}
                      sx={{ fontWeight: 'bold' }}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên Task / Dự án</TableCell>
                  <TableCell width={160} sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell width={180} sx={{ fontWeight: 'bold' }}>Người được gán</TableCell>
                  <TableCell width={140} align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">Không tìm thấy task nào.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>#{task.id}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">{task.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{task.projectName || `Dự án ID: ${task.projectId}`}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABEL[task.status]}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', borderRadius: 1.5,
                            bgcolor: alpha(STATUS_COLOR[task.status], 0.1),
                            color: STATUS_COLOR[task.status],
                            border: '1px solid', borderColor: alpha(STATUS_COLOR[task.status], 0.2)
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: task.assigneeUsername ? 'success.main' : 'grey.400' }} />
                          <Typography variant="body2">{task.assigneeUsername || 'Chưa gán'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Chi tiết">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/tasks/${task.id}`)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sửa">
                            <IconButton size="small" color="info" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={deletingId === task.id}
                              onClick={() => handleDelete(task)}
                            >
                              {deletingId === task.id ? <CircularProgress size={16} color="error" /> : <DeleteIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
              sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
            />
          </TableContainer>
        </Fade>
      )}
    </Box>
  );
};

export default TasksPage;
