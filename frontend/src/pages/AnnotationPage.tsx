import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import { getTaskImages } from '../mock/annotatorMock';
import type { AnnotationImage } from '../mock/annotatorMock';
import { getTaskById } from '../mock/taskMock';
import { getLabelsByProject } from '../mock/labelMock';
import type { Label } from '../types/label';
import {
  getAnnotationsByImage,
  createAnnotation,
  deleteAnnotation,
  lockImage,
  unlockImage,
} from '../mock/annotationMock';
import type { Annotation } from '../types/annotation';
import AnnotationToolbar from '../components/AnnotationToolbar';
import useAuthStore from '../store/authStore';

const AnnotationPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [images, setImages] = useState<AnnotationImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<AnnotationImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  // annotations for currently selected image
  const [currentAnnotations, setCurrentAnnotations] = useState<Annotation[]>([]);
  // annotation count badge per image
  const [annotationCounts, setAnnotationCounts] = useState<Record<number, number>>({});
  // lock state
  const [isLocked, setIsLocked] = useState(false);
  const lockedImageRef = useRef<number | null>(null);
  // drag state
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [previewBox, setPreviewBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [saving, setSaving] = useState(false);

  // Initial load: task images + labels + annotation counts
  useEffect(() => {
    if (!taskId) return;
    const id = Number(taskId);
    Promise.all([getTaskImages(id), getTaskById(id)]).then(([imgs, task]) => {
      setImages(imgs);
      if (task) {
        getLabelsByProject(task.projectId).then((lbls) => {
          setLabels(lbls);
          if (lbls.length > 0) setSelectedLabel(lbls[0]);
        });
      }
      Promise.all(imgs.map((img) => getAnnotationsByImage(img.id))).then((results) => {
        const counts: Record<number, number> = {};
        results.forEach((anns, i) => { counts[imgs[i].id] = anns.length; });
        setAnnotationCounts(counts);
        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
          setCurrentAnnotations(results[0] ?? []);
        }
      });
      setLoading(false);
    });
  }, [taskId]);

  // Lock/unlock when selected image changes
  useEffect(() => {
    if (!selectedImage || !user) return;
    let cancelled = false;
    // Release previous lock if switching images
    if (lockedImageRef.current !== null && lockedImageRef.current !== selectedImage.id) {
      unlockImage(lockedImageRef.current);
      lockedImageRef.current = null;
    }
    lockImage(selectedImage.id, user.id).then(({ locked }) => {
      if (cancelled) return;
      setIsLocked(locked);
      if (!locked) lockedImageRef.current = selectedImage.id;
    });
    return () => { cancelled = true; };
  }, [selectedImage, user]);

  // Unlock on page unmount
  useEffect(() => {
    return () => {
      if (lockedImageRef.current !== null) unlockImage(lockedImageRef.current);
    };
  }, []);

  // Load annotations whenever selected image changes
  useEffect(() => {
    if (!selectedImage) return;
    let cancelled = false;
    getAnnotationsByImage(selectedImage.id).then((anns) => {
      if (!cancelled) setCurrentAnnotations(anns);
    });
    return () => { cancelled = true; };
  }, [selectedImage]);

  const getColor = (labelId: number) =>
    labels.find((l) => l.id === labelId)?.color ?? '#9e9e9e';

  const getRelativePos = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedLabel || !selectedImage || saving || isLocked) return;
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
    const x = Math.min(drawStart.x, pos.x);
    const y = Math.min(drawStart.y, pos.y);
    const w = Math.abs(pos.x - drawStart.x);
    const h = Math.abs(pos.y - drawStart.y);
    setDrawStart(null);
    setPreviewBox(null);
    if (w <= 1 || h <= 1) return;

    setSaving(true);
    createAnnotation({ imageId: selectedImage.id, labelId: selectedLabel.id, x, y, w, h }).then((ann) => {
      setCurrentAnnotations((prev) => [...prev, ann]);
      setAnnotationCounts((prev) => ({ ...prev, [selectedImage.id]: (prev[selectedImage.id] ?? 0) + 1 }));
      setSaving(false);
    });
  };

  const handleDeleteAnnotation = (annId: number) => {
    if (!selectedImage) return;
    deleteAnnotation(annId).then(() => {
      setCurrentAnnotations((prev) => prev.filter((a) => a.id !== annId));
      setAnnotationCounts((prev) => ({ ...prev, [selectedImage.id]: Math.max(0, (prev[selectedImage.id] ?? 1) - 1) }));
    });
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* HEADER */}
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => {
            if (lockedImageRef.current !== null) unlockImage(lockedImageRef.current);
            navigate('/my-tasks');
          }}
        >
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Workspace gán nhãn — Task #{taskId}
        </Typography>
        {saving && (
          <Box display="flex" alignItems="center" gap={1} ml="auto">
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">Đang lưu...</Typography>
          </Box>
        )}
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
                onClick={() => { setCurrentAnnotations([]); setSelectedImage(img); }}
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
                {(annotationCounts[img.id] ?? 0) > 0 && (
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
                    {annotationCounts[img.id]}
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
              flexDirection: 'column',
              overflow: 'hidden',
              p: 2,
            }}
          >
            {isLocked && (
              <Alert
                severity="warning"
                icon={<LockIcon fontSize="small" />}
                sx={{ mb: 1, flexShrink: 0 }}
              >
                Ảnh đang được người khác chỉnh sửa. Bạn chỉ có thể xem.
              </Alert>
            )}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flex={1}
              overflow="hidden"
            >
            {selectedImage ? (
                <Box position="relative" display="inline-block" maxWidth="100%">
                  {/* Base image */}
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

                  {/* Saved annotations */}
                  {currentAnnotations.map((ann) => (
                    <Box
                      key={ann.id}
                      sx={{
                        position: 'absolute',
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${ann.w}%`,
                        height: `${ann.h}%`,
                        border: `2px solid ${getColor(ann.labelId)}`,
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.7 },
                      }}
                      title="Nhấp chuột phải để xóa"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleDeleteAnnotation(ann.id);
                      }}
                    >
                      <Typography
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: -2,
                          fontSize: 11,
                          lineHeight: '18px',
                          bgcolor: getColor(ann.labelId),
                          color: '#fff',
                          px: 0.6,
                          borderRadius: '3px 3px 0 0',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}
                      >
                        {labels.find((l) => l.id === ann.labelId)?.name ?? ''}
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

                  {/* Transparent overlay — captures mouse events for drawing */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      cursor: isLocked ? 'default' : selectedLabel ? 'crosshair' : 'not-allowed',
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
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AnnotationPage;
