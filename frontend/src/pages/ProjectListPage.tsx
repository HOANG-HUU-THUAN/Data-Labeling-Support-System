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
  Stack,
  Fade,
  Grow,
  alpha,
  useTheme,
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
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';

import { getProjects, deleteProject } from '../api/projectApi';
import type { Project } from '../types/project';

export default function ProjectList() {
  const navigate = useNavigate();
  const theme = useTheme();

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

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  };

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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            sx={{ 
              color: 'primary.main',
              mb: 0.5
            }}
          >
            Danh sách Dự án
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi các dự án gán nhãn dữ liệu của bạn
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/create')}
          sx={{ 
            borderRadius: 3, 
            px: 3, 
            py: 1,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
          }}
        >
          Tạo dự án mới
        </Button>
      </Stack>

      {/* Search & Filter Bar */}
      <Grow in>
        <Paper sx={{ ...glassStyle, p: 2.5, mb: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
          <TextField
            placeholder="Tìm theo tên dự án..."
            variant="outlined"
            size="small"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setPage(0);
            }}
            sx={{ 
              width: 350,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ width: 220 }}>
            <InputLabel id="filter-type-label">Loại dự án</InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              label="Loại dự án"
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: 2, bgcolor: 'white' }}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              <MenuItem value="IMAGE_CLASSIFICATION">Phân loại ảnh</MenuItem>
              <MenuItem value="OBJECT_DETECTION">Nhận diện đối tượng</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Grow>

      {/* Loading */}
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={10} gap={2}>
          <CircularProgress thickness={4} size={50} />
          <Typography color="text.secondary">Đang tải dữ liệu dự án...</Typography>
        </Box>
      ) : (
        <Fade in>
          <TableContainer component={Paper} sx={{ ...glassStyle, overflow: 'hidden', border: 'none' }}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell width={80}>
                    <TableSortLabel
                      active={sortBy === 'id'}
                      direction={sortBy === 'id' ? sortDirection : 'asc'}
                      onClick={() => {
                        const isAsc = sortBy === 'id' && sortDirection === 'asc';
                        setSortDirection(isAsc ? 'desc' : 'asc');
                        setSortBy('id');
                      }}
                      sx={{ fontWeight: 'bold' }}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width={220} sx={{ fontWeight: 'bold' }}>Tên dự án</TableCell>
                  <TableCell width={180} sx={{ fontWeight: 'bold' }}>Loại hình</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mô tả chi tiết</TableCell>
                  <TableCell width={150} align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <SearchIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body1">
                          Không tìm thấy dự án nào phù hợp
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((p) => (
                    <TableRow 
                      key={p.id} 
                      hover 
                      sx={{ 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ fontWeight: '600', color: 'text.secondary' }}>#{p.id}</TableCell>

                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {p.name}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            p.type === 'IMAGE_CLASSIFICATION'
                              ? 'Phân loại ảnh'
                              : 'Nhận diện đối tượng'
                          }
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            borderRadius: 1.5,
                            bgcolor: p.type === 'IMAGE_CLASSIFICATION' ? alpha('#0288d1', 0.1) : alpha('#2e7d32', 0.1),
                            color: p.type === 'IMAGE_CLASSIFICATION' ? '#0288d1' : '#2e7d32',
                            border: '1px solid',
                            borderColor: 'inherit'
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          maxWidth: 350,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: 'text.secondary'
                        }}
                      >
                        {p.description || '(Không có mô tả)'}
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Xem chi tiết">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => navigate(`/projects/${p.id}`)}
                              sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Chỉnh sửa">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => navigate(`/projects/${p.id}/edit`)}
                              sx={{ '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Xóa dự án">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={deletingId === p.id}
                                onClick={() => handleDelete(p)}
                                sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                              >
                                {deletingId === p.id ? (
                                  <CircularProgress size={16} color="error" />
                                ) : (
                                  <DeleteIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
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
              sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
            />
          </TableContainer>
        </Fade>
      )}
    </Box>
  );
}