import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {
  getProjectStats,
  getProjectProgress,
  type ProjectStats,
  type ProgressItem,
} from '../mock/dashboardMock';
import PerformanceWidget from '../features/dashboard/components/PerformanceWidget';

const STATUS_LABEL: Record<string, string> = {
  TODO: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  SUBMITTED: 'Đã nộp',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'error'> = {
  TODO: 'default',
  IN_PROGRESS: 'primary',
  SUBMITTED: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const STATUS_BAR_COLOR: Record<string, string> = {
  TODO: '#9e9e9e',
  IN_PROGRESS: '#1976d2',
  SUBMITTED: '#ed6c02',
  APPROVED: '#2e7d32',
  REJECTED: '#d32f2f',
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const StatCard = ({ label, value, icon, color, bg }: StatCardProps) => (
  <Card
    variant="outlined"
    sx={{ flex: 1, minWidth: 140, borderRadius: 3, borderColor: `${color}40`, bgcolor: bg }}
  >
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box
        sx={{
          width: 40, height: 40, borderRadius: 2,
          bgcolor: `${color}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" fontWeight={700} color={color} lineHeight={1.1}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProjectStats(), getProjectProgress()]).then(
      ([s, p]) => {
        if (cancelled) return;
        setStats(s);
        setProgress(p);
        setLoading(false);
      }
    );
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  const totalTasks = progress.reduce((s, p) => s + p.count, 0);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" fontWeight={700}>Dashboard</Typography>

      {/* ── KPI Cards ── */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <StatCard label="Tổng ảnh" value={stats.totalImages}
          icon={<ImageOutlinedIcon />} color="#616161" bg="#fafafa" />
        <StatCard label="Đã gán nhãn" value={stats.annotated}
          icon={<LabelOutlinedIcon />} color="#1976d2" bg="#f0f7ff" />
        <StatCard label="Đã duyệt" value={stats.approved}
          icon={<CheckCircleOutlineIcon />} color="#2e7d32" bg="#f0fdf4" />
        <StatCard label="Bị từ chối" value={stats.rejected}
          icon={<CancelOutlinedIcon />} color="#d32f2f" bg="#fff5f5" />
      </Box>

      {/* ── Task Progress ── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Tiến độ task</Typography>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {progress.map((item) => (
            <Box key={item.status}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Chip
                  label={STATUS_LABEL[item.status] ?? item.status}
                  color={STATUS_COLOR[item.status] ?? 'default'}
                  size="small"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {item.count} / {totalTasks}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalTasks > 0 ? (item.count / totalTasks) * 100 : 0}
                sx={{
                  height: 8, borderRadius: 4,
                  bgcolor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': { bgcolor: STATUS_BAR_COLOR[item.status] ?? '#9e9e9e', borderRadius: 4 },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── User Performance ── */}
      <PerformanceWidget />
    </Box>
  );
};

export default DashboardPage;
