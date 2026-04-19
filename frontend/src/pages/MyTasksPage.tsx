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
  Fade,
  alpha,
  useTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getMyTasks } from '../api/taskApi';
import useAuthStore from '../store/authStore';
import type { TaskStatus, MyTask } from '../types/task';

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: 'Chưa làm',
  IN_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING: '#9e9e9e',
  IN_REVIEW: '#0288d1',
  APPROVED: '#2e7d32',
  REJECTED: '#d32f2f',
};

const MyTasksPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchProject, setSearchProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  };

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

    getMyTasks(params)
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" color="primary.main" mb={4}>
        Công việc của tôi
      </Typography>

      <Paper sx={{ ...glassStyle, p: 2.5, mb: 3, display: 'flex', gap: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Tìm theo tên dự án..."
          variant="outlined"
          size="small"
          value={searchProject}
          onChange={(e) => {
            setSearchProject(e.target.value);
            setPage(0);
          }}
          sx={{ width: 350, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ width: 220 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            sx={{ borderRadius: 2, bgcolor: 'white' }}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
              </InputAdornment>
            }
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
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
                  <TableCell width={100}>
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
                      Task ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Dự án liên quan</TableCell>
                  <TableCell width={180} sx={{ fontWeight: 'bold' }}>Trạng thái hiện tại</TableCell>
                  <TableCell width={150} align="center" sx={{ fontWeight: 'bold' }}>Làm việc</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">Bạn chưa được gán công việc nào.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.taskId} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>#{task.taskId}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{task.projectName}</TableCell>
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
                      <TableCell align="center">
                        <Tooltip title="Mở Workspace gán nhãn">
                          <IconButton
                            size="medium"
                            color="primary"
                            onClick={() => navigate(`/annotation/${task.taskId}`)}
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
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

export default MyTasksPage;
