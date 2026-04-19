import { Typography, Box, Paper, Stack, Fade, alpha, useTheme } from '@mui/material';
import useAuthStore from '../store/authStore';
import WelcomeIcon from '@mui/icons-material/WavingHand';

const HomePage = () => {
  const user = useAuthStore((state) => state.user);
  const theme = useTheme();

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    borderRadius: 4,
    p: 6,
    mt: 4,
    textAlign: 'center' as const,
  };

  return (
    <Fade in timeout={800}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={glassStyle}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ 
              p: 2, 
              borderRadius: '50%', 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'inline-flex'
            }}>
              <WelcomeIcon sx={{ fontSize: 48 }} />
            </Box>
            
            <Box>
              <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
                Chào mừng trở lại!
              </Typography>
              {user && (
                <Typography variant="h5" color="text.secondary">
                  Xin chào, <strong>{user.name}</strong>. Rất vui được gặp lại bạn!
                </Typography>
              )}
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Hệ thống Hỗ trợ Gán nhãn Dữ liệu của chúng tôi giúp bạn quản lý dự án 
              và gán nhãn dữ liệu một cách thông minh và hiệu quả hơn.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Fade>
  );
};

export default HomePage;
