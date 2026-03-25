import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { getTaskById } from '../mock/taskMock';
import { getDatasetsByProject } from '../mock/datasetMock';
import type { Task, TaskStatus } from '../types/task';
import type { Dataset } from '../types/dataset';

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

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Typography variant="body2" color="text.secondary" minWidth={140}>
      {label}
    </Typography>
    {children}
  </Stack>
);

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null | undefined>(undefined); // undefined = loading
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getTaskById(Number(id)).then((t) => {
      if (cancelled) return;
      const found = t ?? null;
      setTask(found);
      if (found && found.datasetIds.length > 0) {
        setLoadingDatasets(true);
        getDatasetsByProject(found.projectId).then((all) => {
          if (cancelled) return;
          setDatasets(all.filter((d) => found.datasetIds.includes(d.id)));
          setLoadingDatasets(false);
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

          <InfoRow label="Người được gán">
            <Typography variant="body1">
              {task.assigneeId ? `User #${task.assigneeId}` : '—'}
            </Typography>
          </InfoRow>

          <InfoRow label="Trạng thái">
            <Chip
              label={STATUS_LABEL[task.status]}
              color={STATUS_COLOR[task.status]}
              size="small"
            />
          </InfoRow>

          <Divider />

          {/* DATASET PREVIEW */}
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Dataset ({task.datasetIds.length} ảnh)
            </Typography>

            {loadingDatasets ? (
              <CircularProgress size={20} />
            ) : task.datasetIds.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Không có dataset nào
              </Typography>
            ) : datasets.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Không tải được dataset
              </Typography>
            ) : (
              <ImageList cols={4} gap={8}>
                {datasets.map((ds) => (
                  <ImageListItem key={ds.id}>
                    <Box
                      component="img"
                      src={ds.url}
                      alt={ds.name}
                      sx={{
                        height: 120,
                        width: '100%',
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                    <ImageListItemBar
                      title={ds.name}
                      sx={{ borderRadius: '0 0 4px 4px' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TaskDetailPage;
