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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import { getTaskImages } from '../api/taskApi';
import type { AnnotationImage } from '../types/task';
import { getTaskById } from '../api/taskApi';
import { getLabelsByProject } from '../api/labelApi';
import type { Label } from '../types/label';
import {
  getAnnotationsByImage,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  replaceAnnotationsForImage,
} from '../api/annotationApi';
import type { Annotation } from '../types/annotation';
import AnnotationToolbar from '../components/AnnotationToolbar';
import { submitTask } from '../api/taskApi';
import { submitReview } from '../api/reviewApi';
import ImageWithAuth from '../components/ImageWithAuth';
import useAuthStore from '../store/authStore';

type DragState =
  | { type: 'draw'; startX: number; startY: number }
  | { type: 'move'; annId: number; startMx: number; startMy: number; origX: number; origY: number }
  | { type: 'resize'; annId: number; corner: 'tl' | 'tr' | 'bl' | 'br'; startMx: number; startMy: number; origX: number; origY: number; origW: number; origH: number };

const CORNER_HANDLES = [
  { key: 'tl' as const, cursor: 'nwse-resize', sx: { top: -5, left: -5 } },
  { key: 'tr' as const, cursor: 'nesw-resize', sx: { top: -5, right: -5 } },
  { key: 'bl' as const, cursor: 'nesw-resize', sx: { bottom: -5, left: -5 } },
  { key: 'br' as const, cursor: 'nwse-resize', sx: { bottom: -5, right: -5 } },
];

const AnnotationPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [images, setImages] = useState<AnnotationImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<AnnotationImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  // annotations for currently selected image
  const [currentAnnotations, setCurrentAnnotations] = useState<Annotation[]>([]);
  // annotation count badge per image
  const [annotationCounts, setAnnotationCounts] = useState<Record<number, number>>({});
  // lock state removed
  // selected box + drag
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const dragModeRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewBox, setPreviewBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const isReviewerOrAdmin = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [errorCategory, setErrorCategory] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');

  // Undo / redo
  const historyRef = useRef<Annotation[][]>([]);
  const historyIndexRef = useRef<number>(-1);
  const currentAnnotationsRef = useRef<Annotation[]>([]);
  const selectedImageRef = useRef<AnnotationImage | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /** Sync both state and the ref together. Never call setCurrentAnnotations directly. */
  const setAnnotations = (anns: Annotation[]) => {
    currentAnnotationsRef.current = anns;
    setCurrentAnnotations(anns);
  };

  /** Push a snapshot onto the undo stack (trims the redo tail). */
  const pushHistory = (anns: Annotation[]) => {
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push([...anns]);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  };

  /** Seed fresh history for a newly loaded image. */
  const seedHistory = (anns: Annotation[]) => {
    historyRef.current = [[...anns]];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  };

  /** Jump to a history index and restore state. */
  const applySnapshot = (index: number) => {
    historyIndexRef.current = index;
    const snapshot = historyRef.current[index];
    setAnnotations([...snapshot]);
    setCanUndo(index > 0);
    setCanRedo(index < historyRef.current.length - 1);
    if (selectedImageRef.current) {
      replaceAnnotationsForImage(selectedImageRef.current.id, snapshot);
    }
  };

  // Keep selectedImageRef in sync for use inside keyboard handler
  useEffect(() => { selectedImageRef.current = selectedImage; }, [selectedImage]);

  // Initial load: task images + labels + annotation counts
  useEffect(() => {
    if (!taskId) return;
    const id = Number(taskId);
    if (isNaN(id)) return;
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
          setAnnotations(results[0] ?? []);
        }
      });
      setLoading(false);
    });
  }, [taskId]);

  // Lock/unlock removed

  // Load annotations whenever selected image changes; also seeds undo/redo history
  useEffect(() => {
    if (!selectedImage) return;
    let cancelled = false;
    getAnnotationsByImage(selectedImage.id).then((anns) => {
      if (!cancelled) {
        setAnnotations(anns);
        seedHistory(anns);
      }
    });
    return () => { cancelled = true; };
  }, [selectedImage]);

  // Keyboard shortcuts: Ctrl+Z = undo, Ctrl+Y = redo
  // All values accessed through refs → safe with empty deps array
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      const applyIdx = (newIdx: number) => {
        historyIndexRef.current = newIdx;
        const snap = historyRef.current[newIdx];
        currentAnnotationsRef.current = [...snap];
        setCurrentAnnotations([...snap]);
        setCanUndo(newIdx > 0);
        setCanRedo(newIdx < historyRef.current.length - 1);
        if (selectedImageRef.current)
          replaceAnnotationsForImage(selectedImageRef.current.id, snap);
      };
      if (e.key === 'z') {
        e.preventDefault();
        if (historyIndexRef.current > 0) applyIdx(historyIndexRef.current - 1);
      } else if (e.key === 'y') {
        e.preventDefault();
        if (historyIndexRef.current < historyRef.current.length - 1)
          applyIdx(historyIndexRef.current + 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getColor = (labelId: number) =>
    labels.find((l) => l.id === labelId)?.color ?? '#9e9e9e';

  const getRelativePos = (e: React.MouseEvent) => {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  // Finalize draw/move/resize on mouseUp or mouseLeave
  const finalizeDrag = (e: React.MouseEvent) => {
    const mode = dragModeRef.current;
    dragModeRef.current = null;
    if (!mode) return;

    if (mode.type === 'draw') {
      setPreviewBox(null);
      const pos = getRelativePos(e);
      const x = Math.min(mode.startX, pos.x);
      const y = Math.min(mode.startY, pos.y);
      const w = Math.abs(pos.x - mode.startX);
      const h = Math.abs(pos.y - mode.startY);
      if (w <= 1 || h <= 1 || !selectedLabel || !selectedImage) return;
      setSaving(true);
      createAnnotation({ imageId: selectedImage.id, labelId: selectedLabel.id, x, y, w, h }).then((ann) => {
        const next = [...currentAnnotationsRef.current, ann];
        setAnnotations(next);
        pushHistory(next);
        setAnnotationCounts((prev) => ({ ...prev, [selectedImage.id]: (prev[selectedImage.id] ?? 0) + 1 }));
        setSaving(false);
      });
    } else if (mode.type === 'move') {
      const pos = getRelativePos(e);
      const dx = pos.x - mode.startMx;
      const dy = pos.y - mode.startMy;
      const finalAnns = currentAnnotationsRef.current.map((a) =>
        a.id === mode.annId ? { ...a, x: mode.origX + dx, y: mode.origY + dy } : a
      );
      setAnnotations(finalAnns);
      pushHistory(finalAnns);
      updateAnnotation(mode.annId, { x: mode.origX + dx, y: mode.origY + dy });
    } else if (mode.type === 'resize') {
      const pos = getRelativePos(e);
      const dx = pos.x - mode.startMx;
      const dy = pos.y - mode.startMy;
      let x = mode.origX, y = mode.origY, w = mode.origW, h = mode.origH;
      if (mode.corner === 'tl') { x = mode.origX + dx; y = mode.origY + dy; w = mode.origW - dx; h = mode.origH - dy; }
      else if (mode.corner === 'tr') { y = mode.origY + dy; w = mode.origW + dx; h = mode.origH - dy; }
      else if (mode.corner === 'bl') { x = mode.origX + dx; w = mode.origW - dx; h = mode.origH + dy; }
      else if (mode.corner === 'br') { w = mode.origW + dx; h = mode.origH + dy; }
      if (w > 1 && h > 1) {
        const finalAnns = currentAnnotationsRef.current.map((a) =>
          a.id === mode.annId ? { ...a, x, y, w, h } : a
        );
        setAnnotations(finalAnns);
        pushHistory(finalAnns);
        updateAnnotation(mode.annId, { x, y, w, h });
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedLabel || !selectedImage) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    dragModeRef.current = { type: 'draw', startX: pos.x, startY: pos.y };
    setPreviewBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setSelectedBoxId(null);
  };

  const handleBoxMouseDown = (e: React.MouseEvent, ann: Annotation) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedBoxId(ann.id);
    const pos = getRelativePos(e);
    dragModeRef.current = { type: 'move', annId: ann.id, startMx: pos.x, startMy: pos.y, origX: ann.x, origY: ann.y };
  };

  const handleCornerMouseDown = (e: React.MouseEvent, ann: Annotation, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    e.stopPropagation();
    e.preventDefault();
    const pos = getRelativePos(e);
    dragModeRef.current = { type: 'resize', annId: ann.id, corner, startMx: pos.x, startMy: pos.y, origX: ann.x, origY: ann.y, origW: ann.w, origH: ann.h };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const mode = dragModeRef.current;
    if (!mode) return;
    const pos = getRelativePos(e);
    if (mode.type === 'draw') {
      setPreviewBox({
        x: Math.min(mode.startX, pos.x),
        y: Math.min(mode.startY, pos.y),
        w: Math.abs(pos.x - mode.startX),
        h: Math.abs(pos.y - mode.startY),
      });
    } else if (mode.type === 'move') {
      const dx = pos.x - mode.startMx;
      const dy = pos.y - mode.startMy;
      setAnnotations(
        currentAnnotationsRef.current.map((a) =>
          a.id === mode.annId ? { ...a, x: mode.origX + dx, y: mode.origY + dy } : a
        )
      );
    } else if (mode.type === 'resize') {
      const dx = pos.x - mode.startMx;
      const dy = pos.y - mode.startMy;
      let x = mode.origX, y = mode.origY, w = mode.origW, h = mode.origH;
      if (mode.corner === 'tl') { x = mode.origX + dx; y = mode.origY + dy; w = mode.origW - dx; h = mode.origH - dy; }
      else if (mode.corner === 'tr') { y = mode.origY + dy; w = mode.origW + dx; h = mode.origH - dy; }
      else if (mode.corner === 'bl') { x = mode.origX + dx; w = mode.origW - dx; h = mode.origH + dy; }
      else if (mode.corner === 'br') { w = mode.origW + dx; h = mode.origH + dy; }
      if (w > 1 && h > 1) {
        setAnnotations(
          currentAnnotationsRef.current.map((a) =>
            a.id === mode.annId ? { ...a, x, y, w, h } : a
          )
        );
      }
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => finalizeDrag(e);

  const handleCanvasMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragModeRef.current?.type === 'draw') {
      dragModeRef.current = null;
      setPreviewBox(null);
    } else {
      finalizeDrag(e);
    }
  };

  const handleDeleteAnnotation = (annId: number) => {
    if (!selectedImage) return;
    deleteAnnotation(annId).then(() => {
      const next = currentAnnotationsRef.current.filter((a) => a.id !== annId);
      setAnnotations(next);
      pushHistory(next);
      setAnnotationCounts((prev) => ({ ...prev, [selectedImage.id]: Math.max(0, (prev[selectedImage.id] ?? 1) - 1) }));
    });
  };

  const handleSubmit = () => {
    if (!taskId) return;
    // Validate: every image must have at least 1 annotation
    const unlabeled = images.filter((img) => (annotationCounts[img.id] ?? 0) === 0);
    if (unlabeled.length > 0) {
      setSubmitError(`Vẫn còn ${unlabeled.length} ảnh chưa gán nhãn. Vui lòng gán nhãn tất cả ảnh trước khi nộp.`);
      return;
    }
    if (!window.confirm('Bạn có chắc muốn nộp task? Sau khi nộp bạn sẽ không thể chỉnh sửa thêm.')) return;
    setSubmitting(true);
    submitTask(Number(taskId)).then(() => {
      navigate('/my-tasks');
    }).catch((err: any) => {
      setSubmitting(false);
      setSubmitError(err.response?.data?.message || 'Lỗi nộp task');
    });
  };

  const handleApproveTask = () => {
    if (!taskId) return;
    if (!window.confirm('Bạn có chắc muốn phê duyệt task này?')) return;
    setSubmitting(true);
    submitReview({ taskId: Number(taskId), status: 'APPROVED' }).then(() => {
      navigate('/review');
    }).catch((err: any) => {
      setSubmitting(false);
      setSubmitError(err.response?.data?.message || 'Lỗi phê duyệt task');
    });
  };

  const handleRejectTask = () => {
    if (!errorCategory) {
      setSubmitError('Vui lòng chọn loại lỗi');
      return;
    }
    if (!taskId) return;
    setSubmitting(true);
    submitReview({
      taskId: Number(taskId),
      status: 'REJECTED',
      errorCategory,
      comment: rejectionNote,
    }).then(() => {
      setOpenRejectDialog(false);
      navigate('/review');
    }).catch((err: any) => {
      setSubmitting(false);
      setSubmitError(err.response?.data?.message || 'Lỗi từ chối task');
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
            navigate(isReviewerOrAdmin ? '/review' : '/my-tasks');
          }}
        >
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Workspace gán nhãn — Task #{taskId}
        </Typography>
        <Box ml="auto" display="flex" alignItems="center" gap={1}>
          {saving && (
            <Box display="flex" alignItems="center" gap={1} mr={1}>
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">Đang lưu...</Typography>
            </Box>
          )}
          <Tooltip title="Hoàn tác (Ctrl+Z)">
            <span>
              <Button
                size="small"
                variant="outlined"
                disabled={!canUndo}
                onClick={() => { if (historyIndexRef.current > 0) applySnapshot(historyIndexRef.current - 1); }}
                sx={{ minWidth: 36, px: 1 }}
              >
                <UndoIcon fontSize="small" />
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Làm lại (Ctrl+Y)">
            <span>
              <Button
                size="small"
                variant="outlined"
                disabled={!canRedo}
                onClick={() => { if (historyIndexRef.current < historyRef.current.length - 1) applySnapshot(historyIndexRef.current + 1); }}
                sx={{ minWidth: 36, px: 1 }}
              >
                <RedoIcon fontSize="small" />
              </Button>
            </span>
          </Tooltip>
          {!loading && images.length > 0 && (
            isReviewerOrAdmin ? (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={submitting || saving}
                  onClick={() => setOpenRejectDialog(true)}
                  startIcon={<CloseIcon />}
                  sx={{ ml: 1, px: 2 }}
                >
                  Từ chối
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  disabled={submitting || saving}
                  onClick={handleApproveTask}
                  startIcon={<CheckIcon />}
                  sx={{ ml: 1, px: 2 }}
                >
                  {submitting ? <CircularProgress size={18} color="inherit" /> : 'Phê duyệt'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                disabled={submitting || saving}
                onClick={handleSubmit}
                sx={{ ml: 1 }}
              >
                {submitting ? <CircularProgress size={18} color="inherit" /> : 'Nộp task'}
              </Button>
            )
          )}
        </Box>
      </Box>

      {/* TOOLBAR */}
      {!loading && (
        <AnnotationToolbar
          labels={labels}
          selectedLabel={selectedLabel}
          onLabelChange={setSelectedLabel}
        />
      )}

      {submitError && (
        <Alert severity="error" onClose={() => setSubmitError(null)} sx={{ mb: 1 }}>
          {submitError}
        </Alert>
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
                onClick={() => { setAnnotations([]); setSelectedImage(img); }}
                sx={{ position: 'relative', cursor: 'pointer' }}
              >
                <ImageWithAuth
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

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flex={1}
              overflow="hidden"
            >
            {selectedImage ? (
                <Box
                  ref={canvasRef}
                  position="relative"
                  display="inline-block"
                  maxWidth="100%"
                  sx={{
                    userSelect: 'none',
                    cursor: selectedLabel ? 'crosshair' : 'default',
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                >
                  {/* Base image */}
                  <ImageWithAuth
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    draggable={false}
                    sx={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: 'calc(100vh - 260px)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Saved annotations */}
                  {currentAnnotations.map((ann) => {
                    const color = getColor(ann.labelId);
                    const isSelected = selectedBoxId === ann.id;
                    return (
                      <Box
                        key={ann.id}
                        onMouseDown={(e) => handleBoxMouseDown(e, ann)}
                        onContextMenu={(e) => { e.preventDefault(); handleDeleteAnnotation(ann.id); }}
                        sx={{
                          position: 'absolute',
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          width: `${ann.w}%`,
                          height: `${ann.h}%`,
                          border: `${isSelected ? 3 : 2}px solid ${color}`,
                          outline: isSelected ? '2px solid rgba(255,255,255,0.55)' : 'none',
                          outlineOffset: '-2px',
                          cursor: 'move',
                          pointerEvents: 'auto',
                          boxSizing: 'border-box',
                          '&:hover': {
                            border: `3px solid ${color}`,
                            outline: `2px solid rgba(255,255,255,0.45)`,
                            outlineOffset: '-2px',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            position: 'absolute',
                            top: -20,
                            left: -2,
                            fontSize: 11,
                            lineHeight: '18px',
                            bgcolor: color,
                            color: '#fff',
                            px: 0.6,
                            borderRadius: '3px 3px 0 0',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                          }}
                        >
                          {labels.find((l) => l.id === ann.labelId)?.name ?? ''}
                        </Typography>
                        {isSelected && (
                          <Box
                            onMouseDown={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id); }}
                            title="Xóa box"
                            sx={{
                              position: 'absolute',
                              top: -22,
                              right: -2,
                              width: 18,
                              height: 18,
                              bgcolor: '#d32f2f',
                              color: '#fff',
                              borderRadius: '3px 3px 0 0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#b71c1c' },
                            }}
                          >
                            <DeleteForeverIcon sx={{ fontSize: 13 }} />
                          </Box>
                        )}
                        {isSelected && CORNER_HANDLES.map(({ key, cursor, sx }) => (
                          <Box
                            key={key}
                            onMouseDown={(e) => handleCornerMouseDown(e, ann, key)}
                            sx={{
                              position: 'absolute',
                              width: 8,
                              height: 8,
                              bgcolor: '#fff',
                              border: `2px solid ${color}`,
                              borderRadius: '50%',
                              cursor,
                              ...sx,
                            }}
                          />
                        ))}
                      </Box>
                    );
                  })}

                  {/* Live preview box while drawing */}
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

      {/* Reject Task Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Vui lòng chọn loại lỗi và để lại ghi chú cho Annotator biết nguyên nhân task bị từ chối.
          </Typography>
          <TextField
             select
             label="Loại lỗi (Bắt buộc)"
             fullWidth
             value={errorCategory}
             onChange={(e) => {
               setErrorCategory(e.target.value);
               setSubmitError(null);
             }}
             sx={{ mb: 2 }}
          >
             <MenuItem value="Vẽ thiếu (Missing box)">Vẽ thiếu (Missing box)</MenuItem>
             <MenuItem value="Vẽ lệch/Rộng/Hẹp quá">Vẽ lệch/Rộng/Hẹp quá</MenuItem>
             <MenuItem value="Gán sai nhãn (Wrong label)">Gán sai nhãn (Wrong label)</MenuItem>
             <MenuItem value="Lỗi khác">Lỗi khác</MenuItem>
          </TextField>
          <TextField
             label="Ghi chú chi tiết (Tùy chọn)"
             fullWidth
             multiline
             rows={3}
             value={rejectionNote}
             onChange={(e) => setRejectionNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleRejectTask} disabled={submitting}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Xác nhận từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnotationPage;
