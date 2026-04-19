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
  Stack,
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
import RateReviewIcon from '@mui/icons-material/RateReview';
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

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING: '#9e9e9e',
  IN_PROGRESS: '#ed6c02',
  IN_REVIEW: '#0288d1',
  APPROVED: '#2e7d32',
  REJECTED: '#d32f2f',
};

const ReviewPage = () => {
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
    <Fade in timeout={800}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', display: 'flex' }}>
            <RateReviewIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="info.main">Kiểm duyệt công việc</Typography>
            <Typography variant="body2" color="text.secondary">Danh sách các task đang chờ xử lý và xem xét chất lượng</Typography>
          </Box>
        </Stack>

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
                  <SearchIcon fontSize="small" color="info" />
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
                  <FilterListIcon fontSize="small" sx={{ ml: 1, color: 'info.main' }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="IN_REVIEW">Đang chờ duyệt</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
              <MenuItem value="REJECTED">Đã từ chối</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress color="info" /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ ...glassStyle, overflow: 'hidden' }}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.info.main, 0.04) }}>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Dự án mục tiêu</TableCell>
                  <TableCell width={200} sx={{ fontWeight: 'bold' }}>Người gán nhãn</TableCell>
                  <TableCell width={180} sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell width={120} align="center" sx={{ fontWeight: 'bold' }}>Kiểm duyệt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">Không có task nào cần kiểm duyệt lúc này.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.taskId} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.01) } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>#{task.taskId}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{task.projectName}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                          <Typography variant="body2">{task.assignedAnnotatorUsername || '—'}</Typography>
                        </Stack>
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
                      <TableCell align="center">
                        <Tooltip title="Mở Workspace kiểm duyệt">
                          <IconButton
                            size="medium"
                            color="info"
                            onClick={() => navigate(`/annotation/${task.taskId}`)}
                            sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) } }}
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
              labelRowsPerPage="Dòng mỗi trang:"
              sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
            />
          </TableContainer>
        )}
      </Box>
    </Fade>
  );
};

export default ReviewPage;
