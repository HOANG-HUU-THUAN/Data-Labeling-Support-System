import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import { useProjectStore } from '../../store/projectStore';
import { ProjectType } from '../../types/project';

/**
 * ProjectCreatePage Component
 * Form tạo dự án mới cho hệ thống Data Labeling
 * 
 * Chức năng:
 * - Nhập tên dự án (required)
 * - Nhập mô tả dự án (textarea)
 * - Chọn loại dự án (select)
 * - Validation cơ bản trước khi submit
 * - Gọi API tạo dự án thông qua store
 * - Hiển thị thông báo thành công/lỗi
 * - Navigate về trang danh sách dự án sau khi tạo thành công
 */
const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addProject, loading, error, clearError } = useProjectStore();

  // State form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: ProjectType.OBJECT_DETECTION,
  });

  // State thông báo
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    try {
      // Gọi API tạo dự án
      await addProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
      });

      // Hiển thị thông báo thành công
      setSuccessMessage(`Dự án "${formData.name}" đã được tạo thành công!`);

      // Navigate về trang danh sách dự án sau 1.5 giây
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi tạo dự án';
      setLocalError(errorMessage);
    }
  };

  /**
   * Xử lý click nút Hủy
   */
  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '28px', sm: '32px' },
            mb: 1,
          }}
        >
          Tạo Dự án Mới
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Điền thông tin để tạo một dự án mới cho hệ thống gán nhãn dữ liệu
        </Typography>
      </Box>

      {/* Card chứa form */}
      <Card
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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

              {/* Nút Tạo Dự án */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={loading}
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
                {loading ? 'Đang tạo...' : 'Tạo Dự án'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Info section */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Thông tin các loại dự án:
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>Nhận diện đối tượng:</strong> Đánh dấu vị trí các đối tượng trong ảnh
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>Phân loại ảnh:</strong> Gán nhãn cho toàn bộ ảnh vào các danh mục
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>Phân đoạn ảnh:</strong> Tách biệt các phần khác nhau trong ảnh
            </Typography>
          </li>
        </ul>
      </Box>
    </Container>
  );
};

export default ProjectCreatePage;
