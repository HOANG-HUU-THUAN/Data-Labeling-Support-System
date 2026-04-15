import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getProjects } from '../api/projectApi';
import { getDatasetsByProject } from '../api/datasetApi';
import { createTask, getTaskById, updateTask } from '../api/taskApi';
import type { Project } from '../types/project';
import type { Dataset } from '../types/dataset';

// Annotators from mock (static list derived from authMock)
const ANNOTATORS = [
  { id: 3, name: 'Annotator' },
];

const TaskFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [datasetIds, setDatasetIds] = useState<number[]>([]);
  const [assigneeId, setAssigneeId] = useState<number | ''>('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({ name: false, projectId: false, datasetIds: false });

  // Load projects once
  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  // In edit mode: load existing task data and its datasets
  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    getTaskById(Number(id)).then((task) => {
      if (cancelled || !task) return;
      setName(task.name);
      setProjectId(task.projectId);
      setAssigneeId(task.assigneeId ?? '');
      // Load datasets for the project, then restore checked ids
      getDatasetsByProject(task.projectId).then((all) => {
        if (cancelled) return;
        setDatasets(all);
        setDatasetIds(task.datasetIds);
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
      setDatasetIds([]);
      return;
    }
    setLoadingDatasets(true);
    setDatasetIds([]);
    getDatasetsByProject(projectId)
      .then(setDatasets)
      .finally(() => setLoadingDatasets(false));
  }, [projectId, isEdit]);

  const toggleDataset = (id: number) => {
    setDatasetIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const e = {
      name: name.trim() === '',
      projectId: projectId === '',
      datasetIds: datasetIds.length === 0,
    };
    setErrors(e);
    return !e.name && !e.projectId && !e.datasetIds;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateTask(Number(id), {
          name: name.trim(),
          datasetIds,
          assigneeId: assigneeId === '' ? undefined : (assigneeId as number),
        });
      } else {
        await createTask({
          name: name.trim(),
          projectId: projectId as number,
          datasetIds,
          assigneeId: assigneeId === '' ? undefined : (assigneeId as number),
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
        {isEdit ? 'Chỉnh sửa task' : 'Tạo task'}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* NAME */}
          <TextField
            label="Tên task"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            helperText={errors.name ? 'Vui lòng nhập tên task' : ''}
            fullWidth
            size="small"
          />

          {/* PROJECT — disabled in edit mode */}
          <FormControl fullWidth size="small" error={errors.projectId} disabled={isEdit}>
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

          {/* DATASET MULTI-SELECT */}
          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Dataset
            </Typography>
            {loadingDatasets ? (
              <CircularProgress size={20} />
            ) : projectId === '' ? (
              <Typography variant="body2" color="text.secondary">
                Chọn project để xem dataset
              </Typography>
            ) : datasets.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Không có dataset nào trong project này
              </Typography>
            ) : (
              <FormGroup>
                {datasets.map((ds) => (
                  <FormControlLabel
                    key={ds.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={datasetIds.includes(ds.id)}
                        onChange={() => toggleDataset(ds.id)}
                      />
                    }
                    label={`#${ds.id} — ${ds.name}`}
                  />
                ))}
              </FormGroup>
            )}
            {errors.datasetIds && (
              <FormHelperText error>Vui lòng chọn ít nhất 1 dataset</FormHelperText>
            )}
          </Box>

          <Divider />

          {/* ASSIGNEE */}
          <FormControl fullWidth size="small">
            <InputLabel>Người được gán (tuỳ chọn)</InputLabel>
            <Select
              value={assigneeId}
              label="Người được gán (tuỳ chọn)"
              onChange={(e) => setAssigneeId(e.target.value as number | '')}
            >
              <MenuItem value="">— Không gán —</MenuItem>
              {ANNOTATORS.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ACTIONS */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/tasks')} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Cập nhật' : 'Tạo'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TaskFormPage;
