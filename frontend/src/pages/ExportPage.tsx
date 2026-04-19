import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Fade,
  alpha,
  useTheme,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { getProjects } from '../api/projectApi';
import { exportProjectData } from '../api/exportApi';
import { ExportFormat } from '../types/export';
import type { Project } from '../types/project';

const ExportPage = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.YOLO);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };

  useEffect(() => {
    setLoadingProjects(true);
    getProjects({ size: 100 })
      .then((res) => setProjects(res.data))
      .catch((err) => {
        console.error('Failed to load projects:', err);
        setMessage({ type: 'error', text: 'Không thể tải danh sách dự án.' });
      })
      .finally(() => setLoadingProjects(false));
  }, []);

  const handleExport = async () => {
    if (selectedProjectId === '') return;

    setExporting(true);
    setMessage(null);

    const project = projects.find(p => p.id === selectedProjectId);
    const projectName = project?.name || 'project';

    try {
      const blob = await exportProjectData(selectedProjectId, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${projectName.replace(/\s+/g, '_')}_${format.toLowerCase()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Xuất dữ liệu thành công!' });
    } catch (err) {
      console.error('Export failed:', err);
      setMessage({ type: 'error', text: 'Xuất dữ liệu thất bại. Chỉ các task APPROVED mới được xuất.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Fade in timeout={800}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main" mb={1}>
            Xuất dữ liệu hệ thống
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Tải về bộ dữ liệu đã gán nhãn theo các định dạng chuẩn Machine Learning.
          </Typography>

          <Paper sx={{ ...glassStyle, p: 4 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                  <AssignmentIcon color="primary" /> Chọn dự án
                </Typography>
                {/* <Typography variant="body2" color="text.secondary" mb={3}>
                  Dữ liệu được trích xuất bao gồm các label từ những task đã được <strong>PHÊ DUYỆT (APPROVED)</strong>.
                </Typography> */}
                <FormControl fullWidth>
                  <InputLabel>Danh sách dự án</InputLabel>
                  <Select
                    value={selectedProjectId}
                    label="Danh sách dự án"
                    onChange={(e) => setSelectedProjectId(e.target.value as number)}
                    disabled={loadingProjects || exporting}
                    sx={{ borderRadius: 2 }}
                  >
                    {projects.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                  <SaveAltIcon color="primary" /> Định dạng đầu ra
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Định dạng dữ liệu</InputLabel>
                  <Select
                    value={format}
                    label="Định dạng dữ liệu"
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    disabled={exporting}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={ExportFormat.YOLO}>YOLO (.txt + classes.txt)</MenuItem>
                    <MenuItem value={ExportFormat.COCO}>COCO JSON (Tất cả trong 1 file)</MenuItem>
                    <MenuItem value={ExportFormat.PASCAL_VOC}>PASCAL VOC XML (Nhiều file XML)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={exporting ? <CircularProgress size={24} color="inherit" /> : <FileDownloadIcon />}
                  onClick={handleExport}
                  disabled={selectedProjectId === '' || exporting}
                  sx={{
                    height: 56,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.35)'
                  }}
                >
                  {exporting ? 'Đang đóng gói dữ liệu...' : 'Xác nhận Xuất (.zip)'}
                </Button>
              </Box>

              {message && (
                <Fade in>
                  <Alert severity={message.type} sx={{ borderRadius: 2 }}>
                    {message.text}
                  </Alert>
                </Fade>
              )}
            </Stack>
          </Paper>

          {/* <Paper sx={{ ...glassStyle, mt: 4, p: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <Typography variant="subtitle2" fontWeight="bold" color="info.main" gutterBottom>
              💡 Tài liệu định dạng:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                • <strong>YOLO:</strong> Tối ưu cho đào tạo YOLOv5/v8, coordinates normalized 0-1.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>COCO:</strong> Định dạng chuẩn cho bài toán Detection/Segmentation phức tạp.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>PASCAL VOC:</strong> Định dạng XML kinh điển, tương thích nhiều framework.
              </Typography>
            </Stack>
          </Paper> */}
        </Box>
      </Fade>
    </Box>
  );
};

export default ExportPage;
