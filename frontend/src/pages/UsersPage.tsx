import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  Fade,
  alpha,
  useTheme,
  Stack,
  OutlinedInput,
  Avatar
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { getAllUsers, lockUser, unlockUser, assignRoles, updateUser, createUser } from '../api/userApi';
import type { User } from '../types/user';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import EmailIcon from '@mui/icons-material/Email';
import PasswordIcon from '@mui/icons-material/Password';

export default function UsersPage() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempRole, setTempRole] = useState<string>('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State for Create User
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('ANNOTATOR');
  const [creatingUser, setCreatingUser] = useState(false);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers(page, pageSize)
      .then((res) => {
        setUsers(res.data);
        setTotalElements(res.totalElements);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  const handleToggleLock = async (user: User) => {
    try {
      if (user.status === 'LOCKED') {
        await unlockUser(user.id);
      } else {
        await lockUser(user.id);
      }
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error);
    }
  };

  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setTempRole(user.roles[0] || 'ANNOTATOR');
    setTempEmail(user.email);
    setTempPassword('');
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSavingUser(true);
    try {
      // Cập nhật quyền hạn (Gửi lẻ 1 role trong mảng)
      await assignRoles(selectedUser.id, [tempRole]);

      // Cập nhật thông tin khác (email, password nếu có)
      const updateData: any = { email: tempEmail };
      if (tempPassword) {
        updateData.password = tempPassword;
      }
      await updateUser(selectedUser.id, updateData);

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newEmail || !newPassword) return;
    setCreatingUser(true);
    try {
      const newUser = await createUser({
        username: newUsername,
        email: newEmail,
        password: newPassword
      });

      // Gán role ngay sau khi tạo (vì backend mặc định là ANNOTATOR)
      await assignRoles(newUser.id, [newRole]);

      setCreateDialogOpen(false);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('ANNOTATOR');
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <Fade in timeout={800}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
            <PeopleAltIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">Quản lý người dùng</Typography>
            <Typography variant="body2" color="text.secondary">Quản trị viên có thể phân quyền và khóa tài khoản</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold', px: 3, height: 48 }}
          >
            Thêm người dùng
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ ...glassStyle, overflow: 'hidden' }}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell width={80} sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Người dùng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell width={120} align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">Chưa có dữ liệu người dùng.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>#{user.id}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              fontWeight: 'bold',
                              fontSize: '0.875rem'
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="700">{user.username}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {user.roles.map((role) => (
                            <Chip
                              key={role}
                              label={role}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 'bold',
                                borderRadius: 1,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                              }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                          size="small"
                          sx={{
                            fontWeight: 'bold', borderRadius: 1.5,
                            bgcolor: user.status === 'ACTIVE' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                            color: user.status === 'ACTIVE' ? 'success.main' : 'error.main',
                            border: '1px solid', borderColor: user.status === 'ACTIVE' ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Chỉnh sửa thông tin">
                            <IconButton size="small" sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }} onClick={() => handleOpenEditDialog(user)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                            <IconButton
                              size="small"
                              sx={{
                                color: user.status === 'ACTIVE' ? 'warning.main' : 'success.main',
                                bgcolor: user.status === 'ACTIVE' ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.success.main, 0.05),
                                '&:hover': { bgcolor: user.status === 'ACTIVE' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.success.main, 0.1) }
                              }}
                              onClick={() => handleToggleLock(user)}
                            >
                              {user.status === 'ACTIVE' ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalElements}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Số dòng mỗi trang:"
              sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
            />
          </TableContainer>
        )}

        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Chỉnh sửa người dùng: {selectedUser?.username}
          </DialogTitle>
          <DialogContent dividers sx={{ borderStyle: 'dashed' }}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Email"
                fullWidth
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Mật khẩu mới (để trống nếu không đổi)"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Vai trò hệ thống</InputLabel>
                <Select
                  value={tempRole}
                  label="Vai trò hệ thống"
                  onChange={(e) => setTempRole(e.target.value as string)}
                  input={<OutlinedInput label="Vai trò hệ thống" sx={{ borderRadius: 2 }} />}
                >
                  <MenuItem value="ADMIN" sx={{ fontWeight: 'bold' }}>ADMIN</MenuItem>
                  <MenuItem value="MANAGER" sx={{ fontWeight: 'bold' }}>MANAGER</MenuItem>
                  <MenuItem value="ANNOTATOR" sx={{ fontWeight: 'bold' }}>ANNOTATOR</MenuItem>
                  <MenuItem value="REVIEWER" sx={{ fontWeight: 'bold' }}>REVIEWER</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setEditDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Hủy bỏ</Button>
            <Button
              variant="contained"
              onClick={handleSaveUser}
              disabled={savingUser}
              sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
            >
              {savingUser ? <CircularProgress size={20} color="inherit" /> : 'Lưu cập nhật'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Tạo người dùng mới
          </DialogTitle>
          <DialogContent dividers sx={{ borderStyle: 'dashed' }}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Tên đăng nhập"
                fullWidth
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Email"
                fullWidth
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Mật khẩu"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Vai trò hệ thống</InputLabel>
                <Select
                  value={newRole}
                  label="Vai trò hệ thống"
                  onChange={(e) => setNewRole(e.target.value as string)}
                  input={<OutlinedInput label="Vai trò hệ thống" sx={{ borderRadius: 2 }} />}
                >
                  <MenuItem value="ADMIN" sx={{ fontWeight: 'bold' }}>ADMIN</MenuItem>
                  <MenuItem value="MANAGER" sx={{ fontWeight: 'bold' }}>MANAGER</MenuItem>
                  <MenuItem value="ANNOTATOR" sx={{ fontWeight: 'bold' }}>ANNOTATOR</MenuItem>
                  <MenuItem value="REVIEWER" sx={{ fontWeight: 'bold' }}>REVIEWER</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Hủy bỏ</Button>
            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={creatingUser || !newUsername || !newEmail || !newPassword}
              sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
            >
              {creatingUser ? <CircularProgress size={20} color="inherit" /> : 'Tạo người dùng'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
