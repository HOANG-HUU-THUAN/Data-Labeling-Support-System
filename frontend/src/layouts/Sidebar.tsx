import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import useAuthStore from '../store/authStore';
import type { User } from '../types/auth';

export const SIDEBAR_WIDTH = 260;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuByRole: Record<User['role'], MenuItem[]> = {
  ADMIN: [
    { label: 'Người dùng', path: '/users', icon: <PeopleIcon /> },
    { label: 'Nhật ký hệ thống', path: '/audit-logs', icon: <HistoryIcon /> },
    { label: 'Cài đặt hệ thống', path: '/settings', icon: <SettingsIcon /> },
  ],
  MANAGER: [
    { label: 'Dự án', path: '/projects', icon: <FolderIcon /> },
    { label: 'Dataset', path: '/datasets', icon: <StorageIcon /> },
    { label: 'Công việc (Task)', path: '/tasks', icon: <AssignmentIcon /> },
    { label: 'Dashboard', path: '/dashboard', icon: <BarChartIcon /> },
    { label: 'Xuất dữ liệu', path: '/export', icon: <FileDownloadIcon /> },
  ],
  ANNOTATOR: [
    { label: 'Task của tôi', path: '/my-tasks', icon: <AssignmentIcon /> },
  ],
  REVIEWER: [
    { label: 'Kiểm duyệt', path: '/review', icon: <RateReviewIcon /> },
  ],
};

const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const role = user?.role ?? 'ANNOTATOR';
  const menuItems = menuByRole[role] ?? [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease',
          boxShadow: 'none',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, pt: 3, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 800,
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            ml: 1.5
          }}
        >
          Hệ thống
        </Typography>
      </Box>
      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <ListItemButton
              key={item.path}
              selected={isSelected}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '12px',
                mb: 0.8,
                py: 1.2,
                px: 2,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    height: '60%',
                    width: '4px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                    transform: 'scale(1.1)',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 700,
                  }
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.05),
                  transform: 'translateX(4px)',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  }
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  transition: 'all 0.2s',
                  color: isSelected ? 'primary.main' : 'text.secondary'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.925rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'inherit' : 'text.primary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, mb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            borderColor: 'rgba(0,0,0,0.08)',
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            textAlign: 'center'
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Phần mềm gán nhãn v1.0
          </Typography>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
