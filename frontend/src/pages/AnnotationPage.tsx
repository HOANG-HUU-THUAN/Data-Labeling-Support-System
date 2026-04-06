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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import Tooltip from '@mui/material/Tooltip';
import { getTaskImages } from '../mock/annotatorMock';
import type { AnnotationImage } from '../mock/annotatorMock';
import { getTaskById } from '../mock/taskMock';
import { getLabelsByProject } from '../mock/labelMock';
import type { Label } from '../types/label';
import {
  getAnnotationsByImage,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  lockImage,
  unlockImage,
  replaceAnnotationsForImage,
} from '../mock/annotationMock';
import type { Annotation, AnnotationType, Point } from '../types/annotation';
import { autoLabel } from '../mock/aiMock';
import type { AiSuggestion } from '../mock/aiMock';
import AnnotationToolbar from '../components/AnnotationToolbar';
import useAuthStore from '../store/authStore';
import { submitTask } from '../mock/taskMock';

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
  // selected box + drag
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const dragModeRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewBox, setPreviewBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [task, setTask] = useState<import('../types/task').Task | null>(null);
  const [saving, setSaving] = useState(false);
  // AI suggestions
  const [suggestions, setSuggestions] = useState<(AiSuggestion & { tempId: number })[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  // Tool selection
  const [tool, setTool] = useState<AnnotationType>('bbox');
  // Polygon in-progress drawing
  const [polyPoints, setPolyPoints] = useState<Point[]>([]);
  const [polyCursor, setPolyCursor] = useState<Point | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    Promise.all([getTaskImages(id), getTaskById(id)]).then(([imgs, task]) => {
      setImages(imgs);
      if (task) setTask(task);
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
      if (e.key === 'Escape') {
        setPolyPoints([]);
        setPolyCursor(null);
        dragModeRef.current = null;
        setPreviewBox(null);
        return;
      }
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
      createAnnotation({ imageId: selectedImage.id, labelId: selectedLabel.id, type: 'bbox', x, y, w, h }).then((ann) => {
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

  // Cancel polygon in progress (e.g. when switching image / tool)
  const cancelPolygon = () => {
    setPolyPoints([]);
    setPolyCursor(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked || !selectedLabel || !selectedImage) return;
    if (tool === 'polygon') return; // polygon uses click, not mousedown drag
    e.preventDefault();
    const pos = getRelativePos(e);
    dragModeRef.current = { type: 'draw', startX: pos.x, startY: pos.y };
    setPreviewBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setSelectedBoxId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== 'polygon' || isLocked || !selectedLabel || !selectedImage) return;
    if (e.detail === 2) return; // double-click handled separately
    e.preventDefault();
    const pos = getRelativePos(e);
    setPolyPoints((prev) => [...prev, pos]);
    setSelectedBoxId(null);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== 'polygon' || isLocked || !selectedLabel || !selectedImage) return;
    e.preventDefault();
    const pts = polyPoints;
    if (pts.length < 3) { cancelPolygon(); return; }
    // Compute bounding box for bbox fallback fields
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const x = Math.min(...xs), y = Math.min(...ys);
    const w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    cancelPolygon();
    setSaving(true);
    createAnnotation({
      imageId: selectedImage.id,
      labelId: selectedLabel.id,
      type: 'polygon',
      points: pts,
      x, y, w, h,
    }).then((ann) => {
      const next = [...currentAnnotationsRef.current, ann];
      setAnnotations(next);
      pushHistory(next);
      setAnnotationCounts((prev) => ({ ...prev, [selectedImage.id]: (prev[selectedImage.id] ?? 0) + 1 }));
      setSaving(false);
    });
  };

  const handleBoxMouseDown = (e: React.MouseEvent, ann: Annotation) => {
    if (isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedBoxId(ann.id);
    const pos = getRelativePos(e);
    dragModeRef.current = { type: 'move', annId: ann.id, startMx: pos.x, startMy: pos.y, origX: ann.x, origY: ann.y };
  };

  const handleCornerMouseDown = (e: React.MouseEvent, ann: Annotation, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    if (isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    const pos = getRelativePos(e);
    dragModeRef.current = { type: 'resize', annId: ann.id, corner, startMx: pos.x, startMy: pos.y, origX: ann.x, origY: ann.y, origW: ann.w, origH: ann.h };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === 'polygon') {
      if (polyPoints.length > 0) setPolyCursor(getRelativePos(e));
      return;
    }
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
    if (tool === 'polygon') {
      setPolyCursor(null);
      return;
    }
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

  const handleAutoLabel = () => {
    if (!selectedImage || labels.length === 0 || isLocked) return;
    setAiLoading(true);
    setSuggestions([]);
    autoLabel(selectedImage.id, labels.map((l) => l.id))
      .then((results) => {
        let tid = -1;
        setSuggestions(results.map((r) => ({ ...r, tempId: tid-- })));
        setAiLoading(false);
      })
      .catch(() => setAiLoading(false));
  };

  const handleAcceptSuggestion = (sug: AiSuggestion & { tempId: number }) => {
    if (!selectedImage || isLocked) return;
    const { tempId, ...sugData } = sug;
    setSaving(true);
    createAnnotation({ ...sugData, imageId: selectedImage.id }).then((ann) => {
      const next = [...currentAnnotationsRef.current, ann];
      setAnnotations(next);
      pushHistory(next);
      setAnnotationCounts((prev) => ({ ...prev, [selectedImage.id]: (prev[selectedImage.id] ?? 0) + 1 }));
      setSuggestions((prev) => prev.filter((s) => s.tempId !== tempId));
      setSaving(false);
    });
  };

  const handleIgnoreSuggestion = (tempId: number) => {
    setSuggestions((prev) => prev.filter((s) => s.tempId !== tempId));
  };

  const handleAcceptAll = () => {
    if (!selectedImage || isLocked || suggestions.length === 0) return;
    setSaving(true);
    Promise.all(
      suggestions.map((sug) =>
        createAnnotation({
          imageId: selectedImage.id,
          labelId: sug.labelId,
          type: sug.type,
          x: sug.x,
          y: sug.y,
          w: sug.w,
          h: sug.h,
          ...(sug.points ? { points: sug.points } : {}),
        }),
      ),
    ).then((anns) => {
      const next = [...currentAnnotationsRef.current, ...anns];
      setAnnotations(next);
      pushHistory(next);
      setAnnotationCounts((prev) => ({
        ...prev,
        [selectedImage.id]: (prev[selectedImage.id] ?? 0) + anns.length,
      }));
      setSuggestions([]);
      setSaving(false);
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
    if (lockedImageRef.current !== null) unlockImage(lockedImageRef.current);
    submitTask(Number(taskId)).then(() => {
      navigate('/my-tasks');
    }).catch(() => setSubmitting(false));
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
            <Button
              variant="contained"
              color="primary"
              disabled={submitting || saving}
              onClick={handleSubmit}
              sx={{ ml: 1 }}
            >
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Nộp task'}
            </Button>
          )}
        </Box>
      </Box>

      {/* TOOLBAR */}
      {!loading && (
        <AnnotationToolbar
          labels={labels}
          selectedLabel={selectedLabel}
          onLabelChange={setSelectedLabel}
          tool={tool}
          onToolChange={(t) => { setTool(t); cancelPolygon(); setPreviewBox(null); dragModeRef.current = null; }}
          onAutoLabel={handleAutoLabel}
          aiLoading={aiLoading}
          hasImage={!!selectedImage && !isLocked}
        />
      )}

      {!loading && suggestions.length > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 1, py: 0.5 }}
          action={
            <Box display="flex" gap={1} alignItems="center">
              <Button size="small" variant="contained" color="success" onClick={handleAcceptAll} disabled={saving} sx={{ whiteSpace: 'nowrap' }}>
                Chấp nhận tất cả ({suggestions.length})
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => setSuggestions([])} sx={{ whiteSpace: 'nowrap' }}>
                Bỏ qua tất cả
              </Button>
            </Box>
          }
        >
          AI đề xuất {suggestions.length} nhãn. Xét từng nhãn bên dưới hoặc chấp nhận/bỏ qua tất cả.
        </Alert>
      )}

      {task?.status === 'REJECTED' && (
        <Alert
          severity="warning"
          sx={{
            mb: 1,
            bgcolor: '#fff3cd',
            border: '1px solid #ffc107',
            '& .MuiAlert-icon': { color: '#856404' },
          }}
        >
          <Typography variant="body2" fontWeight={700} mb={0.5}>
            Task bị từ chối
          </Typography>
          {task.errorType && (
            <Typography variant="body2">
              <strong>Loại lỗi:</strong> {task.errorType}
            </Typography>
          )}
          {task.reviewComment && (
            <Typography variant="body2">
              <strong>Nhận xét:</strong> {task.reviewComment}
            </Typography>
          )}
        </Alert>
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
                onClick={() => { setAnnotations([]); setSelectedImage(img); cancelPolygon(); setSuggestions([]); }}
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
                <Box
                  ref={canvasRef}
                  position="relative"
                  display="inline-block"
                  maxWidth="100%"
                  sx={{
                    userSelect: 'none',
                    cursor: isLocked ? 'default' : selectedLabel ? 'crosshair' : 'default',
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                  onClick={handleCanvasClick}
                  onDoubleClick={handleCanvasDoubleClick}
                >
                  {/* Base image */}
                  <Box
                    component="img"
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

                  {/* SVG overlay — polygons + in-progress drawing */}
                  <svg
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      overflow: 'visible',
                    }}
                  >
                    {/* Saved polygon annotations */}
                    {currentAnnotations
                      .filter((ann) => ann.type === 'polygon' && ann.points && ann.points.length >= 2)
                      .map((ann) => {
                        const color = getColor(ann.labelId);
                        const isSelected = selectedBoxId === ann.id;
                        const pts = ann.points!;
                        const pointsStr = pts.map((p) => `${p.x}%,${p.y}%`).join(' ');
                        const labelName = labels.find((l) => l.id === ann.labelId)?.name ?? '';
                        return (
                          <g key={ann.id}>
                            <polygon
                              points={pointsStr}
                              fill={color + '33'}
                              stroke={color}
                              strokeWidth={isSelected ? 3 : 2}
                              strokeDasharray={isSelected ? undefined : undefined}
                              style={{ cursor: isLocked ? 'default' : 'pointer', pointerEvents: 'all' }}
                              onClick={(e) => { e.stopPropagation(); setSelectedBoxId(ann.id); }}
                              onContextMenu={(e) => { e.preventDefault(); if (!isLocked) handleDeleteAnnotation(ann.id); }}
                            />
                            {/* Vertex dots */}
                            {pts.map((p, i) => (
                              <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={isSelected ? 5 : 3} fill={color} stroke="#fff" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
                            ))}
                            {/* Label badge at first point */}
                            <text
                              x={`${pts[0].x}%`}
                              y={`${pts[0].y}%`}
                              dy="-6"
                              fontSize={11}
                              fill="#fff"
                              style={{ pointerEvents: 'none' }}
                            >
                              <tspan
                                style={{
                                  fill: color,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: color,
                                }}
                              >
                                {labelName}
                              </tspan>
                            </text>
                            {/* Delete button when selected */}
                            {isSelected && !isLocked && (
                              <g
                                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                                onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id); }}
                              >
                                <circle cx={`${pts[0].x}%`} cy={`${pts[0].y}%`} r={9} fill="#d32f2f" />
                                <text x={`${pts[0].x}%`} y={`${pts[0].y}%`} textAnchor="middle" dy="4" fontSize={12} fill="#fff" style={{ pointerEvents: 'none' }}>×</text>
                              </g>
                            )}
                          </g>
                        );
                      })}

                    {/* In-progress polygon */}
                    {polyPoints.length > 0 && selectedLabel && (() => {
                      const color = selectedLabel.color;
                      const allPts = polyCursor ? [...polyPoints, polyCursor] : polyPoints;
                      const lineStr = allPts.map((p) => `${p.x}%,${p.y}%`).join(' ');
                      return (
                        <g>
                          <polyline
                            points={lineStr}
                            fill="none"
                            stroke={color}
                            strokeWidth={2}
                            strokeDasharray="6 3"
                          />
                          {/* Closing preview line */}
                          {polyCursor && (
                            <line
                              x1={`${polyCursor.x}%`}
                              y1={`${polyCursor.y}%`}
                              x2={`${polyPoints[0].x}%`}
                              y2={`${polyPoints[0].y}%`}
                              stroke={color}
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              opacity={0.5}
                            />
                          )}
                          {/* Vertex dots */}
                          {polyPoints.map((p, i) => (
                            <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
                          ))}
                        </g>
                      );
                    })()}

                    {/* AI polygon suggestions */}
                    {suggestions
                      .filter((sug) => sug.type === 'polygon' && sug.points && sug.points.length >= 2)
                      .map((sug) => {
                        const color = getColor(sug.labelId);
                        const pts = sug.points!;
                        const pointsStr = pts.map((p) => `${p.x}%,${p.y}%`).join(' ');
                        return (
                          <g key={sug.tempId}>
                            <polygon
                              points={pointsStr}
                              fill={color + '22'}
                              stroke={color}
                              strokeWidth={2}
                              strokeDasharray="8 4"
                              opacity={0.85}
                              style={{ pointerEvents: 'none' }}
                            />
                            {pts.map((p, i) => (
                              <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={3} fill={color} stroke="#fff" strokeWidth={1} opacity={0.7} style={{ pointerEvents: 'none' }} />
                            ))}
                          </g>
                        );
                      })
                    }
                  </svg>

                  {/* Saved bbox annotations */}
                  {currentAnnotations.filter((ann) => !ann.type || ann.type === 'bbox').map((ann) => {
                    const color = getColor(ann.labelId);
                    const isSelected = selectedBoxId === ann.id;
                    return (
                      <Box
                        key={ann.id}
                        onMouseDown={(e) => handleBoxMouseDown(e, ann)}
                        onContextMenu={(e) => { e.preventDefault(); if (!isLocked) handleDeleteAnnotation(ann.id); }}
                        sx={{
                          position: 'absolute',
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          width: `${ann.w}%`,
                          height: `${ann.h}%`,
                          border: `${isSelected ? 3 : 2}px solid ${color}`,
                          outline: isSelected ? '2px solid rgba(255,255,255,0.55)' : 'none',
                          outlineOffset: '-2px',
                          cursor: isLocked ? 'default' : 'move',
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
                        {isSelected && !isLocked && (
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
                        {isSelected && !isLocked && CORNER_HANDLES.map(({ key, cursor, sx }) => (
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

                  {/* AI suggestion overlays — bbox frames + accept/ignore buttons for all types */}
                  {suggestions.map((sug) => {
                    const color = getColor(sug.labelId);
                    const labelName = labels.find((l) => l.id === sug.labelId)?.name ?? '';
                    return (
                      <Box
                        key={sug.tempId}
                        sx={{
                          position: 'absolute',
                          left: `${sug.x}%`,
                          top: `${sug.y}%`,
                          width: `${sug.w}%`,
                          height: `${sug.h}%`,
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                          ...(sug.type === 'bbox' && {
                            border: `2px dashed ${color}`,
                            bgcolor: `${color}15`,
                          }),
                        }}
                      >
                        {/* Badge + Accept / Ignore buttons */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -22,
                            left: -2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.3,
                            pointerEvents: 'auto',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                          }}
                        >
                          <Box sx={{ bgcolor: color, color: '#fff', fontSize: 10, px: 0.6, lineHeight: '18px', fontWeight: 700, borderRadius: '2px 0 0 0' }}>
                            AI · {labelName}
                          </Box>
                          <Box
                            onClick={(e) => { e.stopPropagation(); handleAcceptSuggestion(sug); }}
                            title="Chấp nhận"
                            sx={{ cursor: 'pointer', bgcolor: '#2e7d32', color: '#fff', fontSize: 13, px: 0.7, lineHeight: '18px', '&:hover': { bgcolor: '#1b5e20' } }}
                          >
                            ✓
                          </Box>
                          <Box
                            onClick={(e) => { e.stopPropagation(); handleIgnoreSuggestion(sug.tempId); }}
                            title="Bỏ qua"
                            sx={{ cursor: 'pointer', bgcolor: '#d32f2f', color: '#fff', fontSize: 13, px: 0.7, lineHeight: '18px', borderRadius: '0 2px 0 0', '&:hover': { bgcolor: '#b71c1c' } }}
                          >
                            ✕
                          </Box>
                        </Box>
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
    </Box>
  );
};

export default AnnotationPage;
