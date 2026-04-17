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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { assignTask, deleteTask, getTaskById, updateTaskStatus } from '../api/taskApi';
import { getImagesByDatasetId } from '../api/datasetApi';
import type { Task, TaskStatus } from '../types/task';
import type { DatasetImage } from '../types/dataset';
import ImageWithAuth from '../components/ImageWithAuth';

const formatImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Backend returns /api/v1/... but axiosInstance baseURL is .../api
  // Strip /api to avoid duplication
  return url.replace(/^\/api/, '');
};

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

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Typography variant="body2" color="text.secondary" minWidth={140}>
      {label}
    </Typography>
    {children}
  </Stack>
);

// Annotators from mock
const ANNOTATORS = [
  { id: 3, name: 'Annotator' },
];

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null | undefined>(undefined);
  const [taskImages, setTaskImages] = useState<DatasetImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!task || newStatus === task.status) return;
    setUpdatingStatus(true);
    updateTaskStatus(task.id, newStatus).then((updated) => {
      setTask(updated);
      setUpdatingStatus(false);
    });
  };

  const handleAssign = (newAssigneeId: number | '') => {
    if (!task) return;
    const resolved = newAssigneeId === '' ? undefined : (newAssigneeId as number);
    setAssigning(true);
    assignTask(task.id, resolved).then((updated) => {
      setTask(updated);
      setAssigning(false);
    });
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm('Bạn có chắc muốn xóa task này?')) return;
    setDeleting(true);
    await deleteTask(task.id);
    navigate('/tasks');
  };

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
    let cancelled = false;
    getTaskById(Number(id)).then((t) => {
      if (cancelled) return;
      const found = t ?? null;
      setTask(found);
      if (found && found.datasetIds.length > 0) {
        setLoadingImages(true);
        Promise.all(found.datasetIds.map(id => getImagesByDatasetId(id)))
          .then((results) => {
            if (cancelled) return;
            setTaskImages(results.flat());
            setLoadingImages(false);
          })
          .catch(() => {
            if (cancelled) return;
            setLoadingImages(false);
          });
      }
    });
    return () => { cancelled = true; };
  }, [id]);

  if (task === undefined) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (task === null) {
    return (
      <Box mt={6} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          Không tìm thấy task
        </Typography>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate('/tasks')}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth={700}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => navigate('/tasks')}
        >
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold" flex={1}>
          Chi tiết task
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/tasks/${task.id}/edit`)}
        >
          Chỉnh sửa
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={deleting ? <CircularProgress size={16} color="error" /> : <DeleteIcon />}
          disabled={deleting}
          onClick={handleDelete}
        >
          Xóa
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <InfoRow label="Tên task">
            <Typography variant="body1" fontWeight={500}>
              {task.name}
            </Typography>
          </InfoRow>

          <InfoRow label="Project ID">
            <Typography variant="body1">{task.projectId}</Typography>
          </InfoRow>

          <InfoRow label="Annotator">
            <Typography variant="body1">
              {task.assigneeUsername || (task.assigneeId ? `User #${task.assigneeId}` : '—')}
            </Typography>
          </InfoRow>

          <InfoRow label="Reviewer">
            <Typography variant="body1">
              {task.reviewerUsername || (task.reviewerId ? `User #${task.reviewerId}` : '—')}
            </Typography>
          </InfoRow>

          <InfoRow label="Trạng thái">
            <Chip
              label={STATUS_LABEL[task.status]}
              color={STATUS_COLOR[task.status]}
              size="small"
            />
          </InfoRow>
          
          {task.status === 'REJECTED' && (
            <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1, color: 'error.contrastText' }}>
              <Typography variant="subtitle2" fontWeight="bold">Lý do từ chối:</Typography>
              <Typography variant="body2">Loại lỗi: <strong>{task.errorCategory || '—'}</strong></Typography>
              <Typography variant="body2">Ghi chú: {task.comment || '—'}</Typography>
            </Box>
          )}

          <Divider />

          {/* STATUS UPDATE SECTION */}
          <Box>
            <Typography variant="body2" fontWeight={500} mb={1}>
              Cập nhật trạng thái
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 200 }} disabled={updatingStatus}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={task.status}
                  label="Trạng thái"
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                >
                  {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                    <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {updatingStatus && <CircularProgress size={16} />}
            </Stack>
          </Box>

          <Divider />
          {/* <Box>
            <Typography variant="body2" fontWeight={500} mb={1}>
              Gán người thực hiện
            </Typography>
            <FormControl size="small" sx={{ minWidth: 220 }} disabled={assigning}>
              <InputLabel>Annotator</InputLabel>
              <Select
                value={task.assigneeId ?? ''}
                label="Annotator"
                onChange={(e) => handleAssign(e.target.value as number | '')}
              >
                <MenuItem value="">— Không gán —</MenuItem>
                {ANNOTATORS.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {assigning && <CircularProgress size={16} sx={{ ml: 1, verticalAlign: 'middle' }} />}
          </Box> */}

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Ảnh từ dataset ({taskImages.length} ảnh)
              </Typography>
              <Button
                size="small"
                onClick={() => setShowImages(!showImages)}
                startIcon={showImages ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showImages ? 'Ẩn ảnh' : 'Hiện ảnh'}
              </Button>
            </Stack>

            {showImages && (
              <>
                {loadingImages ? (
                  <CircularProgress size={20} />
                ) : taskImages.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Không có ảnh nào trong các dataset được chọn
                  </Typography>
                ) : (
                  <ImageList cols={4} gap={8}>
                    {taskImages.map((img) => (
                      <ImageListItem key={img.id}>
                        <ImageWithAuth
                          src={formatImageUrl(img.thumbnail)}
                          alt={img.name}
                          sx={{
                            height: 120,
                            width: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <ImageListItemBar
                          title={img.name}
                          sx={{ borderRadius: '0 0 4px 4px' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </>
            )}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TaskDetailPage;
