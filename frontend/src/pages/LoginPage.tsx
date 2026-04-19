import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Fade,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { loginApi } from '../api/authApi';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await loginApi(username, password);
      login(token, user);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRadius: 5,
    p: 5,
    width: '100%',
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      <Container maxWidth="xs">
        <Fade in timeout={1000}>
          <Paper sx={glassStyle}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ 
                p: 2, 
                borderRadius: 2.5, 
                bgcolor: 'primary.main', 
                color: 'white',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              }}>
                <LoginIcon fontSize="large" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  Đăng Nhập Hệ Thống
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dữ liệu Labeling Support System
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 3, 
                      bgcolor: 'rgba(255,255,255,0.5)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                    } 
                  }}
                />
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 3, 
                      bgcolor: 'rgba(255,255,255,0.5)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                    } 
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    mt: 4, 
                    py: 1.5, 
                    borderRadius: 3, 
                    textTransform: 'none', 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Nhập'}
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginPage;
