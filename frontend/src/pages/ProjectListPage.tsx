import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  TablePagination,
  TableSortLabel,
} from '@mui/material';

import { getProjects, deleteProject } from '../api/projectApi';
import type { Project } from '../types/project';

export default function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter & Pagination States
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    const params = {
      page,
      size: pageSize,
      sortBy,
      sortDirection,
      name: searchName || undefined,
      type: filterType || undefined,
    };

    getProjects(params)
      .then((res) => {
        setProjects(res.data);
        setTotalElements(res.totalElements);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [page, pageSize, sortBy, sortDirection, searchName, filterType]);

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${project.name}" không?`)) return;

    setDeletingId(project.id);
    await deleteProject(project.id);
    setDeletingId(null);
    fetchProjects();
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Quản lý dự án
        </Typography>
        <Button variant="contained" onClick={() => navigate('/projects/create')}>
          + Tạo dự án
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          label="Tìm theo tên"
          variant="outlined"
          size="small"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            setPage(0);
          }}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Loại dự án</InputLabel>
          <Select
            value={filterType}
            label="Loại dự án"
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="IMAGE_CLASSIFICATION">Phân loại ảnh</MenuItem>
            <MenuItem value="OBJECT_DETECTION">Nhận diện đối tượng</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell width={80}>
                  <TableSortLabel
                    active={sortBy === 'id'}
                    direction={sortBy === 'id' ? sortDirection : 'asc'}
                    onClick={() => {
                      const isAsc = sortBy === 'id' && sortDirection === 'asc';
                      setSortDirection(isAsc ? 'desc' : 'asc');
                      setSortBy('id');
                    }}
                  >
                    <strong>ID</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell width={180}><strong>Tên dự án</strong></TableCell>
                <TableCell width={160}><strong>Loại</strong></TableCell>
                <TableCell><strong>Mô tả</strong></TableCell>
                <TableCell width={120} align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có dự án nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>

                    <TableCell>{p.name}</TableCell>

                    <TableCell>
                      <Chip
                        label={
                          p.type === 'IMAGE_CLASSIFICATION'
                            ? 'Phân loại ảnh'
                            : 'Nhận diện đối tượng'
                        }
                        size="small"
                        color="info"
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 300,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.description}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Xem">
                        <IconButton size="small" onClick={() => navigate(`/projects/${p.id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Sửa">
                        <IconButton size="small" onClick={() => navigate(`/projects/${p.id}/edit`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Xóa">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={deletingId === p.id}
                            onClick={() => handleDelete(p)}
                          >
                            {deletingId === p.id ? (
                              <CircularProgress size={16} color="error" />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Số dòng mỗi trang:"
      />
    </Box>
  );
}