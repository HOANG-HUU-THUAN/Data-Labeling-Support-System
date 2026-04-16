import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getProjectById, updateProject } from '../api/projectApi';
import type { Label } from '../types/project';

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'IMAGE_CLASSIFICATION' | 'OBJECT_DETECTION'>('IMAGE_CLASSIFICATION');
  const [guideline, setGuideline] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load dữ liệu hiện tại của project vào form
  useEffect(() => {
    getProjectById(Number(id))
      .then((project) => {
        if (!project) {
          setError('Không tìm thấy dự án.');
          return;
        }
        setName(project.name);
        setDescription(project.description);
        setType(project.type);
        setGuideline(project.guideline || '');
        setLabels(project.labels || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Lỗi khi tải dự án.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addLabel = () => {
    setLabels([...labels, { id: null as any, name: '', color: '#3f51b5' }]);
  };

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, field: keyof Label, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = { ...newLabels[index], [field]: value };
    setLabels(newLabels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProject(Number(id), { 
        name, 
        description, 
        type, 
        guideline, 
        labels: labels as any // API expects specific label request format
      });
      navigate('/projects');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Chỉnh sửa dự án
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Tên dự án"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Loại dự án"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                required
                margin="normal"
              >
                <MenuItem value="IMAGE_CLASSIFICATION">Phân loại ảnh</MenuItem>
                <MenuItem value="OBJECT_DETECTION">Nhận diện đối tượng</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Hướng dẫn (Guideline)"
            value={guideline}
            onChange={(e) => setGuideline(e.target.value)}
            multiline
            minRows={4}
            margin="normal"
          />

          <Box mt={3} mb={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                Danh sách nhãn (Labels)
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addLabel} size="small">
                Thêm nhãn
              </Button>
            </Stack>
            <Divider sx={{ my: 1 }} />
            
            <Stack spacing={2} mt={1}>
              {labels.map((label, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Tên nhãn"
                    value={label.name}
                    onChange={(e) => updateLabel(index, 'name', e.target.value)}
                    required
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    type="color"
                    label="Màu sắc"
                    value={label.color}
                    onChange={(e) => updateLabel(index, 'color', e.target.value)}
                    required
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <IconButton color="error" onClick={() => removeLabel(index)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} mt={5}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              size="large"
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Lưu thay đổi'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/projects/${id}`)}
              disabled={saving}
            >
              Hủy
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
