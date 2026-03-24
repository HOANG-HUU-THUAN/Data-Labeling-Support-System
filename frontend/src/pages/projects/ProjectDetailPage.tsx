import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useProjectStore } from '../../store/projectStore';
import ProjectDeleteButton from '../../components/project/ProjectDeleteButton';
import { ProjectType } from '../../types/project';

/**
 * Interface định nghĩa props cho Tab Panel Component
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel Component
 * Hiển thị nội dung của tab khi được active
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Chuyển đổi enum ProjectType thành label tiếng Việt
 */
const getProjectTypeLabel = (type?: string): string => {
  switch (type) {
    case ProjectType.OBJECT_DETECTION:
      return 'Nhận diện đối tượng';
    case ProjectType.IMAGE_CLASSIFICATION:
      return 'Phân loại ảnh';
    case ProjectType.SEGMENTATION:
      return 'Phân đoạn ảnh';
    default:
      return 'Không xác định';
  }
};

/**
 * Format ngày tháng theo định dạng Việt
 */
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'Chưa cập nhật';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * ProjectDetailPage Component
 * Trang chi tiết dự án với các tab: Overview, Labels, Datasets, Tasks
 * 
 * Chức năng:
 * - Lấy projectId từ URL params
 * - Hiển thị thông tin dự án trong tab Overview
 * - Hỗ trợ 4 tab: Overview, Labels, Datasets, Tasks
 * - Có nút Edit và Delete
 * - Loading state và error handling
 * - Responsive design
 */
const ProjectDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const navigate = useNavigate();
  const { projects, loading, error, clearError, fetchProjects } = useProjectStore();

  // State tabs
  const [tabValue, setTabValue] = useState<number>(0);

  // Lấy dữ liệu dự án từ store
  const projectId = id ? parseInt(id, 10) : null;
  const project = projectId ? projects.find((p: any) => p.id === projectId) : null;

  /**
   * Effect: Fetch danh sách dự án khi component mount
   */
  useEffect(() => {
    if (!project && !loading) {
      fetchProjects();
    }
  }, []);

  /**
   * Handler: Thay đổi tab
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Handler: Click nút Edit
   * Navigate đến trang chỉnh sửa dự án
   */
  const handleEdit = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/edit`);
    }
  };

  /**
   * Handler: Callback khi xóa dự án thành công
   */
  const handleDeleteSuccess = () => {
    console.log('Dự án đã được xóa thành công');
    // Navigate sẽ được handled bởi ProjectDeleteButton
  };

  /**
   * Handler: Quay lại trang danh sách
   */
  const handleBackToList = () => {
    navigate('/projects');
  };

  // Loading state: Hiển thị spinner
  if (loading && !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state: Dự án không tìm thấy
  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error || 'Không tìm thấy dự án'}
        </Alert>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          Quay lại danh sách dự án
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        {/* Nút Quay lại */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Quay lại
        </Button>

        {/* Tiêu đề và thông tin cơ bản */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '28px', sm: '32px' },
              }}
            >
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ID: {project.id}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                textTransform: 'none',
                padding: '10px 16px',
              }}
            >
              Chỉnh sửa
            </Button>
            {projectId && (
              <ProjectDeleteButton
                projectId={projectId}
                projectName={project.name}
                onSuccess={handleDeleteSuccess}
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs Section */}
      <Paper sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        {/* Tabs Header */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="project tabs"
          sx={{
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
          }}
        >
          <Tab label="Tổng quan" id="project-tab-0" aria-controls="project-tabpanel-0" />
          <Tab label="Nhãn (Labels)" id="project-tab-1" aria-controls="project-tabpanel-1" />
          <Tab label="Bộ dữ liệu (Datasets)" id="project-tab-2" aria-controls="project-tabpanel-2" />
          <Tab label="Nhiệm vụ (Tasks)" id="project-tab-3" aria-controls="project-tabpanel-3" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* Tab 0: Overview */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Thông tin cơ bản */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', backgroundColor: '#f9f9f9' }} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin cơ bản
                    </Typography>

                    <Stack spacing={2}>
                      {/* Tên dự án */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          Tên dự án
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {project.name}
                        </Typography>
                      </Box>

                      {/* Loại dự án */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          Loại dự án
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={getProjectTypeLabel(project.type)}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>

                      {/* Trạng thái */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          Trạng thái
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={project.status || 'Đang hoạt động'}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Thông tin thêm */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', backgroundColor: '#f9f9f9' }} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin khác
                    </Typography>

                    <Stack spacing={2}>
                      {/* ID dự án */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          ID Dự án
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                          {project.id}
                        </Typography>
                      </Box>

                      {/* Ngày tạo */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          Ngày tạo
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {formatDate(project.createdDate)}
                        </Typography>
                      </Box>

                      {/* Số lượng items */}
                      {project.itemCount !== undefined && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Số lượng item
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {project.itemCount} item
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Mô tả dự án */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f9f9f9' }} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      Mô tả
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {project.description || 'Không có mô tả'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1: Labels */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Chức năng quản lý nhãn sẽ được phát triển
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sử dụng tab này để tạo, chỉnh sửa và xóa nhãn cho dự án
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab 2: Datasets */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Chức năng quản lý bộ dữ liệu sẽ được phát triển
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sử dụng tab này để tải lên, quản lý và xóa bộ dữ liệu
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab 3: Tasks */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Chức năng quản lý nhiệm vụ sẽ được phát triển
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sử dụng tab này để tạo, gán và theo dõi nhiệm vụ gán nhãn
              </Typography>
            </Box>
          </TabPanel>
        </Box>
      </Paper>


    </Container>
  );
};

export default ProjectDetailPage;
