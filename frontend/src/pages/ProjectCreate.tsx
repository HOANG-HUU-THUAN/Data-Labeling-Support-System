import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { createProject } from '../mock/projectMock';

export default function ProjectCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProject({ name, description });
      navigate('/projects');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Tạo dự án
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên dự án"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
            margin="normal"
          />
          <Stack direction="row" spacing={2} mt={3}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={22} color="inherit" /> : 'Tạo'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/projects')} disabled={saving}>
              Hủy
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}