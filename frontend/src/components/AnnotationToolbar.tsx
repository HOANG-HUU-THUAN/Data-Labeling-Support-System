import { Box, FormControl, InputLabel, MenuItem, Select, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { RectangleOutlined, PentagonOutlined } from '@mui/icons-material';
import type { Label } from '../types/label';

interface Props {
  labels: Label[];
  selectedLabel: Label | null;
  onLabelChange: (label: Label | null) => void;
  tool: 'BOX' | 'POLYGON';
  onToolChange: (tool: 'BOX' | 'POLYGON') => void;
}

const AnnotationToolbar = ({ labels, selectedLabel, onLabelChange, tool, onToolChange }: Props) => (
  <Box display="flex" alignItems="center" gap={3} px={2} py={1} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="body2" fontWeight="medium">Công cụ:</Typography>
      <ToggleButtonGroup
        value={tool}
        exclusive
        onChange={(_, val) => val && onToolChange(val)}
        size="small"
      >
        <ToggleButton value="BOX" title="Hình chữ nhật">
          <RectangleOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="POLYGON" title="Đa giác">
          <PentagonOutlined fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>

    <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
      <Typography variant="body2" fontWeight="medium">Nhãn:</Typography>
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
                  borderRadius="2px"
                  bgcolor={l.color}
                  flexShrink={0}
                  border="1px solid rgba(0,0,0,0.1)"
                />
                {l.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>

    {selectedLabel && (
      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
        {tool === 'BOX' 
          ? 'Nhấn giữ và kéo để vẽ hình chữ nhật' 
          : 'Click để thêm đỉnh, double-click để hoàn tất đa giác'}
      </Typography>
    )}
  </Box>
);

export default AnnotationToolbar;
