import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Fade,
  Grow
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { systemConfigApi, type StorageStatus } from '../api/systemConfigApi';

const SettingsPage = () => {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [configs, setConfigs] = useState({
    MAX_STORAGE_GB: '0',
    MAX_FILE_SIZE_MB: '0',
    MAX_STORAGE_PER_PROJECT_GB: '0',
    MAX_FILES_PER_UPLOAD: '0'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await systemConfigApi.getStorageStatus();
      setStatus(data);
      setConfigs({
        MAX_STORAGE_GB: (data.limitBytes / (1024 * 1024 * 1024)).toString(),
        MAX_FILE_SIZE_MB: data.maxFileSizeMB.toString(),
        MAX_STORAGE_PER_PROJECT_GB: data.maxStoragePerProjectGB.toString(),
        MAX_FILES_PER_UPLOAD: data.maxFilesPerUpload.toString()
      });
    } catch (error) {
      console.error('Error fetching storage status:', error);
      setMessage({ type: 'error', text: 'Không thể tải trạng thái hệ thống.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (key: string) => {
    try {
      setUpdating(key);
      setMessage(null);
      await systemConfigApi.updateConfig(key, configs[key as keyof typeof configs]);
      setMessage({ type: 'success', text: `Cập nhật ${key} thành công.` });
      // Minor delay to show success before refreshing status
      setTimeout(fetchStatus, 500);
    } catch (error) {
      console.error('Error updating config:', error);
      setMessage({ type: 'error', text: 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setUpdating(null);
    }
  };

  if (loading && !status) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress thickness={4} size={50} />
        <Typography color="text.secondary">Đang tải cấu hình hệ thống...</Typography>
      </Box>
    );
  }

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.08)',
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}>
            Hệ Thống & Cấu Hình
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý tài nguyên và các giới hạn hệ thống của bạn
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchStatus} sx={{ bgcolor: 'white', border: '1px solid #eee' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {message && (
        <Fade in={!!message}>
          <Alert 
            severity={message.type} 
            sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        </Fade>
      )}

      <Grid container spacing={4}>
        {/* Storage Monitoring Dashboard */}
        <Grid size={12}>
          <Card sx={{ ...glassStyle, p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  bgcolor: 'primary.light', 
                  color: 'primary.main',
                  display: 'flex',
                  mr: 2
                }}>
                  <StorageIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Giám sát Lưu trữ</Typography>
                  <Typography variant="body2" color="text.secondary">Trạng thái dung lượng file toàn hệ thống</Typography>
                </Box>
              </Box>

              {status && (
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
                      <Box>
                        <Typography variant="h4" fontWeight="900" display="inline">{status.usedFormatted}</Typography>
                        <Typography variant="body1" color="text.secondary" display="inline" sx={{ ml: 1 }}>
                          đã sử dụng trên {status.limitFormatted}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color={status.usedPercentage > 85 ? 'error.main' : 'primary.main'}>
                        {status.usedPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(status.usedPercentage, 100)}
                      sx={{
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: '#eee',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 7,
                          background: status.usedPercentage > 85
                            ? 'linear-gradient(90deg, #f44336, #ff7043)'
                            : 'linear-gradient(90deg, #1976d2, #64b5f6)',
                        }
                      }}
                    />
                  </Box>
                  <Divider />
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    * Giới hạn này áp dụng cho toàn bộ dữ liệu (ảnh, dataset) được lưu trữ trên server.
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Global Limits Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, ml: 1, display: 'flex', alignItems: 'center' }}>
            <SettingsSuggestIcon sx={{ mr: 1, color: 'primary.main' }} /> Giới hạn Tài nguyên
          </Typography>
          <Stack spacing={3}>
            <Grow in>
              <Paper sx={{ ...glassStyle, p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    Tổng dung lượng cho phép
                  </Typography>
                  <Tooltip title="Giới hạn tối đa server có thể chứa (GB)">
                    <HelpOutlineIcon fontSize="small" color="disabled" />
                  </Tooltip>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    type="number"
                    value={configs.MAX_STORAGE_GB}
                    onChange={(e) => setConfigs({ ...configs, MAX_STORAGE_GB: e.target.value })}
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <Typography variant="caption">GB</Typography> }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateConfig('MAX_STORAGE_GB')}
                    disabled={updating === 'MAX_STORAGE_GB'}
                    startIcon={updating === 'MAX_STORAGE_GB' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{ minWidth: 110, borderRadius: 2, textTransform: 'none' }}
                  >
                    Lưu
                  </Button>
                </Stack>
              </Paper>
            </Grow>

            <Grow in style={{ transitionDelay: '100ms' }}>
              <Paper sx={{ ...glassStyle, p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    Hạn mức mỗi dự án
                  </Typography>
                  <Tooltip title="Lượng lưu trữ tối đa một dự án có thể sử dụng (GB)">
                    <HelpOutlineIcon fontSize="small" color="disabled" />
                  </Tooltip>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    type="number"
                    value={configs.MAX_STORAGE_PER_PROJECT_GB}
                    onChange={(e) => setConfigs({ ...configs, MAX_STORAGE_PER_PROJECT_GB: e.target.value })}
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <Typography variant="caption">GB</Typography> }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleUpdateConfig('MAX_STORAGE_PER_PROJECT_GB')}
                    disabled={updating === 'MAX_STORAGE_PER_PROJECT_GB'}
                    startIcon={updating === 'MAX_STORAGE_PER_PROJECT_GB' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{ minWidth: 110, borderRadius: 2, textTransform: 'none' }}
                  >
                    Lưu
                  </Button>
                </Stack>
              </Paper>
            </Grow>
          </Stack>
        </Grid>

        {/* File Config Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, ml: 1, display: 'flex', alignItems: 'center' }}>
            <CloudUploadIcon sx={{ mr: 1, color: 'secondary.main' }} /> Cấu hình Upload
          </Typography>
          <Stack spacing={3}>
            <Grow in style={{ transitionDelay: '200ms' }}>
              <Paper sx={{ ...glassStyle, p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    Kích thước file tối đa
                  </Typography>
                  <Tooltip title="Dung lượng tối đa của một file ảnh khi upload (MB)">
                    <HelpOutlineIcon fontSize="small" color="disabled" />
                  </Tooltip>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    type="number"
                    value={configs.MAX_FILE_SIZE_MB}
                    onChange={(e) => setConfigs({ ...configs, MAX_FILE_SIZE_MB: e.target.value })}
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <Typography variant="caption">MB</Typography> }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleUpdateConfig('MAX_FILE_SIZE_MB')}
                    disabled={updating === 'MAX_FILE_SIZE_MB'}
                    startIcon={updating === 'MAX_FILE_SIZE_MB' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{ minWidth: 110, borderRadius: 2, textTransform: 'none', bgcolor: 'secondary.main' }}
                  >
                    Lưu
                  </Button>
                </Stack>
              </Paper>
            </Grow>

            <Grow in style={{ transitionDelay: '300ms' }}>
              <Paper sx={{ ...glassStyle, p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    Số lượng file mỗi đợt
                  </Typography>
                  <Tooltip title="Số lượng file tối đa được phép chọn trong một lần upload">
                    <HelpOutlineIcon fontSize="small" color="disabled" />
                  </Tooltip>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    type="number"
                    value={configs.MAX_FILES_PER_UPLOAD}
                    onChange={(e) => setConfigs({ ...configs, MAX_FILES_PER_UPLOAD: e.target.value })}
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <Typography variant="caption">File</Typography> }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleUpdateConfig('MAX_FILES_PER_UPLOAD')}
                    disabled={updating === 'MAX_FILES_PER_UPLOAD'}
                    startIcon={updating === 'MAX_FILES_PER_UPLOAD' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{ minWidth: 110, borderRadius: 2, textTransform: 'none', bgcolor: 'secondary.main' }}
                  >
                    Lưu
                  </Button>
                </Stack>
              </Paper>
            </Grow>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
