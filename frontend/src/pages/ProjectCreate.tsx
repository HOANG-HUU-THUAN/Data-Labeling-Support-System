import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
import { createProject } from '../api/projectApi';
import type { Label } from '../types/project';

export default function ProjectCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'IMAGE_CLASSIFICATION' | 'OBJECT_DETECTION'>('IMAGE_CLASSIFICATION');
  const [guideline, setGuideline] = useState('');
  const [labels, setLabels] = useState<Omit<Label, 'id'>[]>([]);
  const [saving, setSaving] = useState(false);

  const addLabel = () => {
    setLabels([...labels, { name: '', color: '#3f51b5' }]);
  };

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, field: keyof Omit<Label, 'id'>, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = { ...newLabels[index], [field]: value };
    setLabels(newLabels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (labels.length === 0) {
      alert('Vui lòng thêm ít nhất một nhãn');
      return;
    }
    setSaving(true);
    try {
      await createProject({ 
        name, 
        description, 
        type, 
        guideline, 
        labels: labels as any // API expects labels without id for create
      });
      navigate('/projects');
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tạo dự án');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Tạo dự án
      </Typography>

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
            
            {labels.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Chưa có nhãn nào. Vui lòng thêm ít nhất một nhãn.
              </Typography>
            )}

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
            <Button type="submit" variant="contained" disabled={saving} size="large">
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Tạo dự án'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/projects')} disabled={saving} size="large">
              Hủy
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}