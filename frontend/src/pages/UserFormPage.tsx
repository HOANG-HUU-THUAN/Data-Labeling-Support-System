import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import type { Role } from '../types/auth';
import { getUserById, createUser, updateUser } from '../mock/userMock';

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'ANNOTATOR', 'REVIEWER'];

const ROLE_COLOR: Record<Role, 'error' | 'primary' | 'success' | 'info'> = {
  ADMIN: 'error',
  MANAGER: 'primary',
  ANNOTATOR: 'success',
  REVIEWER: 'info',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', email: '', role: 'ANNOTATOR' as Role, password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    getUserById(Number(id)).then((user) => {
      if (!user) { navigate('/users'); return; }
      setForm({ name: user.name, email: user.email, role: user.role, password: '' });
      setLoading(false);
    });
  }, [id, isEdit, navigate]);

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Tên không được để trống.';
    if (!form.email.trim()) return 'Email không được để trống.';
    if (!EMAIL_RE.test(form.email.trim())) return 'Email không đúng định dạng.';
    if (!isEdit) {
      if (!form.password) return 'Mật khẩu không được để trống.';
      if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    } else {
      if (form.password && form.password.length < 6) return 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await updateUser(Number(id), {
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await createUser({ name: form.name, email: form.email, role: form.role, password: form.password, isLocked: false });
      }
      navigate('/users');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={480} mx="auto" mt={4}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => navigate('/users')}
        >
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Chỉnh sửa người dùng' : 'Tạo người dùng'}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
        <TextField
          label={isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
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
        <Box display="flex" justifyContent="flex-end" gap={1.5} mt={0.5}>
          <Button onClick={() => navigate('/users')} disabled={saving}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleSubmit}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, minWidth: 100 }}
          >
            {saving
              ? <CircularProgress size={18} color="inherit" />
              : isEdit ? 'Cập nhật' : 'Tạo'
            }
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserFormPage;
