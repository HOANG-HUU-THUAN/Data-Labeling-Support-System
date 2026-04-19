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
  Fade,
  Grow,
  alpha,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { getProjects } from '../api/projectApi';
import { deleteDataset, getDatasetsByProject, uploadDataset, getImagesByDatasetId } from '../api/datasetApi';
import type { Project } from '../types/project';
import type { Dataset, DatasetImage } from '../types/dataset';
import ImageWithAuth from '../components/ImageWithAuth';

const formatImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.replace(/^\/api/, '');
};

const DatasetsPage = () => {
  const theme = useTheme();
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

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  };

  useEffect(() => {
    getProjects({ size: 100 }).then((res) => {
      const list = res.data;
      setProjects(list);
      if (list.length > 0) setSelectedProjectId(list[0].id);
    });

    import('../api/systemConfigApi').then(({ systemConfigApi }) => {
      systemConfigApi.getStorageStatus().then(status => {
        setMaxFiles(status.maxFilesPerUpload);
        setMaxFileSize(status.maxFileSizeMB);
      });
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId === '') return;
    setLoadingDatasets(true);
    getDatasetsByProject(selectedProjectId)
      .then(setDatasets)
      .finally(() => setLoadingDatasets(false));
    setSelectedDataset(null);
    setDatasetImages([]);
  }, [selectedProjectId]);

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
      const updated = await getDatasetsByProject(selectedProjectId as number);
      setDatasets(updated);
    } finally {
      setUploading(false);
      setLoadingDatasets(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" color="primary.main" mb={4}>
        Quản lý Dataset
      </Typography>

      <Grow in>
        <Paper sx={{ ...glassStyle, p: 3, mb: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold" color="text.primary" display="flex" alignItems="center" gap={1}>
              <CloudUploadIcon color="primary" /> Tải lên Dataset mới
            </Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Dự án mục tiêu</InputLabel>
                <Select
                  value={selectedProjectId}
                  label="Dự án mục tiêu"
                  onChange={(e) => setSelectedProjectId(e.target.value as number)}
                  sx={{ borderRadius: 2 }}
                >
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Tên Dataset"
                size="small"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                disabled={uploading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Button 
                variant="outlined" 
                component="label" 
                startIcon={<InsertDriveFileIcon />}
                sx={{ height: 40, borderRadius: 2, textTransform: 'none', px: 3, whiteSpace: 'nowrap' }}
              >
                Chọn ảnh
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
              </Button>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploading || previewFiles.length === 0 || selectedProjectId === '' || !datasetName.trim()}
                  sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 'bold' }}
                >
                  {uploading ? <CircularProgress size={22} color="inherit" /> : 'Bắt đầu Upload'}
                </Button>
                {previewFiles.length > 0 && (
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    Đã cấu hình {previewFiles.length} ảnh
                  </Typography>
                )}
              </Stack>
              
              <Box sx={{ textAlign: 'right' }}>
                {maxFiles !== null && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Giới hạn: <strong>{maxFiles} ảnh/lần</strong>
                  </Typography>
                )}
                {maxFileSize !== null && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Dung lượng tối đa: <strong>{maxFileSize} MB</strong>
                  </Typography>
                )}
              </Box>
            </Stack>

            {previewFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" sx={{ px: 1 }}>Xem trước danh sách chọn</Typography>
                <ImageList cols={5} gap={12} sx={{ mt: 1, maxHeight: 300, overflowY: 'auto', p: 1 }}>
                  {previewFiles.map((file, i) => (
                    <ImageListItem key={`${file.name}-${i}`} sx={{ 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      position: 'relative', 
                      '&:hover .remove-preview-btn': { opacity: 1 } 
                    }}>
                      <Box component="img" src={URL.createObjectURL(file)} alt={file.name} sx={{ height: 100, width: '100%', objectFit: 'cover' }} />
                      <ImageListItemBar title={file.name} sx={{ '& .MuiImageListItemBar-title': { fontSize: '0.75rem' } }} />
                      <IconButton
                        className="remove-preview-btn"
                        size="small"
                        onClick={() => setPreviewFiles(prev => prev.filter((_, idx) => idx !== i))}
                        sx={{
                          position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)',
                          opacity: 0, transition: 'opacity 0.2s', zIndex: 1,
                          '&:hover': { bgcolor: 'white', color: 'error.main' },
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
      </Grow>

      <Fade in timeout={1000}>
        <Box>
          {selectedDataset ? (
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setSelectedDataset(null)}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Danh sách Dataset
                </Button>
                <Typography variant="h6" fontWeight="bold">
                  Dataset: <span style={{ color: theme.palette.primary.main }}>{selectedDataset.name}</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">({datasetImages.length} ảnh)</Typography>
              </Stack>

              {loadingImages ? (
                <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
              ) : datasetImages.length === 0 ? (
                <Paper sx={{ ...glassStyle, p: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">Không có ảnh nào trong dataset này.</Typography>
                </Paper>
              ) : (
                <ImageList cols={4} gap={16}>
                  {datasetImages.map((img) => (
                    <ImageListItem key={img.id} sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
                    }}>
                      <ImageWithAuth
                        src={formatImageUrl(img.thumbnail)}
                        alt={img.name}
                        sx={{ height: 200, width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setSelectedImage(img)}
                      />
                      <ImageListItemBar title={img.name} />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={2}>Danh sách Dataset ({datasets.length})</Typography>
              {loadingDatasets ? (
                <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
              ) : datasets.length === 0 ? (
                <Paper sx={{ ...glassStyle, p: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">Dự án này chưa có dữ liệu gán nhãn.</Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {datasets.map((ds) => (
                    <Paper
                      key={ds.id}
                      sx={{
                        ...glassStyle,
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderColor: theme.palette.primary.main 
                        },
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setSelectedDataset(ds)}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight="bold">{ds.name}</Typography>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            Số lượng: <strong>{ds.imageCount} ảnh</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ngày tạo: {new Date(ds.createdAt).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button size="small" sx={{ textTransform: 'none' }}>Chi tiết</Button>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deletingId === ds.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!window.confirm(`Xóa dataset "${ds.name}"?`)) return;
                            setDeletingId(ds.id);
                            deleteDataset(ds.id)
                              .then(() => getDatasetsByProject(selectedProjectId as number))
                              .then(setDatasets)
                              .finally(() => setDeletingId(null));
                          }}
                        >
                          {deletingId === ds.id ? <CircularProgress size={16} color="error" /> : <CloseIcon fontSize="small" />}
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Fade>

      <Dialog open={selectedImage !== null} onClose={() => setSelectedImage(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Chi tiết ảnh
          <IconButton onClick={() => setSelectedImage(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          {selectedImage && (
            <Box>
              <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <ImageWithAuth
                  src={formatImageUrl(selectedImage.url)}
                  alt={selectedImage.name}
                  sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
                />
              </Paper>
              <Stack direction="row" spacing={3} mt={2} sx={{ px: 1 }}>
                <Typography variant="body2">ID: <strong>#{selectedImage.id}</strong></Typography>
                <Typography variant="body2">Tên file: <strong>{selectedImage.name}</strong></Typography>
                <Typography variant="body2">Trạng thái: <strong>{selectedImage.status}</strong></Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DatasetsPage;
