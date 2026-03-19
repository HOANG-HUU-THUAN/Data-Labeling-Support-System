import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import useAuthStore from '../store/authStore';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h4" fontWeight="bold">
        Trang chủ
      </Typography>
      {user && (
        <Typography variant="body1" color="text.secondary">
          Xin chào, {user.name}!
        </Typography>
      )}
      <Button variant="outlined" color="error" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </Box>
  );
};

export default HomePage;
