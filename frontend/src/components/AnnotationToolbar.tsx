import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import PolylineOutlinedIcon from '@mui/icons-material/PolylineOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import type { Label } from '../types/label';
import type { AnnotationType } from '../types/annotation';

interface Props {
  labels: Label[];
  selectedLabel: Label | null;
  onLabelChange: (label: Label | null) => void;
  tool: AnnotationType;
  onToolChange: (tool: AnnotationType) => void;
  onAutoLabel: () => void;
  aiLoading: boolean;
  hasImage: boolean;
}

const AnnotationToolbar = ({ labels, selectedLabel, onLabelChange, tool, onToolChange, onAutoLabel, aiLoading, hasImage }: Props) => (
  <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
    {/* Tool selector */}
    <ToggleButtonGroup
      value={tool}
      exclusive
      size="small"
      onChange={(_e, val) => { if (val) onToolChange(val as AnnotationType); }}
    >
      <Tooltip title="Bounding Box — kéo để vẽ hình chữ nhật">
        <ToggleButton value="bbox" sx={{ gap: 0.5, px: 1.5 }}>
          <RectangleOutlinedIcon fontSize="small" />
          <Typography variant="caption" fontWeight={600}>Bbox</Typography>
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Polygon — click để thêm điểm, double-click để hoàn thành">
        <ToggleButton value="polygon" sx={{ gap: 0.5, px: 1.5 }}>
          <PolylineOutlinedIcon fontSize="small" />
          <Typography variant="caption" fontWeight={600}>Polygon</Typography>
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>

    {/* Label selector */}
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

    {/* AI auto-label button */}
    <Tooltip title="Gọi AI để tự động gán nhãn ảnh hiện tại">
      <span>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          disabled={!hasImage || aiLoading}
          onClick={onAutoLabel}
          startIcon={aiLoading ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon fontSize="small" />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {aiLoading ? 'Đang gán nhãn...' : 'Tự động gán nhãn'}
        </Button>
      </span>
    </Tooltip>

    {selectedLabel && !aiLoading && (
      <Typography variant="caption" color="text.secondary">
        {tool === 'bbox'
          ? 'Kéo để vẽ bounding box'
          : 'Click để thêm điểm · double-click để hoàn thành'}
      </Typography>
    )}
  </Box>
);

export default AnnotationToolbar;
