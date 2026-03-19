import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LabelIcon from '@mui/icons-material/Label';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import useAuthStore from '../store/authStore';
import type { User } from '../types/auth';

export const SIDEBAR_WIDTH = 240;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuByRole: Record<User['role'], MenuItem[]> = {
  ADMIN: [
    { label: 'Trang chủ', path: '/', icon: <HomeIcon /> },
    { label: 'Người dùng', path: '/users', icon: <PeopleIcon /> },
    { label: 'Nhật ký hệ thống', path: '/audit-logs', icon: <HistoryIcon /> },
  ],
  MANAGER: [
    { label: 'Trang chủ', path: '/', icon: <HomeIcon /> },
    { label: 'Dự án', path: '/projects', icon: <FolderIcon /> },
    { label: 'Dataset', path: '/datasets', icon: <StorageIcon /> },
    { label: 'Task', path: '/tasks', icon: <AssignmentIcon /> },
    { label: 'Dashboard', path: '/dashboard', icon: <BarChartIcon /> },
    { label: 'Xuất dữ liệu', path: '/export', icon: <FileDownloadIcon /> },
  ],
  ANNOTATOR: [
    { label: 'Task của tôi', path: '/my-tasks', icon: <AssignmentIcon /> },
    { label: 'Gán nhãn', path: '/annotation', icon: <LabelIcon /> },
  ],
  REVIEWER: [
    { label: 'Kiểm duyệt', path: '/review', icon: <RateReviewIcon /> },
  ],
};

const Sidebar = () => {
  const navigate = useNavigate();
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
        },
      }}
    >
      <Toolbar />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, pt: 2, pb: 1, textTransform: 'uppercase', letterSpacing: 1 }}
      >
        Menu
      </Typography>
      <List dense>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
