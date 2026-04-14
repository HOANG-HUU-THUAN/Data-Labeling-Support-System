import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import type { Label } from '../types/label';

interface Props {
  labels: Label[];
  selectedLabel: Label | null;
  onLabelChange: (label: Label | null) => void;
}

const AnnotationToolbar = ({ labels, selectedLabel, onLabelChange }: Props) => (
  <Box display="flex" alignItems="center" gap={2} mb={1}>
    <Typography variant="body2" color="text.secondary">
      Nhãn:
    </Typography>
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Chọn nhãn</InputLabel>
      <Select
        value={selectedLabel?.id ?? ''}
        label="Chọn nhãn"
        onChange={(e) => {
          const id = Number(e.target.value);
          onLabelChange(labels.find((l) => l.id === id) ?? null);
        }}
      >
        {labels.map((l) => (
          <MenuItem key={l.id} value={l.id}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                width={12}
                height={12}
                borderRadius="50%"
                bgcolor={l.color}
                flexShrink={0}
                border="1px solid rgba(0,0,0,0.2)"
              />
              {l.name}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    {selectedLabel && (
      <Typography variant="caption" color="text.secondary">
        Nhấn giữ và kéo để vẽ vùng gán nhãn
      </Typography>
    )}
  </Box>
);

export default AnnotationToolbar;
