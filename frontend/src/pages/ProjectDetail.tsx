import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { getProjectById, deleteProject } from '../mock/projectMock';
import { getLabelsByProject, createLabel } from '../mock/labelMock';
import type { Project } from '../types/project';
import type { Label } from '../types/label';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add label modal state
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#1e88e5');
  const [savingLabel, setSavingLabel] = useState(false);

  const reloadLabels = () =>
    getLabelsByProject(Number(id)).then(setLabels);

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
      await createLabel({ name: labelName, color: labelColor, projectId: Number(id) });
      setLabelModalOpen(false);
      setLabelName('');
      setLabelColor('#1e88e5');
      await reloadLabels();
    } finally {
      setSavingLabel(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Typography color="error">Không tìm thấy dự án.</Typography>;
  }

  return (
    <Box maxWidth={600}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Chi tiết dự án
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/projects')}>
            Quay lại
          </Button>
          <Button variant="contained" onClick={() => navigate(`/projects/${id}/edit`)}>
            Chỉnh sửa
          </Button>
          <Button variant="outlined" color="error" onClick={() => setDialogOpen(true)}>
            Xóa dự án
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">ID</Typography>
        <Typography mb={2}>{project.id}</Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="text.secondary">Tên dự án</Typography>
        <Typography mb={2}>{project.name}</Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="text.secondary">Mô tả</Typography>
        <Typography>{project.description}</Typography>
      </Paper>

      {/* LABEL LIST */}
      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" color="text.secondary">
            Danh sách nhãn
          </Typography>
          <Button size="small" variant="outlined" onClick={() => setLabelModalOpen(true)}>
            + Thêm nhãn
          </Button>
        </Stack>
        {labels.length === 0 ? (
          <Typography color="text.secondary" variant="body2">Chưa có nhãn</Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {labels.map((label) => (
              <Chip
                key={label.id}
                label={label.name}
                sx={{ backgroundColor: label.color, color: '#fff', fontWeight: 500 }}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* ADD LABEL MODAL */}
      <Dialog open={labelModalOpen} onClose={() => setLabelModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm nhãn</DialogTitle>
        <Box component="form" onSubmit={handleCreateLabel}>
          <DialogContent>
            <TextField
              fullWidth
              label="Tên nhãn"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              required
              margin="normal"
              autoFocus
            />
            <Stack direction="row" alignItems="center" spacing={2} mt={1}>
              <Typography variant="body2">Màu:</Typography>
              <Box
                component="input"
                type="color"
                value={labelColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabelColor(e.target.value)}
                sx={{ width: 44, height: 36, border: 'none', cursor: 'pointer', borderRadius: 1 }}
              />
              <Chip label={labelName || 'Xem trước'} sx={{ backgroundColor: labelColor, color: '#fff', fontWeight: 500 }} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLabelModalOpen(false)} disabled={savingLabel}>
              Hủy
            </Button>
            <Button type="submit" variant="contained" disabled={savingLabel}>
              {savingLabel ? <CircularProgress size={20} color="inherit" /> : 'Tạo'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={dialogOpen}
        title="Xác nhận xóa"
        content={`Bạn có chắc muốn xóa dự án "${project.name}" không?`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDialogOpen(false)}
      />
    </Box>
  );
}