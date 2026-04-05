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
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import type { Role } from '../types/auth';
import {
  type AppUser,
  getUsers,
  toggleLockUser,
  updateUser,
  deleteUser,
  createUser,
} from '../mock/userMock';

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'ANNOTATOR', 'REVIEWER'];

const ROLE_COLOR: Record<Role, 'error' | 'primary' | 'success' | 'info'> = {
  ADMIN: 'error',
  MANAGER: 'primary',
  ANNOTATOR: 'success',
  REVIEWER: 'info',
};

const EMPTY_FORM = { name: '', email: '', role: 'ANNOTATOR' as Role, isLocked: false };

// ── View Dialog ───────────────────────────────────────────────────────────────
function ViewDialog({ user, onClose }: { user: AppUser | null; onClose: () => void }) {
  if (!user) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Chi tiết người dùng</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '12px !important' }}>
        {([['ID', user.id], ['Tên', user.name], ['Email', user.email]] as [string, string | number][]).map(
          ([label, value]) => (
            <Box key={label} display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 56 }}>
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>{value}</Typography>
            </Box>
          )
        )}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary" sx={{ width: 56 }}>Role</Typography>
          <Chip label={user.role} color={ROLE_COLOR[user.role]} size="small" sx={{ fontWeight: 700 }} />
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary" sx={{ width: 56 }}>Trạng thái</Typography>
          <Chip
            label={user.isLocked ? 'Locked' : 'Active'}
            color={user.isLocked ? 'default' : 'success'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Edit / Create Dialog ───────────────────────────────────────────────────────
function EditDialog({
  user,
  onClose,
  onSave,
}: {
  user: AppUser | null;
  onClose: () => void;
  onSave: (data: { name: string; email: string; role: Role; password?: string }) => Promise<void>;
}) {
  const isCreate = !user;
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? ('ANNOTATOR' as Role),
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Tên không được để trống.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email không được để trống.');
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setError('Email không đúng định dạng.');
      return;
    }
    if (isCreate) {
      if (!form.password) {
        setError('Mật khẩu không được để trống.');
        return;
      }
      if (form.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
    }
    setSaving(true);
    try {
      await onSave({ name: form.name, email: form.email, role: form.role, ...(isCreate ? { password: form.password } : {}) });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isCreate ? 'Tạo người dùng' : 'Chỉnh sửa người dùng'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
        {error && (
          <Typography variant="body2" color="error">{error}</Typography>
        )}
        <TextField
          label="Tên"
          size="small"
          fullWidth
          value={form.name}
          onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(null); }}
        />
        <TextField
          label="Email"
          size="small"
          fullWidth
          value={form.email}
          onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setError(null); }}
        />
        {isCreate && (
          <TextField
            label="Mật khẩu"
            size="small"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setError(null); }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <VisibilityOffOutlinedIcon fontSize="small" />
                      : <VisibilityOutlinedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        <FormControl fullWidth size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={form.role}
            label="Role"
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                <Chip label={r} color={ROLE_COLOR[r]} size="small" sx={{ fontWeight: 700 }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={saving}>Hủy</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSave}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? <CircularProgress size={18} color="inherit" /> : isCreate ? 'Tạo' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── UsersPage ──────────────────────────────────────────────────────────────────
const UsersPage = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');

  // Dialogs
  const [viewUser, setViewUser] = useState<AppUser | null>(null);
  const [editUser, setEditUser] = useState<AppUser | null | typeof EMPTY_FORM>(undefined as never);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = () =>
    getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });

  useEffect(() => { reload(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleLock = async (u: AppUser) => {
    await toggleLockUser(u.id);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isLocked: !x.isLocked } : x)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteUser(deleteTarget.id);
    setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  const openCreate = () => {
    setEditUser(null);
    setEditOpen(true);
  };

  const openEdit = (u: AppUser) => {
    setEditUser(u);
    setEditOpen(true);
  };

  const handleSave = async (data: { name: string; email: string; role: Role; password?: string }) => {
    if (editUser === null) {
      // create
      const created = await createUser({ ...data, password: data.password ?? '', isLocked: false });
      setUsers((prev) => [...prev, created]);
    } else {
      // update
      await updateUser((editUser as AppUser).id, data);
      setUsers((prev) =>
        prev.map((x) => (x.id === (editUser as AppUser).id ? { ...x, ...data } : x))
      );
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" gap={2.5}>
      {/* ── Header ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>
          Quản lý người dùng
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
        >
          Tạo người dùng
        </Button>
      </Box>

      {/* ── Filters ── */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Table ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  {['ID', 'Tên', 'Email', 'Role', 'Trạng thái', 'Hành động'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      Không tìm thấy người dùng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow
                      key={u.id}
                      hover
                      sx={{ opacity: u.isLocked ? 0.6 : 1, transition: 'opacity 0.2s' }}
                    >
                      <TableCell sx={{ color: 'text.secondary', width: 48 }}>{u.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          color={ROLE_COLOR[u.role]}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.isLocked ? 'Locked' : 'Active'}
                          color={u.isLocked ? 'default' : 'success'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton size="small" onClick={() => setViewUser(u)}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton size="small" color="primary" onClick={() => openEdit(u)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}>
                            <IconButton
                              size="small"
                              color={u.isLocked ? 'success' : 'warning'}
                              onClick={() => handleToggleLock(u)}
                            >
                              {u.isLocked ? (
                                <LockOpenOutlinedIcon fontSize="small" />
                              ) : (
                                <LockOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(u)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filtered.length > 0 && (
            <>
              <Divider />
              <Box px={2} py={1}>
                <Typography variant="caption" color="text.secondary">
                  {filtered.length} / {users.length} người dùng
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* ── Dialogs ── */}
      {viewUser && <ViewDialog user={viewUser} onClose={() => setViewUser(null)} />}

      {editOpen && (
        <EditDialog
          user={editUser as AppUser | null}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <Dialog open onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Bạn có chắc muốn xóa người dùng{' '}
              <strong>{deleteTarget.name}</strong> ({deleteTarget.email})?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Hủy</Button>
            <Button
              variant="contained"
              color="error"
              disabled={deleting}
              onClick={handleDelete}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
            >
              {deleting ? <CircularProgress size={18} color="inherit" /> : 'Xóa'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default UsersPage;
