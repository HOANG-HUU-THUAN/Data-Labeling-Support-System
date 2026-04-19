import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Person as PersonIcon,
  Timeline as PerformanceIcon,
} from '@mui/icons-material';
import { getDashboardStats } from '../api/dashboardApi';
import type { DashboardResponse } from '../api/dashboardApi';

const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px ${alpha(color, 0.25)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              backgroundColor: alpha(color, 0.1),
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color="error">{error || 'Đã có lỗi xảy ra'}</Typography>
      </Box>
    );
  }

  const { overall, userPerformances } = data;
  const annotators = userPerformances.filter(u => u.role === 'ANNOTATOR');
  const reviewers = userPerformances.filter(u => u.role === 'REVIEWER');

  const PerformanceTable = ({ title, users }: { title: string, users: typeof userPerformances }) => (
    <Box mb={6}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <PerformanceIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      
      <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Thành viên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Task</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Chưa hoàn thành</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đã hoàn thành</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Bị từ chối</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tỉ lệ hoàn thành</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const completionRate = user.assignedTasks > 0
                ? Math.round((user.completedTasks / user.assignedTasks) * 100)
                : 0;
              
              return (
                <TableRow key={user.userId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography fontWeight="medium">{user.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'ANNOTATOR' ? 'Annotator' : 'Reviewer'}
                      size="small"
                      color={user.role === 'ANNOTATOR' ? 'primary' : 'secondary'}
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">{user.assignedTasks}</TableCell>
                  <TableCell align="center">
                    <Typography color="text.secondary" fontWeight="medium">{user.assignedTasks - user.completedTasks}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="success.main" fontWeight="bold">{user.completedTasks}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color="error.main" fontWeight="medium">{user.rejectedTasks}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <Box sx={{ width: '100%', maxWidth: 100, bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: 10, height: 8, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${completionRate}%`,
                            height: '100%',
                            bgcolor: completionRate > 80 ? 'success.main' : completionRate > 50 ? 'primary.main' : 'warning.main',
                            transition: 'width 1s ease-in-out'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="bold">{completionRate}%</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
          Dashboard Hệ Thống
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Thống kê tổng quan và hiệu suất của Annotator & Reviewer.
        </Typography>
      </Box>

      {/* OVERALL STATS */}
      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng số Task"
            value={overall.totalTasks}
            icon={<AssignmentIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Chưa hoàn thành"
            value={overall.totalTasks - overall.approvedTasks}
            icon={<PerformanceIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Bị từ chối"
            value={overall.rejectedTasks}
            icon={<RejectedIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Đã hoàn thành"
            value={overall.approvedTasks}
            icon={<ApprovedIcon />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* TABLES */}
      <PerformanceTable title="Hiệu suất Annotator" users={annotators} />
      <PerformanceTable title="Hiệu suất Reviewer" users={reviewers} />
    </Box>
  );
};

export default DashboardPage;
