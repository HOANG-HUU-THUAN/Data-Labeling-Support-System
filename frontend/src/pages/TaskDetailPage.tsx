import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  Fade,
  alpha,
  useTheme,
  IconButton,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { assignTask, deleteTask, getTaskById, updateTaskStatus } from '../api/taskApi';
import { getImagesByDatasetId } from '../api/datasetApi';
import type { Task, TaskStatus } from '../types/task';
import type { DatasetImage } from '../types/dataset';
import ImageWithAuth from '../components/ImageWithAuth';

const formatImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.replace(/^\/api/, '');
};

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

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, fontWeight: 'bold' }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Stack>
);

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [task, setTask] = useState<Task | null | undefined>(undefined);
  const [taskImages, setTaskImages] = useState<DatasetImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!task || newStatus === task.status) return;
    setUpdatingStatus(true);
    updateTaskStatus(task.id, newStatus).then((updated) => {
      setTask(updated);
      setUpdatingStatus(false);
    });
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm('Xác nhận xóa task này?')) return;
    setDeleting(true);
    await deleteTask(task.id);
    navigate('/tasks');
  };

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
    let cancelled = false;
    getTaskById(Number(id)).then((t) => {
      if (cancelled) return;
      setTask(t ?? null);
      if (t && t.datasetIds.length > 0) {
        setLoadingImages(true);
        Promise.all(t.datasetIds.map(dsId => getImagesByDatasetId(dsId)))
          .then((results) => {
            if (cancelled) return;
            setTaskImages(results.flat());
          })
          .finally(() => {
            if (!cancelled) setLoadingImages(false);
          });
      }
    });
    return () => { cancelled = true; };
  }, [id]);

  if (task === undefined) {
    return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  }

  if (task === null) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Không tìm thấy dữ liệu task.</Typography>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate('/tasks')}>Danh sách Task</Button>
      </Box>
    );
  }

  return (
    <Fade in timeout={800}>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <IconButton onClick={() => navigate('/tasks')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">Chi tiết Task</Typography>
            <Typography variant="body2" color="text.secondary">Quản lý trạng thái và phân bổ nhân sự</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/tasks/${task.id}/edit`)} sx={{ borderRadius: 2, textTransform: 'none' }}>Sửa</Button>
            <Button variant="outlined" color="error" startIcon={deleting ? <CircularProgress size={16} color="error" /> : <DeleteIcon />} disabled={deleting} onClick={handleDelete} sx={{ borderRadius: 2, textTransform: 'none' }}>Xóa</Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ ...glassStyle, p: 4 }}>
              <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                <AssignmentIndIcon color="primary" /> Thông tin cơ bản
              </Typography>
              <Stack spacing={1}>
                <InfoRow label="Tên Task"><Typography variant="body1" fontWeight="bold">{task.name}</Typography></InfoRow>
                <InfoRow label="Dự án">
                  <Chip label={task.projectName || `Dự án #${task.projectId}`} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                </InfoRow>
                <InfoRow label="Annotator">
                  <Typography variant="body1">{task.assigneeUsername || 'Chưa gán'}</Typography>
                </InfoRow>
                <InfoRow label="Reviewer">
                  <Typography variant="body1">{task.reviewerUsername || 'Chưa gán'}</Typography>
                </InfoRow>
                <InfoRow label="Trạng thái">
                  <Chip
                    label={STATUS_LABEL[task.status]}
                    sx={{ bgcolor: alpha(STATUS_COLOR[task.status], 0.1), color: STATUS_COLOR[task.status], fontWeight: 'bold', borderRadius: 1.5 }}
                  />
                </InfoRow>
              </Stack>

              {task.status === 'REJECTED' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="error.main">Lý do từ chối:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Loại lỗi:</strong> {task.errorCategory || '—'}</Typography>
                  <Typography variant="body2"><strong>Ghi chú:</strong> {task.comment || '—'}</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ ...glassStyle, p: 4, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>Hành động nhanh</Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">Thay đổi trạng thái:</Typography>
                  <FormControl fullWidth size="small" disabled={updatingStatus}>
                    <Select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                      sx={{ borderRadius: 2, bgcolor: 'white' }}
                    >
                      {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                        <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {updatingStatus && <Box sx={{ textAlign: 'center', mt: 1 }}><CircularProgress size={20} /></Box>}
                </Box>
                
                <Divider sx={{ borderStyle: 'dashed' }} />
                
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Ảnh đính kèm:</Typography>
                    <Typography variant="caption" color="text.primary"><strong>{taskImages.length}</strong> ảnh</Typography>
                  </Stack>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowImages(!showImages)}
                    startIcon={showImages ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {showImages ? 'Ẩn danh sách ảnh' : 'Xem danh sách ảnh'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {showImages && (
            <Grid item xs={12}>
              <Fade in>
                <Paper sx={{ ...glassStyle, p: 3, mt: 1 }}>
                  {loadingImages ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={30} /></Box>
                  ) : taskImages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center">Không có ảnh trong các dataset được gán.</Typography>
                  ) : (
                    <ImageList cols={5} gap={16} sx={{ p: 1 }}>
                      {taskImages.map((img) => (
                        <ImageListItem key={img.id} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                          <ImageWithAuth
                            src={formatImageUrl(img.thumbnail)}
                            alt={img.name}
                            sx={{ height: 150, width: '100%', objectFit: 'cover' }}
                          />
                          <ImageListItemBar title={img.name} sx={{ '& .MuiImageListItemBar-title': { fontSize: '0.75rem' } }} />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}
                </Paper>
              </Fade>
            </Grid>
          )}
        </Grid>
      </Box>
    </Fade>
  );
};

export default TaskDetailPage;
