import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProjectCard from '@/components/project/ProjectCard';
import { useProjectStore } from '@/store/projectStore';

/**
 * ProjectsPage Component
 * Trang hiển thị danh sách các dự án trong hệ thống
 * - Hiển thị grid responsive các ProjectCard
 * - Hỗ trợ tạo dự án mới
 * - Tải dữ liệu từ Zustand store
 */
const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ Zustand store
  const { projects, loading, fetchProjects } = useProjectStore();

  /**
   * Effect: Fetch danh sách dự án khi component mount
   */
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /**
   * Handler: Xử lý click nút "Tạo Dự án Mới"
   * Navigate đến trang tạo dự án
   */
  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header: Tiêu đề và nút Tạo Dự án Mới */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '28px', sm: '32px', md: '36px' },
          }}
        >
          Danh sách Dự án
        </Typography>

        {/* Nút Tạo Dự án Mới */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            padding: '10px 24px',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          Tạo Dự án Mới
        </Button>
      </Box>

      {/* Content Section */}
      {loading ? (
        // Loading State: Hiển thị spinner khi đang tải dữ liệu
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={50} />
            <Typography variant="body1" color="textSecondary">
              Đang tải dữ liệu dự án...
            </Typography>
          </Stack>
        </Box>
      ) : projects.length === 0 ? (
        // Empty State: Hiển thị khi không có dự án nào
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            color="textSecondary"
            sx={{
              textAlign: 'center',
              fontSize: { xs: '16px', sm: '18px' },
            }}
          >
            Chưa có dự án nào. Hãy tạo dự án đầu tiên của bạn!
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
            size="large"
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Tạo Dự án Đầu Tiên
          </Button>
        </Box>
      ) : (
        // Grid: Hiển thị danh sách dự án
        // Responsive: xs=12 (1 cột), sm=6 (2 cột), md=4 (3 cột), lg=3 (4 cột)
        <Grid
          container
          spacing={3}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr', // 1 cột trên mobile
              sm: 'repeat(2, 1fr)', // 2 cột trên tablet
              md: 'repeat(3, 1fr)', // 3 cột trên desktop
              lg: 'repeat(4, 1fr)', // 4 cột trên desktop lớn
            },
            gap: 3,
          }}
        >
          {projects.map((project) => (
            <Box key={project.id}>
              <ProjectCard project={project} />
            </Box>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProjectsPage;
