import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { getProjects } from '../mock/projectMock';
import { getDatasetsByProject, uploadDataset } from '../mock/datasetMock';
import type { Project } from '../types/project';
import type { Dataset } from '../types/dataset';

const DatasetsPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Load project list once
  useEffect(() => {
    getProjects().then((list) => {
      setProjects(list);
      if (list.length > 0) setSelectedProjectId(list[0].id);
    });
  }, []);

  // Reload dataset list when project changes
  useEffect(() => {
    if (selectedProjectId === '') return;
    getDatasetsByProject(selectedProjectId).then(setDatasets);
  }, [selectedProjectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPreviewFiles(files);
  };

  const handleUpload = async () => {
    if (selectedProjectId === '' || previewFiles.length === 0) return;
    setUploading(true);
    try {
      await uploadDataset(selectedProjectId, previewFiles);
      setPreviewFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const updated = await getDatasetsByProject(selectedProjectId);
      setDatasets(updated);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Quản lý dataset
      </Typography>

      {/* PROJECT SELECTOR */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Chọn dự án</InputLabel>
            <Select
              value={selectedProjectId}
              label="Chọn dự án"
              onChange={(e) => setSelectedProjectId(e.target.value as number)}
            >
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* FILE INPUT */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button variant="outlined" component="label">
              Chọn ảnh
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {previewFiles.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Đã chọn {previewFiles.length} ảnh
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || previewFiles.length === 0 || selectedProjectId === ''}
            >
              {uploading ? <CircularProgress size={22} color="inherit" /> : 'Upload'}
            </Button>
          </Stack>

          {/* PREVIEW GRID */}
          {previewFiles.length > 0 && (
            <Box>
              <Typography variant="overline" color="text.secondary">
                Xem trước
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: 1,
                  mt: 1,
                }}
              >
                {previewFiles.map((file, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    sx={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* UPLOADED DATASET GRID */}
      <Typography variant="overline" color="text.secondary">
        Dataset đã upload ({datasets.length} ảnh)
      </Typography>
      {datasets.length === 0 ? (
        <Typography variant="body2" color="text.secondary" mt={1}>
          Chưa có ảnh nào.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 1,
            mt: 1,
          }}
        >
          {datasets.map((ds) => (
            <Box key={ds.id} sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={ds.url}
                alt={ds.name}
                sx={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'text.secondary',
                }}
              >
                {ds.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DatasetsPage;

