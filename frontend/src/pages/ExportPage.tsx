import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { getProjects } from '../mock/projectMock';
import { exportProject } from '../mock/exportMock';
import type { Project } from '../types/project';
import type { ExportFormat } from '../types/export';

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'yolo', label: 'YOLO' },
  { value: 'coco', label: 'COCO' },
];

const MIME: Record<ExportFormat, string> = {
  json: 'application/json',
  yolo: 'text/plain',
  coco: 'application/json',
};

const ExportPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | ''>('');
  const [format, setFormat] = useState<ExportFormat>('json');
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data);
      if (data.length > 0) setProjectId(data[0].id);
      setLoadingProjects(false);
    });
  }, []);

  const handleExport = async () => {
    if (projectId === '') return;
    setLoading(true);
    try {
      const content = await exportProject(projectId, format);
      const blob = new Blob([content], { type: MIME[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_project${projectId}.${format === 'yolo' ? 'txt' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight={700}>
        Xuất dữ liệu
      </Typography>

      <Card variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 480 }}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <FormControl fullWidth size="small" disabled={loadingProjects}>
            <InputLabel>Dự án</InputLabel>
            <Select
              label="Dự án"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value as number)}
            >
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Định dạng</InputLabel>
            <Select
              label="Định dạng"
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              {FORMAT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            startIcon={
              loading ? <CircularProgress size={18} color="inherit" /> : <FileDownloadOutlinedIcon />
            }
            disabled={loading || projectId === ''}
            onClick={handleExport}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? 'Đang xuất...' : 'Xuất dữ liệu'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default ExportPage;
