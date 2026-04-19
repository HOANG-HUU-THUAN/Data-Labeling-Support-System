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
  Fade,
  alpha,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createProject } from '../api/projectApi';
import type { Label } from '../types/project';

export default function ProjectCreate() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'IMAGE_CLASSIFICATION' | 'OBJECT_DETECTION'>('IMAGE_CLASSIFICATION');
  const [guideline, setGuideline] = useState('');
  const [labels, setLabels] = useState<Omit<Label, 'id'>[]>([]);
  const [saving, setSaving] = useState(false);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };

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
        labels: labels as any 
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
    <Fade in timeout={800}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <IconButton onClick={() => navigate('/projects')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Tạo dự án mới
          </Typography>
        </Stack>

        <Paper sx={{ ...glassStyle, p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 60%' } }}>
                  <TextField
                    fullWidth
                    label="Tên dự án"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
                  <TextField
                    select
                    fullWidth
                    label="Loại hình"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="IMAGE_CLASSIFICATION">Phân loại ảnh</MenuItem>
                    <MenuItem value="OBJECT_DETECTION">Nhận diện đối tượng</MenuItem>
                  </TextField>
                </Box>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Mô tả dự án"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  minRows={2}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Hướng dẫn chi tiết (Guideline - Hỗ trợ Markdown)"
                  value={guideline}
                  onChange={(e) => setGuideline(e.target.value)}
                  multiline
                  minRows={4}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box>
                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                      Danh sách nhãn hội thoại (Labels)
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />} 
                      onClick={addLabel} 
                      size="small"
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Thêm nhãn
                    </Button>
                  </Stack>
                  
                  {labels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Chưa có nhãn nào được định nghĩa.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {labels.map((label, index) => (
                        <Fade in key={index}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                              fullWidth
                              label={`Tên nhãn #${index + 1}`}
                              value={label.name}
                              onChange={(e) => updateLabel(index, 'name', e.target.value)}
                              required
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                              <Typography variant="caption" color="text.secondary">Màu:</Typography>
                              <Box
                                component="input"
                                type="color"
                                value={label.color}
                                onChange={(e: any) => updateLabel(index, 'color', e.target.value)}
                                sx={{ width: 40, height: 40, border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer', p: 0 }}
                              />
                            </Box>
                            <IconButton color="error" onClick={() => removeLabel(index)} size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#fff0f0' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Fade>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>

              <Box>
                <Stack direction="row" spacing={2} mt={2}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={saving} 
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ borderRadius: 3, px: 6, textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Tạo dự án ngay
                  </Button>
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/projects')} 
                    disabled={saving} 
                    size="large"
                    sx={{ borderRadius: 3, textTransform: 'none', color: 'text.secondary' }}
                  >
                    Hủy bỏ
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}