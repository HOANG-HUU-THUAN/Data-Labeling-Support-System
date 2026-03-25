import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

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
    setLoadingDatasets(true);
    getDatasetsByProject(selectedProjectId)
      .then(setDatasets)
      .finally(() => setLoadingDatasets(false));
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
      setLoadingDatasets(true);
      const updated = await getDatasetsByProject(selectedProjectId);
      setDatasets(updated);
    } finally {
      setUploading(false);
      setLoadingDatasets(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Quản lý dataset
      </Typography>

      {/* PROJECT SELECTOR + UPLOAD */}
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
              <ImageList cols={5} gap={8} sx={{ mt: 1 }}>
                {previewFiles.map((file, i) => (
                  <ImageListItem key={i}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      sx={{ height: 100, width: '100%', objectFit: 'cover', borderRadius: 1 }}
                    />
                    <ImageListItemBar title={file.name} sx={{ borderRadius: '0 0 4px 4px' }} />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* UPLOADED DATASET GRID */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="overline" color="text.secondary">
          Dataset đã upload ({datasets.length} ảnh)
        </Typography>
        {loadingDatasets && <CircularProgress size={18} />}
      </Stack>

      {!loadingDatasets && datasets.length === 0 && (
        <Typography variant="body2" color="text.secondary" mt={1}>
          Chưa có ảnh nào.
        </Typography>
      )}

      {!loadingDatasets && datasets.length > 0 && (
        <ImageList cols={4} gap={8}>
          {datasets.map((ds) => (
            <ImageListItem
              key={ds.id}
              onClick={() => setSelectedDataset(ds)}
              sx={{ cursor: 'pointer', '&:hover img': { opacity: 0.85 } }}
            >
              <Box
                component="img"
                src={ds.url}
                alt={ds.name}
                sx={{ height: 150, width: '100%', objectFit: 'cover', borderRadius: 1, transition: 'opacity 0.2s' }}
              />
              <ImageListItemBar title={ds.name} sx={{ borderRadius: '0 0 4px 4px' }} />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* IMAGE DETAIL DIALOG */}
      <Dialog
        open={selectedDataset !== null}
        onClose={() => setSelectedDataset(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Chi tiết ảnh
          <IconButton onClick={() => setSelectedDataset(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedDataset && (
            <Box>
              <Box
                component="img"
                src={selectedDataset.url}
                alt={selectedDataset.name}
                sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1, display: 'block' }}
              />
              <Stack direction="row" spacing={2} mt={1.5}>
                <Typography variant="body2" color="text.secondary">
                  ID: <strong>{selectedDataset.id}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tên: <strong>{selectedDataset.name}</strong>
                </Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DatasetsPage;

