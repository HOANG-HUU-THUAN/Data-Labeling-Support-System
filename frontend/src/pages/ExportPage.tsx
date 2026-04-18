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
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getProjects } from '../api/projectApi';
import { exportProjectData } from '../api/exportApi';
import { ExportFormat } from '../types/export';
import type { Project } from '../types/project';

const ExportPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.YOLO);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setLoadingProjects(true);
    getProjects({ size: 100 })
      .then((res) => {
        setProjects(res.data);
      })
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
      setMessage({ type: 'error', text: 'Xuất dữ liệu thất bại. Vui lòng kiểm tra xem dự án có dữ liệu đã APPROVE hay chưa.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Xuất dữ liệu (Export)
      </Typography>

      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              1. Chọn dự án
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Chọn dự án bạn muốn xuất dữ liệu. Lưu ý: Chỉ các task đã trạng thái <strong>APPROVED</strong> mới được xuất.
            </Typography>
            <FormControl fullWidth size="medium">
              <InputLabel>Dự án</InputLabel>
              <Select
                value={selectedProjectId}
                label="Dự án"
                onChange={(e) => setSelectedProjectId(e.target.value as number)}
                disabled={loadingProjects || exporting}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              2. Chọn định dạng
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Hỗ trợ các định dạng phổ biến cho Machine Learning.
            </Typography>
            <FormControl fullWidth size="medium">
              <InputLabel>Định dạng</InputLabel>
              <Select
                value={format}
                label="Định dạng"
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
                disabled={exporting}
              >
                <MenuItem value={ExportFormat.YOLO}>YOLO (.txt + classes.txt)</MenuItem>
                <MenuItem value={ExportFormat.COCO}>COCO JSON (Single .json file)</MenuItem>
                <MenuItem value={ExportFormat.PASCAL_VOC}>PASCAL VOC XML (Multiple .xml files)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider />

          <Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={exporting ? <CircularProgress size={24} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleExport}
              disabled={selectedProjectId === '' || exporting}
              sx={{ height: 56 }}
            >
              {exporting ? 'Đang xử lý...' : 'Xuất dữ liệu và Tải về (.zip)'}
            </Button>
          </Box>

          {message && (
            <Alert severity={message.type} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}
        </Stack>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Hướng dẫn
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul>
            <li><strong>YOLO:</strong> Mỗi ảnh sẽ có một file .txt tương ứng chứa label và tọa độ normalized.</li>
            <li><strong>COCO:</strong> Toàn bộ annotation được gộp chung vào một file JSON duy nhất theo chuẩn COCO.</li>
            <li><strong>PASCAL VOC:</strong> Mỗi ảnh có một file XML chứa thông tin về label và tọa độ bounding box.</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default ExportPage;
