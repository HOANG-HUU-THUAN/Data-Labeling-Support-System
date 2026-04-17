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
import SearchIcon from '@mui/icons-material/Search';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
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
  const [totalElements, setTotalElements] = useState(0);

  // Filter & Pagination States
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchProject, setSearchProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchTasks = () => {
    setLoading(true);
    const params = {
      page,
      size: pageSize,
      sortBy,
      sortDirection,
      projectName: searchProject || undefined,
      status: filterStatus || undefined,
    };

    getTasksForReview(params)
      .then((res) => {
        setTasks(res.data);
        setTotalElements(res.totalElements);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [user, page, pageSize, sortBy, sortDirection, searchProject, filterStatus]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Task cần kiểm duyệt
      </Typography>

      {/* Search & Filter Bar */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          label="Tìm theo tên dự án"
          variant="outlined"
          size="small"
          value={searchProject}
          onChange={(e) => {
            setSearchProject(e.target.value);
            setPage(0);
          }}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

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
                    <strong>Task ID</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell><strong>Dự án</strong></TableCell>
                <TableCell width={150}><strong>Người gán nhãn</strong></TableCell>
                <TableCell width={140}><strong>Trạng thái</strong></TableCell>
                <TableCell width={80} align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
                    <TableCell>{task.assignedAnnotatorUsername || '—'}</TableCell>
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

export default ReviewPage;
