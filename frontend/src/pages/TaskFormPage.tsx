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
} from '@mui/material';
import { getProjects } from '../api/projectApi';
import { getDatasetsByProject } from '../api/datasetApi';
import { createBatchTasks, getTaskById, updateTask } from '../api/taskApi';
import { getUsersByRole } from '../api/userApi';
import type { User as ApiUser } from '../api/userApi';
import type { Project } from '../types/project';
import type { Dataset } from '../types/dataset';

const TaskFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  
  // States
  const [projectId, setProjectId] = useState<number | ''>('');
  const [datasetId, setDatasetId] = useState<number | ''>('');
  const [imagesPerTask, setImagesPerTask] = useState<number>(10);
  const [annotatorIds, setAnnotatorIds] = useState<number[]>([]);
  const [reviewerIds, setReviewerIds] = useState<number[]>([]);
  
  // Edit mode only states
  const [name, setName] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [annotators, setAnnotators] = useState<ApiUser[]>([]);
  const [reviewers, setReviewers] = useState<ApiUser[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<any>({});

  // Load projects, annotators, and reviewers once
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
      // Load datasets for the project, then restore checked ids
      getDatasetsByProject(task.projectId).then((all) => {
        if (cancelled) return;
        setDatasets(all);
        if (task.datasetIds && task.datasetIds.length > 0) {
          setDatasetId(task.datasetIds[0]);
        }
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  // In create mode: reload datasets when project changes
  useEffect(() => {
    if (isEdit) return; // edit mode uses the effect above
    if (projectId === '') {
      setDatasets([]);
      setDatasetId('');
      return;
    }
    setLoadingDatasets(true);
    setDatasetId('');
    getDatasetsByProject(projectId)
      .then(setDatasets)
      .finally(() => setLoadingDatasets(false));
  }, [projectId, isEdit]);

  const validate = () => {
    if (isEdit) {
      const e = {
        name: name.trim() === '',
        projectId: projectId === '',
      };
      setErrors(e);
      return !e.name && !e.projectId;
    } else {
      const e = {
        projectId: projectId === '',
        datasetId: datasetId === '',
        imagesPerTask: imagesPerTask < 1,
        annotatorIds: annotatorIds.length === 0,
        reviewerIds: reviewerIds.length === 0,
      };
      setErrors(e);
      return !e.projectId && !e.datasetId && !e.imagesPerTask && !e.annotatorIds && !e.reviewerIds;
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {isEdit ? 'Chỉnh sửa task' : 'Tạo task hàng loạt'}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* NAME - Edit Mode Only */}
          {isEdit && (
            <TextField
              label="Tên task"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name ? 'Vui lòng nhập tên task' : ''}
              fullWidth
              size="small"
            />
          )}

          {/* PROJECT — disabled in edit mode */}
          <FormControl fullWidth size="small" error={!!errors.projectId} disabled={isEdit}>
            <InputLabel>Project</InputLabel>
            <Select
              value={projectId}
              label="Project"
              onChange={(e) => setProjectId(e.target.value as number)}
            >
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
            {errors.projectId && <FormHelperText>Vui lòng chọn project</FormHelperText>}
          </FormControl>

          {/* DATASET SINGLE-SELECT */}
          <FormControl fullWidth size="small" error={!!errors.datasetId}>
            <InputLabel>Dataset</InputLabel>
            <Select
              value={datasetId}
              label="Dataset"
              onChange={(e) => setDatasetId(e.target.value as number)}
              disabled={loadingDatasets || projectId === ''}
            >
              {datasets.map((ds) => (
                <MenuItem key={ds.id} value={ds.id}>
                  #{ds.id} — {ds.name}
                </MenuItem>
              ))}
            </Select>
            {errors.datasetId && <FormHelperText>Vui lòng chọn 1 dataset</FormHelperText>}
            {projectId !== '' && datasets.length === 0 && !loadingDatasets && (
               <FormHelperText>Không có dataset nào trong project này</FormHelperText>
            )}
          </FormControl>

          {/* IMAGES PER TASK - Create Mode Only */}
          {!isEdit && (
            <TextField
              label="Số ảnh mỗi task (Images / Task)"
              type="number"
              value={imagesPerTask}
              onChange={(e) => setImagesPerTask(Number(e.target.value))}
              error={!!errors.imagesPerTask}
              helperText={errors.imagesPerTask ? 'Số ảnh mỗi task phải lớn hơn 0' : ''}
              fullWidth
              size="small"
              InputProps={{ inputProps: { min: 1 } }}
            />
          )}

          <Divider />

          {/* ASSIGNEES (Multiple for create, Single mapped to multiple array for Edit) */}
          <FormControl fullWidth size="small" error={!!errors.annotatorIds}>
            <InputLabel>Annotators (Người gán nhãn)</InputLabel>
            <Select
              multiple={!isEdit}
              value={isEdit ? (annotatorIds.length > 0 ? annotatorIds[0] : '') : annotatorIds}
              onChange={(e) => {
                const val = e.target.value;
                if (isEdit) {
                  setAnnotatorIds(val === '' ? [] : [val as number]);
                } else {
                  setAnnotatorIds(typeof val === 'string' ? val.split(',').map(Number) : val as number[]);
                }
              }}
              input={<OutlinedInput label="Annotators (Người gán nhãn)" />}
              renderValue={(selected) => {
                if (isEdit) {
                  const s = selected as number;
                  return annotators.find((a) => a.id === s)?.username || s;
                }
                const selArr = selected as number[];
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selArr.map((value) => {
                      const annotator = annotators.find((a) => a.id === value);
                      return <Chip key={value} label={annotator?.username || value} size="small" />;
                    })}
                  </Box>
                );
              }}
            >
               {isEdit && <MenuItem value="">— Không gán —</MenuItem>}
              {annotators.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.username} ({u.email})
                </MenuItem>
              ))}
            </Select>
            {errors.annotatorIds && <FormHelperText>Vui lòng chọn ít nhất 1 annotator</FormHelperText>}
          </FormControl>

          {/* REVIEWERS */}
          <FormControl fullWidth size="small" error={!!errors.reviewerIds}>
            <InputLabel>Reviewers (Người duyệt)</InputLabel>
            <Select
              multiple={!isEdit}
              value={isEdit ? (reviewerIds.length > 0 ? reviewerIds[0] : '') : reviewerIds}
              onChange={(e) => {
                const val = e.target.value;
                if (isEdit) {
                  setReviewerIds(val === '' ? [] : [val as number]);
                } else {
                  setReviewerIds(typeof val === 'string' ? val.split(',').map(Number) : val as number[]);
                }
              }}
              input={<OutlinedInput label="Reviewers (Người duyệt)" />}
              renderValue={(selected) => {
                if (isEdit) {
                  const s = selected as number;
                  return reviewers.find((a) => a.id === s)?.username || s;
                }
                const selArr = selected as number[];
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selArr.map((value) => {
                      const reviewer = reviewers.find((a) => a.id === value);
                      return <Chip key={value} label={reviewer?.username || value} size="small" />;
                    })}
                  </Box>
                );
              }}
            >
               {isEdit && <MenuItem value="">— Không gán —</MenuItem>}
              {reviewers.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.username} ({u.email})
                </MenuItem>
              ))}
            </Select>
            {errors.reviewerIds && <FormHelperText>Vui lòng chọn ít nhất 1 reviewer</FormHelperText>}
          </FormControl>

          {/* ACTIONS */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/tasks')} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Cập nhật' : 'Tạo hàng loạt'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TaskFormPage;
