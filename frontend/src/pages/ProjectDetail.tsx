import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { getProjectById, deleteProject } from '../mock/projectMock';
import { getLabelsByProject } from '../mock/labelMock';
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
        <Typography variant="overline" color="text.secondary" display="block" mb={1}>
          Danh sách nhãn
        </Typography>
        {labels.length === 0 ? (
          <Typography color="text.secondary" variant="body2">Chưa có nhãn</Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {labels.map((label) => (
              <Chip
                key={label.id}
                label={label.name}
                sx={{
                  backgroundColor: label.color,
                  color: '#fff',
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        )}
      </Paper>

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