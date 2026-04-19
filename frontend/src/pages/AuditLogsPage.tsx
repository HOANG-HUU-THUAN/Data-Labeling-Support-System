import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Fade,
  alpha,
  useTheme,
  Stack,
  Tooltip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { format } from 'date-fns';
import { getAllLogs } from '../api/auditApi';
import type { AuditLog } from '../types/audit';

export default function AuditLogsPage() {
  const theme = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };

  const fetchLogs = () => {
    setLoading(true);
    getAllLogs(page, pageSize)
      .then((res) => {
        setLogs(res.data);
        setTotalElements(res.totalElements);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize]);

  const getActionStyle = (action: string) => {
    if (action.includes('DELETE')) return { color: theme.palette.error.main, label: 'Xóa' };
    if (action.includes('CREATE') || action.includes('ADD')) return { color: theme.palette.success.main, label: 'Tạo mới' };
    if (action.includes('UPDATE')) return { color: theme.palette.warning.main, label: 'Cập nhật' };
    if (action.includes('LOCK')) return { color: theme.palette.error.dark, label: 'Khóa user' };
    if (action.includes('UNLOCK')) return { color: theme.palette.success.dark, label: 'Mở khóa' };
    return { color: theme.palette.info.main, label: action };
  };

  return (
    <Fade in timeout={800}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', display: 'flex' }}>
            <HistoryIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">Nhật ký hoạt động</Typography>
            <Typography variant="body2" color="text.secondary">Theo dõi mọi thay đổi quan trọng trên hệ thống</Typography>
          </Box>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ ...glassStyle, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.04) }}>
                  <TableCell width={80} sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell width={200} sx={{ fontWeight: 'bold' }}>Thời điểm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Người thực hiện</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chi tiết thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">Hiện chưa có bản ghi nhật ký nào.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const style = getActionStyle(log.action);
                    return (
                      <TableRow key={log.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.01) } }}>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>#{log.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {format(new Date(log.createdAt), 'dd/MM/yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(log.createdAt), 'HH:mm:ss')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                            {log.username}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={style.label}
                            size="small"
                            sx={{ 
                              fontWeight: 'bold', borderRadius: 1, height: 22,
                              bgcolor: alpha(style.color, 0.1),
                              color: style.color,
                              border: '1px solid', borderColor: alpha(style.color, 0.2)
                            }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.65rem' }}>{log.action}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: alpha(theme.palette.common.black, 0.05), px: 0.5, borderRadius: 0.5 }}>
                            {log.ipAddress}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 350 }}>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <InfoOutlinedIcon sx={{ fontSize: 16, mt: 0.3, color: 'text.disabled' }} />
                            <Tooltip title={log.details} arrow placement="top">
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                                  overflow: 'hidden', lineHeight: 1.4, cursor: 'help' 
                                }}
                              >
                                {log.details}
                              </Typography>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Dòng mỗi trang:"
              sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
            />
          </TableContainer>
        )}
      </Box>
    </Fade>
  );
}
