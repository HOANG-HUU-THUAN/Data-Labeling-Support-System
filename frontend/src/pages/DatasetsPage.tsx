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
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getProjects } from '../api/projectApi';
import { deleteDataset, getDatasetsByProject, uploadDataset, getImagesByDatasetId } from '../api/datasetApi';
import type { Project } from '../types/project';
import type { Dataset, DatasetImage } from '../types/dataset';
import ImageWithAuth from '../components/ImageWithAuth';

const formatImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Backend returns /api/v1/... but axiosInstance baseURL is .../api
  // Strip /api to avoid duplication
  return url.replace(/^\/api/, '');
};

const DatasetsPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [datasetImages, setDatasetImages] = useState<DatasetImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DatasetImage | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [maxFiles, setMaxFiles] = useState<number | null>(null);
  const [maxFileSize, setMaxFileSize] = useState<number | null>(null);

  // Load project list once
  useEffect(() => {
    getProjects({ size: 100 }).then((res) => {
      const list = res.data;
      setProjects(list);
      if (list.length > 0) setSelectedProjectId(list[0].id);
    });

    // Fetch system config for upload limit
    import('../api/systemConfigApi').then(({ systemConfigApi }) => {
      systemConfigApi.getStorageStatus().then(status => {
        setMaxFiles(status.maxFilesPerUpload);
        setMaxFileSize(status.maxFileSizeMB);
      });
    });
  }, []);

  // Reload dataset list when project changes
  useEffect(() => {
    if (selectedProjectId === '') return;
    setLoadingDatasets(true);
    getDatasetsByProject(selectedProjectId)
      .then(setDatasets)
      .finally(() => setLoadingDatasets(false));
    setSelectedDataset(null);
    setDatasetImages([]);
  }, [selectedProjectId]);

  // Load images when a dataset is selected
  useEffect(() => {
    if (!selectedDataset) {
      setDatasetImages([]);
      return;
    }
    setLoadingImages(true);
    getImagesByDatasetId(selectedDataset.id)
      .then(setDatasetImages)
      .finally(() => setLoadingImages(false));
  }, [selectedDataset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPreviewFiles(files);
  };

  const handleUpload = async () => {
    if (selectedProjectId === '' || previewFiles.length === 0 || !datasetName.trim()) return;

    if (maxFiles !== null && previewFiles.length > maxFiles) {
      alert(`Số lượng file upload vượt quá giới hạn cho phép (${maxFiles} file)`);
      return;
    }

    setUploading(true);
    try {
      await uploadDataset(selectedProjectId, previewFiles, datasetName.trim());
      setPreviewFiles([]);
      setDatasetName('');
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
        <Stack spacing={3}>
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

          <Stack direction="row" spacing={2}>
            <TextField
              label="Tên Dataset"
              size="small"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              sx={{ flex: 1 }}

              disabled={uploading}
            />
            <Button variant="outlined" component="label" sx={{ height: 40 }}>
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
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || previewFiles.length === 0 || selectedProjectId === '' || !datasetName.trim()}
              sx={{ px: 4 }}
            >
              {uploading ? <CircularProgress size={22} color="inherit" /> : 'Upload'}
            </Button>
            <Box>
              {maxFiles !== null && (
                <Typography variant="body2" color="primary.main" fontWeight="500">
                  Số lượng file upload được cho phép : <strong>{maxFiles}</strong>
                </Typography>
              )}
              {maxFileSize !== null && (
                <Typography variant="body2" color="primary.main" fontWeight="500">
                  Kích thước file tối đa : <strong>{maxFileSize} MB</strong>
                </Typography>
              )}
            </Box>
            {previewFiles.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Đã chọn <strong>{previewFiles.length}</strong> ảnh
              </Typography>
            )}
          </Stack>

          {/* PREVIEW GRID */}
          {previewFiles.length > 0 && (
            <Box>
              <Typography variant="overline" color="text.secondary">
                Xem trước
              </Typography>
              <ImageList cols={5} gap={8} sx={{ mt: 1 }}>
                {previewFiles.map((file, i) => (
                  <ImageListItem key={`${file.name}-${i}`} sx={{ position: 'relative', '&:hover .remove-preview-btn': { opacity: 1 } }}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      sx={{ height: 100, width: '100%', objectFit: 'cover', borderRadius: 1 }}
                    />
                    <ImageListItemBar title={file.name} sx={{ borderRadius: '0 0 4px 4px' }} />
                    <IconButton
                      className="remove-preview-btn"
                      size="small"
                      onClick={() => {
                        setPreviewFiles(prev => prev.filter((_, idx) => idx !== i));
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        zIndex: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,1)', color: 'error.main' },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* VIEWING DATASET IMAGES or LIST */}
      {selectedDataset ? (
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setSelectedDataset(null)}
              variant="outlined"
              size="small"
            >
              Quay lại danh sách dataset
            </Button>
            <Typography variant="h6">
              Dataset: <strong>{selectedDataset.name}</strong> ({datasetImages.length} ảnh)
            </Typography>
            {loadingImages && <CircularProgress size={18} />}
          </Stack>

          {datasetImages.length === 0 && !loadingImages ? (
            <Typography variant="body2" color="text.secondary">Dataset này không có ảnh nào.</Typography>
          ) : (
            <ImageList cols={4} gap={8}>
              {datasetImages.map((img) => (
                <ImageListItem key={img.id}>
                  <ImageWithAuth
                    src={formatImageUrl(img.thumbnail)}
                    alt={img.name}
                    sx={{ height: 180, width: '100%', objectFit: 'cover', borderRadius: 1, cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                    onClick={() => setSelectedImage(img)}
                  />
                  <ImageListItemBar
                    title={img.name}
                    sx={{ borderRadius: '0 0 4px 4px' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Box>
      ) : (
        /* DATASET LIST VIEW */
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" color="text.secondary">
              Danh sách Dataset ({datasets.length})
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {loadingDatasets && <CircularProgress size={18} />}
            </Stack>
          </Stack>

          {!loadingDatasets && datasets.length === 0 && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Dự án này chưa có dataset nào.
            </Typography>
          )}

          {!loadingDatasets && datasets.length > 0 && (
            <Stack spacing={2}>
              {datasets.map((ds) => (
                <Paper
                  key={ds.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedDataset(ds)}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {ds.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng: <strong>{ds.imageCount} ảnh</strong> | Ngày tạo: {new Date(ds.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button variant="text" size="small">Xem ảnh</Button>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={deletingId === ds.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!window.confirm(`Bạn có chắc muốn xóa dataset "${ds.name}" không?`)) return;
                        setDeletingId(ds.id);
                        deleteDataset(ds.id)
                          .then(() => getDatasetsByProject(selectedProjectId as number))
                          .then(setDatasets)
                          .finally(() => setDeletingId(null));
                      }}
                    >
                      {deletingId === ds.id ? <CircularProgress size={16} /> : <CloseIcon />}
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* IMAGE DETAIL DIALOG */}
      <Dialog
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Chi tiết ảnh
          <IconButton onClick={() => setSelectedImage(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedImage && (
            <Box>
              <ImageWithAuth
                src={formatImageUrl(selectedImage.url)}
                alt={selectedImage.name}
                sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1, display: 'block' }}
              />
              <Stack direction="row" spacing={2} mt={1.5}>
                <Typography variant="body2" color="text.secondary">
                  ID: <strong>{selectedImage.id}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tên: <strong>{selectedImage.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái: <strong>{selectedImage.status}</strong>
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
