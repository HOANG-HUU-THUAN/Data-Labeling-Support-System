import { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { getProjectStats, type ProjectStats } from '../../../mock/dashboardMock';

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
    sx={{
      flex: 1,
      minWidth: 140,
      borderRadius: 3,
      borderColor: `${color}40`,
      bgcolor: bg,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 3 },
    }}
  >
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" fontWeight={700} color={color} lineHeight={1.1}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
    </CardContent>
  </Card>
);

interface Props {
  projectId: number;
}

const ProjectStatsWidget = ({ projectId }: Props) => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjectStats(projectId).then((data) => {
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [projectId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <StatCard
        label="Tổng ảnh"
        value={stats.totalImages}
        icon={<ImageOutlinedIcon />}
        color="#616161"
        bg="#fafafa"
      />
      <StatCard
        label="Đã gán nhãn"
        value={stats.annotated}
        icon={<LabelOutlinedIcon />}
        color="#1976d2"
        bg="#f0f7ff"
      />
      <StatCard
        label="Đã duyệt"
        value={stats.approved}
        icon={<CheckCircleOutlineIcon />}
        color="#2e7d32"
        bg="#f0fdf4"
      />
      <StatCard
        label="Bị từ chối"
        value={stats.rejected}
        icon={<CancelOutlinedIcon />}
        color="#d32f2f"
        bg="#fff5f5"
      />
    </Box>
  );
};

export default ProjectStatsWidget;
