import { Box, Toolbar } from '@mui/material';
import Topbar from './Topbar';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          p: 3,
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        {/* Spacer để tránh content bị che bởi Topbar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
