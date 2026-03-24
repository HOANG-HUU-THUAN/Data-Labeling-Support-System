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
} from '@mui/material';
import { getProjectById, updateProject } from '../mock/projectMock';

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProject(Number(id), { name, description });
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
          <TextField
            fullWidth
            label="Tên dự án"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
            margin="normal"
          />
          <Stack direction="row" spacing={2} mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={22} color="inherit" /> : 'Lưu'}
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
