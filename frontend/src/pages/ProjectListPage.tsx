import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getProjects, deleteProject } from '../mock/projectMock';
import type { Project } from '../types/project';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      fetchProjects();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Quản lý dự án
        </Typography>
        <Button variant="contained" onClick={() => navigate('/projects/create')}>
          + Tạo dự án
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell width={60}><strong>ID</strong></TableCell>
                <TableCell><strong>Tên dự án</strong></TableCell>
                <TableCell><strong>Mô tả</strong></TableCell>
                <TableCell width={200} align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button size="small" variant="outlined" onClick={() => navigate(`/projects/${p.id}`)}>
                        Xem
                      </Button>
                      <Button size="small" variant="outlined" color="warning" onClick={() => navigate(`/projects/${p.id}/edit`)}>
                        Sửa
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => setDeleteTarget(p)}>
                        Xóa
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Không có dự án nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xác nhận xóa"
        content={`Bạn có chắc muốn xóa dự án "${deleteTarget?.name}" không?`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}