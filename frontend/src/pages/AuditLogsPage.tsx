import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getAuditLogs } from '../mock/auditLogMock';
import type { AuditLog, AuditAction, AuditLogFilters } from '../types/auditLog';

// ── Constants ──────────────────────────────────────────────────────────────────

const ACTION_OPTIONS: { value: AuditAction | ''; label: string }[] = [
  { value: '',        label: 'Tất cả' },
  { value: 'LOGIN',   label: 'LOGIN' },
  { value: 'LOGOUT',  label: 'LOGOUT' },
  { value: 'CREATE',  label: 'CREATE' },
  { value: 'UPDATE',  label: 'UPDATE' },
  { value: 'DELETE',  label: 'DELETE' },
  { value: 'LOCK',    label: 'LOCK' },
  { value: 'UNLOCK',  label: 'UNLOCK' },
  { value: 'APPROVE', label: 'APPROVE' },
  { value: 'REJECT',  label: 'REJECT' },
  { value: 'EXPORT',  label: 'EXPORT' },
];

const ACTION_COLOR: Record<AuditAction, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
  LOGIN:   'success',
  LOGOUT:  'default',
  CREATE:  'primary',
  UPDATE:  'info',
  DELETE:  'error',
  LOCK:    'error',
  UNLOCK:  'warning',
  APPROVE: 'success',
  REJECT:  'error',
  EXPORT:  'primary',
};

// ── Detail Drawer ──────────────────────────────────────────────────────────────

interface DrawerProps {
  log: AuditLog | null;
  onClose: () => void;
}

const DetailDrawer = ({ log, onClose }: DrawerProps) => (
  <Drawer anchor="right" open={!!log} onClose={onClose}>
    <Box width={360} role="presentation">
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2.5}
        py={2}
        bgcolor="action.hover"
      >
        <Typography variant="h6" fontWeight={700}>
          Chi tiết log #{log?.id}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />

      {log && (
        <Box display="flex" flexDirection="column" gap={2} p={2.5}>
          <Row label="ID" value={String(log.id)} />
          <Row label="Người dùng" value={log.user} />
          <Row
            label="Hành động"
            value={
              <Chip
                label={log.action}
                color={ACTION_COLOR[log.action]}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            }
          />
          <Row label="Đối tượng" value={`${log.entity} #${log.entityId}`} />
          <Row label="Thời gian" value={new Date(log.createdAt).toLocaleString('vi-VN')} />
          <Divider />
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.5} display="block">
              Mô tả chi tiết
            </Typography>
            <Typography variant="body2">{log.detail}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  </Drawer>
);

interface RowProps {
  label: string;
  value: React.ReactNode;
}
const Row = ({ label, value }: RowProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.3}>
      {label}
    </Typography>
    {typeof value === 'string' ? (
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    ) : (
      value
    )}
  </Box>
);

// ── Page ───────────────────────────────────────────────────────────────────────

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  // Filter state
  const [userQ, setUserQ] = useState('');
  const [actionQ, setActionQ] = useState<AuditAction | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLogs = (filters?: AuditLogFilters) => {
    setLoading(true);
    getAuditLogs(filters).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = () => {
    const filters: AuditLogFilters = {};
    if (userQ.trim())   filters.user   = userQ.trim();
    if (actionQ)        filters.action = actionQ;
    if (fromDate)       filters.from   = fromDate;
    if (toDate)         filters.to     = toDate;
    fetchLogs(filters);
  };

  const handleReset = () => {
    setUserQ('');
    setActionQ('');
    setFromDate('');
    setToDate('');
    fetchLogs();
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight={700}>
        Nhật ký hệ thống
      </Typography>

      {/* ── Filters ── */}
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="flex-end">
          <TextField
            label="Người dùng"
            size="small"
            value={userQ}
            onChange={(e) => setUserQ(e.target.value)}
            sx={{ minWidth: 160 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Hành động</InputLabel>
            <Select
              label="Hành động"
              value={actionQ}
              onChange={(e) => setActionQ(e.target.value as AuditAction | '')}
            >
              {ACTION_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Từ ngày"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            label="Đến ngày"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleFilter}
              disabled={loading}
            >
              Lọc
            </Button>
            <Button variant="outlined" onClick={handleReset} disabled={loading}>
              Xóa lọc
            </Button>
          </Box>
        </Box>
      </Card>

      {/* ── Table ── */}
      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={28} />
          </Box>
        ) : logs.length === 0 ? (
          <Box px={3} py={4}>
            <Typography variant="body2" color="text.secondary">
              Không có dữ liệu.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  {['ID', 'Người dùng', 'Hành động', 'Đối tượng', 'Thời gian'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    onClick={() => setSelected(log)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ color: 'text.secondary' }}>#{log.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.user}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={ACTION_COLOR[log.action]}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {log.entity} #{log.entityId}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ── Detail Drawer ── */}
      <DetailDrawer log={selected} onClose={() => setSelected(null)} />
    </Box>
  );
};

export default AuditLogsPage;
