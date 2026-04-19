import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  OutlinedInput,
  Fade,
  alpha,
  useTheme,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import EditIcon from '@mui/icons-material/Edit';
import { getProjects } from '../api/projectApi';
import { getDatasetsByProject } from '../api/datasetApi';
import { createBatchTasks, getTaskById, updateTask } from '../api/taskApi';
import { getUsersByRole } from '../api/userApi';
import type { User as ApiUser } from '../api/userApi';
import type { Project } from '../types/project';
import type { Dataset } from '../types/dataset';

const TaskFormPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [projectId, setProjectId] = useState<number | ''>('');
  const [datasetId, setDatasetId] = useState<number | ''>('');
  const [imagesPerTask, setImagesPerTask] = useState<number>(10);
  const [annotatorIds, setAnnotatorIds] = useState<number[]>([]);
  const [reviewerIds, setReviewerIds] = useState<number[]>([]);
  const [name, setName] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [annotators, setAnnotators] = useState<ApiUser[]>([]);
  const [reviewers, setReviewers] = useState<ApiUser[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };

  useEffect(() => {
    getProjects({ size: 100 }).then((res) => setProjects(res.data));
    getUsersByRole('ANNOTATOR').then(setAnnotators);
    getUsersByRole('REVIEWER').then(setReviewers);
  }, []);

  useEffect(() => {
    if (!isEdit || !id || isNaN(Number(id))) return;
    let cancelled = false;
    getTaskById(Number(id)).then((task) => {
      if (cancelled || !task) return;
      setName(task.name);
      setProjectId(task.projectId);
      setAnnotatorIds(task.assigneeId ? [task.assigneeId] : []);
      setReviewerIds(task.reviewerId ? [task.reviewerId] : []);
      getDatasetsByProject(task.projectId).then((all) => {
        if (cancelled) return;
        setDatasets(all);
        if (task.datasetIds && task.datasetIds.length > 0) setDatasetId(task.datasetIds[0]);
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    if (projectId === '') {
      setDatasets([]);
      setDatasetId('');
      return;
    }
    setLoadingDatasets(true);
    setDatasetId('');
    getDatasetsByProject(projectId).then(setDatasets).finally(() => setLoadingDatasets(false));
  }, [projectId, isEdit]);

  const validate = () => {
    const e: any = {};
    if (isEdit) {
      e.name = name.trim() === '';
      e.projectId = projectId === '';
    } else {
      e.projectId = projectId === '';
      e.datasetId = datasetId === '';
      e.imagesPerTask = imagesPerTask < 1;
      e.annotatorIds = annotatorIds.length === 0;
      e.reviewerIds = reviewerIds.length === 0;
    }
    setErrors(e);
    return !Object.values(e).some(v => v === true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTask(Number(id), {
          name: name.trim(),
          datasetIds: datasetId !== '' ? [datasetId as number] : [],
          assigneeId: annotatorIds.length > 0 ? annotatorIds[0] : null,
          reviewerId: reviewerIds.length > 0 ? reviewerIds[0] : null,
        });
      } else {
        await createBatchTasks(projectId as number, {
          datasetId: datasetId as number,
          imagesPerTask,
          annotatorIds,
          reviewerIds,
        });
      }
      navigate('/tasks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Fade in timeout={800}>
      <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <IconButton onClick={() => navigate('/tasks')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {isEdit ? 'Chỉnh sửa Task' : 'Tạo Task Hàng Loạt'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? `Cập nhật thông tin cho task #${id}` : 'Hệ thống tự động chia nhỏ Dataset thành nhiều task'}
            </Typography>
          </Box>
        </Stack>

        <Paper sx={{ ...glassStyle, p: 4 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={2} color="text.secondary" display="flex" alignItems="center" gap={1}>
                {isEdit ? <EditIcon fontSize="small" color="primary" /> : <BatchPredictionIcon fontSize="small" color="primary" />} Cấu hình cơ bản
              </Typography>
              <Stack spacing={2.5}>
                {isEdit && (
                  <TextField
                    label="Tên Task"
                    value={name} onChange={(e) => setName(e.target.value)}
                    error={!!errors.name} helperText={errors.name ? 'Vui lòng nhập tên task' : ''}
                    fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
                <FormControl fullWidth error={!!errors.projectId} disabled={isEdit}>
                  <InputLabel>Dự án</InputLabel>
                  <Select
                    value={projectId} label="Dự án"
                    onChange={(e) => setProjectId(e.target.value as number)}
                    sx={{ borderRadius: 2 }}
                  >
                    {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </Select>
                  {errors.projectId && <FormHelperText>Vui lòng chọn dự án mục tiêu</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.datasetId}>
                  <InputLabel>Dataset nguồn</InputLabel>
                  <Select
                    value={datasetId} label="Dataset nguồn"
                    onChange={(e) => setDatasetId(e.target.value as number)}
                    disabled={loadingDatasets || projectId === ''}
                    sx={{ borderRadius: 2 }}
                  >
                    {datasets.map((ds) => <MenuItem key={ds.id} value={ds.id}>#{ds.id} — {ds.name}</MenuItem>)}
                  </Select>
                  {errors.datasetId && <FormHelperText>Vui lòng chọn bộ dữ liệu</FormHelperText>}
                </FormControl>

                {!isEdit && (
                  <TextField
                    label="Số lượng ảnh mỗi Task"
                    type="number"
                    value={imagesPerTask} onChange={(e) => setImagesPerTask(Number(e.target.value))}
                    error={!!errors.imagesPerTask} helperText={errors.imagesPerTask ? 'Vượt quá 0 ảnh' : ''}
                    fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                )}
              </Stack>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={2} color="text.secondary">Gán nhân sự phụ trách</Typography>
              <Stack spacing={2.5}>
                <FormControl fullWidth error={!!errors.annotatorIds}>
                  <InputLabel>Annotators (Nhân viên gán nhãn)</InputLabel>
                  <Select
                    multiple={!isEdit}
                    value={isEdit ? (annotatorIds.length > 0 ? annotatorIds[0] : '') : annotatorIds}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isEdit) setAnnotatorIds(val === '' ? [] : [val as number]);
                      else setAnnotatorIds(typeof val === 'string' ? val.split(',').map(Number) : val as number[]);
                    }}
                    input={<OutlinedInput label="Annotators (Nhân viên gán nhãn)" sx={{ borderRadius: 2 }} />}
                    renderValue={(selected) => {
                      if (isEdit) return annotators.find((a) => a.id === (selected as number))?.username || selected;
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as number[]).map((value) => (
                            <Chip key={value} label={annotators.find((a) => a.id === value)?.username || value} size="small" sx={{ borderRadius: 1 }} />
                          ))}
                        </Box>
                      );
                    }}
                  >
                    {isEdit && <MenuItem value="">— Để trống —</MenuItem>}
                    {annotators.map((u) => <MenuItem key={u.id} value={u.id}>{u.username} ({u.email})</MenuItem>)}
                  </Select>
                  {errors.annotatorIds && <FormHelperText>Chọn ít nhất 1 người gán nhãn</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.reviewerIds}>
                  <InputLabel>Reviewers (Người kiểm duyệt)</InputLabel>
                  <Select
                    multiple={!isEdit}
                    value={isEdit ? (reviewerIds.length > 0 ? reviewerIds[0] : '') : reviewerIds}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (isEdit) setReviewerIds(val === '' ? [] : [val as number]);
                      else setReviewerIds(typeof val === 'string' ? val.split(',').map(Number) : val as number[]);
                    }}
                    input={<OutlinedInput label="Reviewers (Người kiểm duyệt)" sx={{ borderRadius: 2 }} />}
                    renderValue={(selected) => {
                      if (isEdit) return reviewers.find((a) => a.id === (selected as number))?.username || selected;
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as number[]).map((value) => (
                            <Chip key={value} label={reviewers.find((a) => a.id === value)?.username || value} size="small" sx={{ borderRadius: 1 }} />
                          ))}
                        </Box>
                      );
                    }}
                  >
                    {isEdit && <MenuItem value="">— Để trống —</MenuItem>}
                    {reviewers.map((u) => <MenuItem key={u.id} value={u.id}>{u.username} ({u.email})</MenuItem>)}
                  </Select>
                  {errors.reviewerIds && <FormHelperText>Chọn ít nhất 1 người kiểm duyệt</FormHelperText>}
                </FormControl>
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
              <Button onClick={() => navigate('/tasks')} disabled={submitting} sx={{ borderRadius: 2, px: 3, color: 'text.secondary' }}>Hủy bỏ</Button>
              <Button 
                variant="contained" startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                onClick={handleSubmit} disabled={submitting} 
                sx={{ borderRadius: 2, px: 5, fontWeight: 'bold', textTransform: 'none', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' }}
              >
                {isEdit ? 'Lưu thay đổi' : 'Xác nhận tạo hàng loạt'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Fade>
  );
};

export default TaskFormPage;
