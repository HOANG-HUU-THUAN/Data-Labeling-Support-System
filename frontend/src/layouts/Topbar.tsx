import { useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, Toolbar, Typography, Avatar, Tooltip, useTheme, alpha } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuthStore from '../store/authStore';

const ROLE_CONFIG: Record<string, { label: string; color: string; gradient: string }> = {
  ADMIN: { 
    label: 'Quản trị viên', 
    color: '#d32f2f', 
    gradient: 'linear-gradient(45deg, #f44336 30%, #ba000d 90%)' 
  },
  MANAGER: { 
    label: 'Quản lý', 
    color: '#1976d2', 
    gradient: 'linear-gradient(45deg, #2196f3 30%, #1565c0 90%)' 
  },
  ANNOTATOR: { 
    label: 'Gán nhãn', 
    color: '#2e7d32', 
    gradient: 'linear-gradient(45deg, #4caf50 30%, #1b5e20 90%)' 
  },
  REVIEWER: { 
    label: 'Kiểm duyệt', 
    color: '#ed6c02', 
    gradient: 'linear-gradient(45deg, #ff9800 30%, #e65100 90%)' 
  },
};

const SIDEBAR_WIDTH = 240;

const Topbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleInfo = user?.role ? ROLE_CONFIG[user.role] : null;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: '#e3f2fd',
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        color: theme.palette.primary.main,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            ml: `${SIDEBAR_WIDTH}px`,
            color: 'primary.main',
            letterSpacing: '-0.5px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            }
          }}
          onClick={() => navigate('/')}
        >
          Hệ thống Gán nhãn Dữ liệu
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                {roleInfo && (
                  <Typography 
                    variant="caption" 
                    fontWeight="600"
                    sx={{ 
                      color: roleInfo.color,
                      opacity: 0.9
                    }}
                  >
                    {roleInfo.label}
                  </Typography>
                )}
              </Box>
              
              <Tooltip title={`Tài khoản: ${user.name}`}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: roleInfo?.color || 'primary.main',
                    boxShadow: `0 4px 12px ${alpha(roleInfo?.color || theme.palette.primary.main, 0.3)}`,
                    border: '2px solid white'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            </Box>

            <Tooltip title="Đăng xuất">
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: '600',
                  borderColor: alpha(theme.palette.divider, 0.2),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    color: theme.palette.error.main,
                    borderColor: alpha(theme.palette.error.main, 0.2),
                  }
                }}
              >
                Đăng xuất
              </Button>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
