import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Paper, Stack, TextField, Typography, Fade, alpha, useTheme,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { getProjectById, deleteProject } from '../api/projectApi';
import { getLabelsByProject, createLabel, updateLabel, deleteLabel } from '../api/labelApi';
import type { Project } from '../types/project';
import type { Label } from '../types/label';
import ConfirmDialog from '../components/ConfirmDialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [project, setProject] = useState<Project | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#1e88e5');
  const [savingLabel, setSavingLabel] = useState(false);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };

  const openCreateModal = () => {
    setEditingLabel(null);
    setLabelName('');
    setLabelColor('#1e88e5');
    setLabelModalOpen(true);
  };

  const openEditModal = (label: Label) => {
    setEditingLabel(label);
    setLabelName(label.name);
    setLabelColor(label.color);
    setLabelModalOpen(true);
  };

  const reloadLabels = () => getLabelsByProject(Number(id)).then(setLabels);

  useEffect(() => {
    const projectId = Number(id);
    Promise.all([
      getProjectById(projectId),
      getLabelsByProject(projectId),
    ]).then(([projectData, labelData]) => {
      setProject(projectData ?? null);
      setLabels(labelData);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteProject(Number(id));
      navigate('/projects');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLabel(true);
    try {
      if (editingLabel) {
        await updateLabel(editingLabel.id, { name: labelName, color: labelColor });
      } else {
        await createLabel({ name: labelName, color: labelColor, projectId: Number(id) });
      }
      setLabelModalOpen(false);
      await reloadLabels();
    } finally {
      setSavingLabel(false);
    }
  };

  const handleDeleteLabel = async (label: Label) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhãn "${label.name}" không?`)) return;
    await deleteLabel(label.id);
    await reloadLabels();
  };

  if (loading) {
    return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  }

  if (!project) {
    return <Box sx={{ p: 4 }}><Typography color="error">Không tìm thấy dự án.</Typography></Box>;
  }

  return (
    <Fade in timeout={800}>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => navigate('/projects')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                Chi tiết dự án
              </Typography>
              <Typography variant="body2" color="text.secondary">ID: #{project.id}</Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => navigate(`/projects/${id}/edit`)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              Chỉnh sửa
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Xóa dự án
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 60%' } }}>
            <Paper sx={{ ...glassStyle, p: 4, height: '100%', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">Tên dự án</Typography>
                  <Typography variant="h5" fontWeight="bold">{project.name}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">Loại hình</Typography>
                  <Box mt={0.5}>
                    <Chip 
                      label={project.type === 'IMAGE_CLASSIFICATION' ? 'Phân loại ảnh' : 'Nhận diện đối tượng'} 
                      color="primary" 
                      variant="outlined" 
                      sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">Mô tả</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{project.description || 'Không có mô tả.'}</Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight="bold">Hướng dẫn (Guideline)</Typography>
                  <Box sx={{ 
                    mt: 1.5, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), 
                    borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    '& p': { my: 1 }, '& ul, & ol': { pl: 3 }, '& h1, & h2, & h3': { mt: 2, mb: 1 },
                    '& code': { bgcolor: alpha(theme.palette.primary.main, 0.08), p: '2px 4px', borderRadius: '4px' }
                  }}>
                    {project.guideline ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.guideline}</ReactMarkdown>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">Chưa có hướng dẫn cho dự án này.</Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 35%' } }}>
            <Paper sx={{ ...glassStyle, p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">Danh sách nhãn</Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={openCreateModal}
                  sx={{ borderRadius: 1.5, textTransform: 'none' }}
                >
                  Thêm mới
                </Button>
              </Stack>

              {labels.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', bgcolor: alpha(theme.palette.common.black, 0.02), borderRadius: 2 }}>
                  <Typography color="text.secondary" variant="body2">Chưa có nhãn nào.</Typography>
                </Box>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  {labels.map((label) => (
                    <Chip
                      key={label.id}
                      label={label.name}
                      onClick={() => openEditModal(label)}
                      onDelete={() => handleDeleteLabel(label)}
                      sx={{ 
                        backgroundColor: label.color, color: '#fff', 
                        fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: `0 2px 8px ${alpha(label.color, 0.3)}`,
                        '&:hover': { opacity: 0.9, transform: 'scale(1.05)' },
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Box>

        <Dialog open={labelModalOpen} onClose={() => setLabelModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>{editingLabel ? 'Cập nhật nhãn' : 'Tạo nhãn mới'}</DialogTitle>
          <Box component="form" onSubmit={handleCreateLabel}>
            <DialogContent>
              <TextField
                fullWidth label="Tên nhãn"
                value={labelName} onChange={(e) => setLabelName(e.target.value)}
                required margin="normal" autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Stack direction="row" alignItems="center" spacing={3} mt={2}>
                <Typography variant="body2" fontWeight="bold">Màu sắc:</Typography>
                <Box
                  component="input" type="color"
                  value={labelColor} onChange={(e: any) => setLabelColor(e.target.value)}
                  sx={{ width: 50, height: 40, border: '1px solid #ddd', cursor: 'pointer', borderRadius: 1, p: 0 }}
                />
                <Chip label={labelName || 'Mẫu'} sx={{ backgroundColor: labelColor, color: '#fff', fontWeight: 'bold' }} />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setLabelModalOpen(false)} sx={{ color: 'text.secondary' }}>Hủy</Button>
              <Button type="submit" variant="contained" disabled={savingLabel} sx={{ borderRadius: 2, px: 3 }}>
                {savingLabel ? <CircularProgress size={20} color="inherit" /> : editingLabel ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <ConfirmDialog
          open={dialogOpen}
          title="Xác nhận xóa dự án"
          content={`Bạn có chắc muốn xóa dự án "${project.name}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa vĩnh viễn"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDialogOpen(false)}
        />
      </Box>
    </Fade>
  );
}