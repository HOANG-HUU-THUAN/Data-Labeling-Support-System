import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { getProjectById } from '../mock/projectMock';
import type { Project } from '../types/project';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectById(Number(id))
      .then((data) => setProject(data ?? null))
      .finally(() => setLoading(false));
  }, [id]);

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
    </Box>
  );
}