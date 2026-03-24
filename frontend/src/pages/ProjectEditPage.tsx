import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useProjectStore } from '@/store/projectStore';
import ProjectDeleteButton from '@/components/project/ProjectDeleteButton';
import { ProjectType } from '@/types/project';

/**
 * ProjectEditPage Component
 * Form chỉnh sửa thông tin dự án
 * 
 * Chức năng:
 * - Lấy projectId từ URL params
 * - Load dữ liệu dự án hiện tại
 * - Form có các trường: name, description, type
 * - Validation cơ bản
 * - Gọi API cập nhật dự án
 * - Navigate về trang chi tiết sau khi cập nhật
 * - Hỗ trợ xóa dự án thông qua ProjectDeleteButton
 */
const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, loading, error, clearError, fetchProjects, updateProjectData } = useProjectStore();

  // State form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: ProjectType.OBJECT_DETECTION,
  });

  // State thông báo
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Lấy dữ liệu dự án từ store
  const projectId = id ? parseInt(id, 10) : null;
  const project = projectId ? projects.find((p: any) => p.id === projectId) : null;

  /**
   * Effect: Load dữ liệu dự án khi component mount
   */
  useEffect(() => {
    if (!project && !loading) {
      fetchProjects();
    }
  }, []);

  /**
   * Effect: Đưa dữ liệu dự án vào form khi dự án được tải
   */
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        type: project.type || ProjectType.OBJECT_DETECTION,
      });
    }
  }, [project]);

  /**
   * Xử lý thay đổi giá trị input
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (localError) {
      setLocalError(null);
    }
  };

  /**
   * Xử lý thay đổi giá trị Select
   */
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Validation cơ bản
   * @returns true nếu form hợp lệ, false nếu có lỗi
   */
  const validateForm = (): boolean => {
    // Kiểm tra tên dự án không được để trống
    if (!formData.name.trim()) {
      setLocalError('Tên dự án không được để trống');
      return false;
    }

    // Kiểm tra tên dự án tối thiểu 3 ký tự
    if (formData.name.trim().length < 3) {
      setLocalError('Tên dự án phải có ít nhất 3 ký tự');
      return false;
    }

    // Kiểm tra tên dự án tối đa 100 ký tự
    if (formData.name.length > 100) {
      setLocalError('Tên dự án không được vượt quá 100 ký tự');
      return false;
    }

    // Kiểm tra mô tả tối đa 500 ký tự
    if (formData.description.length > 500) {
      setLocalError('Mô tả không được vượt quá 500 ký tự');
      return false;
    }

    return true;
  };

  /**
   * Xử lý submit form
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    // Validation
    if (!validateForm()) {
      return;
    }

    if (!projectId) {
      setLocalError('Không tìm thấy ID dự án');
      return;
    }

    setIsSubmitting(true);

    try {
      // Gọi API cập nhật dự án
      await updateProjectData(projectId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
      });

      // Hiển thị thông báo thành công
      setSuccessMessage('Dự án đã được cập nhật thành công!');

      // Navigate về trang chi tiết dự án sau 1.5 giây
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi cập nhật dự án';
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Xử lý click nút Hủy
   */
  const handleCancel = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  /**
   * Xử lý callback khi xóa dự án thành công
   */
  const handleDeleteSuccess = () => {
    console.log('Dự án đã được xóa thành công');
  };

  // Loading state: Hiển thị spinner khi đang load dữ liệu
  if (loading && !project) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state: Dự án không tìm thấy
  if (!project || !projectId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error || 'Không tìm thấy dự án'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
        >
          Quay lại danh sách dự án
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Quay lại
        </Button>

        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '28px', sm: '32px' },
            mb: 1,
          }}
        >
          Chỉnh sửa Dự án
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cập nhật thông tin dự án: {project.name}
        </Typography>
      </Box>

      {/* Card chứa form */}
      <Card
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Thông báo lỗi từ store */}
          {error && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Thông báo lỗi validation cục bộ */}
          {localError && (
            <Alert
              severity="error"
              onClose={() => setLocalError(null)}
              sx={{ mb: 3 }}
            >
              {localError}
            </Alert>
          )}

          {/* Thông báo thành công */}
          {successMessage && (
            <Alert
              severity="success"
              onClose={() => setSuccessMessage(null)}
              sx={{ mb: 3 }}
            >
              {successMessage}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Tên dự án */}
            <TextField
              fullWidth
              label="Tên dự án"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên dự án..."
              required
              disabled={isSubmitting}
              variant="outlined"
              margin="normal"
              helperText={`${formData.name.length}/100 ký tự`}
              inputProps={{
                maxLength: 100,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {/* Loại dự án */}
            <FormControl
              fullWidth
              margin="normal"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              <InputLabel id="project-type-label">Loại dự án</InputLabel>
              <Select
                labelId="project-type-label"
                id="project-type"
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                label="Loại dự án"
              >
                <MenuItem value={ProjectType.OBJECT_DETECTION}>
                  Nhận diện đối tượng (Object Detection)
                </MenuItem>
                <MenuItem value={ProjectType.IMAGE_CLASSIFICATION}>
                  Phân loại ảnh (Image Classification)
                </MenuItem>
                <MenuItem value={ProjectType.SEGMENTATION}>
                  Phân đoạn ảnh (Segmentation)
                </MenuItem>
              </Select>
            </FormControl>

            {/* Mô tả */}
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết về dự án (không bắt buộc)..."
              disabled={isSubmitting}
              multiline
              minRows={4}
              maxRows={8}
              variant="outlined"
              margin="normal"
              helperText={`${formData.description.length}/500 ký tự`}
              inputProps={{
                maxLength: 500,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {/* Nút Action */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 4, justifyContent: 'flex-end' }}
            >
              {/* Nút Hủy */}
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isSubmitting}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  padding: '10px 24px',
                  borderColor: '#ddd',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Hủy
              </Button>

              {/* Nút Lưu Thay đổi */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={isSubmitting}
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
                {isSubmitting ? 'Đang lưu...' : 'Lưu Thay đổi'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Section Nguy hiểm - Xóa dự án */}
      <Card
        sx={{
          boxShadow: 1,
          borderRadius: 2,
          border: '1px solid #ffebee',
          backgroundColor: '#fff5f5',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main', mb: 2 }}>
            🔴 Vùng Nguy Hiểm
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Xóa dự án này sẽ xóa mềm (soft delete) tất cả dữ liệu liên quan. Hành động này không thể hoàn tác ngay lập tức.
          </Typography>

          {/* Nút Xóa */}
          {projectId && (
            <ProjectDeleteButton
              projectId={projectId}
              projectName={project.name}
              onSuccess={handleDeleteSuccess}
              variant="outlined"
              fullWidth
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProjectEditPage;
