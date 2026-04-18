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
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { getAllUsers, lockUser, unlockUser, assignRoles } from '../api/userApi';
import type { User } from '../types/user';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Role management state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);
  const [savingRole, setSavingRole] = useState(false);

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

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setTempRoles(user.roles);
    setRoleDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    setSavingRole(true);
    try {
      await assignRoles(selectedUser.id, tempRoles);
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi cập nhật quyền:', error);
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Quản lý người dùng
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell width={80}><strong>ID</strong></TableCell>
              <TableCell><strong>Người dùng</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Vai trò</strong></TableCell>
              <TableCell><strong>Trạng thái</strong></TableCell>
              <TableCell width={150} align="center"><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Không có người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.roles.map((role) => (
                        <Chip 
                            key={role} 
                            label={role.replace('ROLE_', '')} 
                            size="small" 
                            variant="outlined" 
                            sx={{ mr: 0.5 }} 
                        />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      size="small"
                      color={user.status === 'ACTIVE' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Phân quyền">
                      <IconButton size="small" color="primary" onClick={() => handleOpenRoleDialog(user)}>
                        <ManageAccountsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}>
                      <IconButton 
                        size="small" 
                        color={user.status === 'ACTIVE' ? 'warning' : 'success'} 
                        onClick={() => handleToggleLock(user)}
                      >
                        {user.status === 'ACTIVE' ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
      />

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Phân quyền cho {selectedUser?.username}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Quyền hạn</InputLabel>
            <Select
              multiple
              value={tempRoles}
              label="Quyền hạn"
              onChange={(e) => setTempRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value.replace('ROLE_', '')} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="ROLE_ADMIN">ADMIN</MenuItem>
              <MenuItem value="ROLE_ANNOTATOR">ANNOTATOR</MenuItem>
              <MenuItem value="ROLE_REVIEWER">REVIEWER</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveRoles} 
            disabled={savingRole}
          >
            {savingRole ? <CircularProgress size={24} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
