import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getTaskImages } from '../mock/annotatorMock';
import type { AnnotationImage } from '../mock/annotatorMock';
import { getTaskById } from '../mock/taskMock';
import { getLabelsByProject } from '../mock/labelMock';
import type { Label } from '../types/label';
import AnnotationToolbar from '../components/AnnotationToolbar';

interface BoxData {
  id: number;
  x: number; // % of overlay width
  y: number; // % of overlay height
  w: number;
  h: number;
  labelId: number;
}

const AnnotationPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [images, setImages] = useState<AnnotationImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<AnnotationImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  // boxes stored per imageId
  const [boxMap, setBoxMap] = useState<Record<number, BoxData[]>>({});
  // current drag state
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [previewBox, setPreviewBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const nextBoxId = useRef(1);

  useEffect(() => {
    if (!taskId) return;
    const id = Number(taskId);
    Promise.all([getTaskImages(id), getTaskById(id)]).then(([imgs, task]) => {
      setImages(imgs);
      if (imgs.length > 0) setSelectedImage(imgs[0]);
      if (task) {
        getLabelsByProject(task.projectId).then((lbls) => {
          setLabels(lbls);
          if (lbls.length > 0) setSelectedLabel(lbls[0]);
        });
      }
      setLoading(false);
    });
  }, [taskId]);

  const getColor = (labelId: number) =>
    labels.find((l) => l.id === labelId)?.color ?? '#9e9e9e';

  const currentBoxes = selectedImage ? (boxMap[selectedImage.id] ?? []) : [];

  const getRelativePos = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedLabel || !selectedImage) return;
    const pos = getRelativePos(e);
    setDrawStart(pos);
    setPreviewBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawStart) return;
    const pos = getRelativePos(e);
    setPreviewBox({
      x: Math.min(drawStart.x, pos.x),
      y: Math.min(drawStart.y, pos.y),
      w: Math.abs(pos.x - drawStart.x),
      h: Math.abs(pos.y - drawStart.y),
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawStart || !selectedLabel || !selectedImage) return;
    const pos = getRelativePos(e);
    const box: BoxData = {
      id: nextBoxId.current++,
      x: Math.min(drawStart.x, pos.x),
      y: Math.min(drawStart.y, pos.y),
      w: Math.abs(pos.x - drawStart.x),
      h: Math.abs(pos.y - drawStart.y),
      labelId: selectedLabel.id,
    };
    if (box.w > 1 && box.h > 1) {
      setBoxMap((prev) => ({
        ...prev,
        [selectedImage.id]: [...(prev[selectedImage.id] ?? []), box],
      }));
    }
    setDrawStart(null);
    setPreviewBox(null);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* HEADER */}
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => navigate('/my-tasks')}
        >
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Workspace gán nhãn — Task #{taskId}
        </Typography>
      </Box>

      {/* TOOLBAR */}
      {!loading && (
        <AnnotationToolbar
          labels={labels}
          selectedLabel={selectedLabel}
          onLabelChange={setSelectedLabel}
        />
      )}

      <Divider sx={{ mb: 1 }} />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : images.length === 0 ? (
        <Typography color="text.secondary" mt={4} textAlign="center">
          Task này không có ảnh nào
        </Typography>
      ) : (
        <Box display="flex" gap={2} flex={1} minHeight={0}>
          {/* LEFT PANEL — thumbnail list */}
          <Paper
            variant="outlined"
            sx={{
              width: 160,
              flexShrink: 0,
              overflowY: 'auto',
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="overline" color="text.secondary" px={0.5}>
              Ảnh ({images.length})
            </Typography>
            <Divider />
            {images.map((img) => (
              <Box
                key={img.id}
                onClick={() => setSelectedImage(img)}
                sx={{ position: 'relative', cursor: 'pointer' }}
              >
                <Box
                  component="img"
                  src={img.url}
                  alt={img.name}
                  sx={{
                    width: '100%',
                    height: 90,
                    objectFit: 'cover',
                    borderRadius: 1,
                    display: 'block',
                    border: '2px solid',
                    borderColor: selectedImage?.id === img.id ? 'primary.main' : 'transparent',
                    transition: 'border-color 0.15s',
                    '&:hover': { opacity: 0.85 },
                  }}
                />
                {(boxMap[img.id]?.length ?? 0) > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      bgcolor: 'primary.main',
                      color: '#fff',
                      fontSize: 10,
                      borderRadius: '8px',
                      px: 0.6,
                      lineHeight: 1.6,
                    }}
                  >
                    {boxMap[img.id].length}
                  </Box>
                )}
              </Box>
            ))}
          </Paper>

          {/* RIGHT PANEL — annotation canvas */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              p: 2,
            }}
          >
            {selectedImage ? (
              <Box position="relative" display="inline-block" maxWidth="100%">
                {/* Base image — pointer-events none so overlay handles all mouse */}
                <Box
                  component="img"
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  sx={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 260px)',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />

                {/* Existing boxes */}
                {currentBoxes.map((box) => (
                  <Box
                    key={box.id}
                    sx={{
                      position: 'absolute',
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      border: `2px solid ${getColor(box.labelId)}`,
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: -20,
                        left: -2,
                        fontSize: 11,
                        lineHeight: '18px',
                        bgcolor: getColor(box.labelId),
                        color: '#fff',
                        px: 0.6,
                        borderRadius: '3px 3px 0 0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {labels.find((l) => l.id === box.labelId)?.name ?? ''}
                    </Typography>
                  </Box>
                ))}

                {/* Live preview box while dragging */}
                {previewBox && selectedLabel && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${previewBox.x}%`,
                      top: `${previewBox.y}%`,
                      width: `${previewBox.w}%`,
                      height: `${previewBox.h}%`,
                      border: `2px dashed ${selectedLabel.color}`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Transparent overlay — captures mouse events */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    cursor: selectedLabel ? 'crosshair' : 'not-allowed',
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    setDrawStart(null);
                    setPreviewBox(null);
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chọn ảnh từ danh sách bên trái
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AnnotationPage;
