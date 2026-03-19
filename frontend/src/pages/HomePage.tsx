import { Typography } from '@mui/material';
import useAuthStore from '../store/authStore';

const HomePage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Trang chủ
      </Typography>
      {user && (
        <Typography variant="body1" color="text.secondary">
          Xin chào, {user.name}!
        </Typography>
      )}
    </>
  );
};

export default HomePage;
