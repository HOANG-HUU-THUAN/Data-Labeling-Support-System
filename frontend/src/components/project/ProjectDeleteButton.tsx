import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProjectStore } from '@/store/projectStore';

/**
 * Props của ProjectDeleteButton component
 */
interface ProjectDeleteButtonProps {
  /** ID của dự án cần xóa */
  projectId: number;

  /** Tên của dự án (để hiển thị trong dialog) */
  projectName: string;

  /** Callback khi xóa thành công (tuỳ chọn) */
  onSuccess?: () => void;

  /** CSS variant của button (tuỳ chọn) */
  variant?: 'text' | 'outlined' | 'contained';

  /** Kích cỡ button (tuỳ chọn) */
  size?: 'small' | 'medium' | 'large';

  /** Full width button hoặc không (tuỳ chọn) */
  fullWidth?: boolean;
}

/**
 * ProjectDeleteButton Component
 * Nút xóa dự án với dialog xác nhận
 * 
 * Chức năng:
 * - Hiển thị dialog xác nhận khi click
 * - Gọi API xóa dự án (soft delete)
 * - Navigate về trang danh sách dự án sau khi xóa
 * - Hiển thị loading state khi đang xóa
 * - Gọi callback onSuccess nếu có
 * 
 * Cách sử dụng:
 * <ProjectDeleteButton
 *   projectId={1}
 *   projectName="Project A"
 *   onSuccess={() => console.log('Xóa thành công')}
 * />
 */
const ProjectDeleteButton: React.FC<ProjectDeleteButtonProps> = ({
  projectId,
  projectName,
  onSuccess,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
}) => {
  const navigate = useNavigate();
  const { removeProject, loading, error, clearError } = useProjectStore();

  // State dialog
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  /**
   * Handler: Mở dialog xác nhận
   */
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  /**
   * Handler: Đóng dialog
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (error) {
      clearError();
    }
  };

  /**
   * Handler: Xác nhận xóa dự án
   * Gọi removeProject từ store, navigate về /projects nếu thành công
   */
  const handleConfirmDelete = async () => {
    try {
      // Gọi removeProject từ store
      await removeProject(projectId);

      // Đóng dialog
      setOpenDialog(false);

      // Gọi callback onSuccess nếu có
      if (onSuccess) {
        onSuccess();
      }

      // Navigate về trang danh sách dự án
      // Sử dụng setTimeout để đảm bảo state được cập nhật trước
      setTimeout(() => {
        navigate('/projects');
      }, 300);
    } catch (err) {
      // Lỗi sẽ được hiển thị từ store error state
      console.error('Lỗi khi xóa dự án:', err);
    }
  };

  /**
   * Handler: Hủy xóa
   */
  const handleCancelDelete = () => {
    setOpenDialog(false);
  };

  return (
    <>
      {/* Nút Xóa */}
      <Button
        variant={variant}
        color="error"
        size={size}
        fullWidth={fullWidth}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{
          textTransform: 'none',
          padding: size === 'small' ? '6px 8px' : size === 'large' ? '12px 24px' : '8px 16px',
        }}
      >
        {loading ? 'Đang xóa...' : 'Xóa'}
      </Button>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        {/* Tiêu đề dialog */}
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 'bold' }}>
          Xóa dự án?
        </DialogTitle>

        {/* Nội dung dialog */}
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa dự án <strong>"{projectName}"</strong> không?
          </DialogContentText>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <DialogContentText sx={{ color: 'error.main', mt: 2 }}>
              ❌ {error}
            </DialogContentText>
          )}

          {/* Cảnh báo về hành động */}
          <DialogContentText sx={{ fontSize: '0.875rem', color: 'warning.main', mt: 2 }}>
            ⚠️ Hành động này sẽ xóa mềm dự án. Dự án vẫn được lưu trữ nhưng không còn hiển thị.
          </DialogContentText>
        </DialogContent>

        {/* Nút hành động */}
        <DialogActions sx={{ p: 2 }}>
          {/* Nút Hủy */}
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            disabled={loading}
          >
            Hủy
          </Button>

          {/* Nút Xác nhận Xóa */}
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{
              position: 'relative',
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Đang xóa...
              </>
            ) : (
              'Xóa dự án'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectDeleteButton;
