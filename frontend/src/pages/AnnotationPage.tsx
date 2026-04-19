import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  AlertTitle,
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
  Stack,
  IconButton,
  Chip,
  alpha,
  useTheme,
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
import type { PointDTO } from '../types/annotation';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProjectById } from '../api/projectApi';
import type { Project } from '../types/project';

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
  const theme = useTheme();
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    borderRadius: 4,
  };
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<any>(null);
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
  const [tool, setTool] = useState<'BOX' | 'POLYGON'>('BOX');
  const [activePoints, setActivePoints] = useState<PointDTO[]>([]);
  const [mousePos, setMousePos] = useState<PointDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const isReviewerOrAdmin = user?.role === 'REVIEWER' || user?.role === 'ADMIN';
  const isReadOnly = user?.role === 'REVIEWER' || task?.status === 'APPROVED';

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [errorCategory, setErrorCategory] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');

  const [openGuidelineDialog, setOpenGuidelineDialog] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

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
    Promise.all([getTaskImages(id), getTaskById(id)]).then(([imgs, t]) => {
      const formattedImgs = imgs.map(img => ({
        ...img,
        thumbnailUrl: img.thumbnailUrl || img.url // fallback
      }));
      setImages(formattedImgs);
      setTask(t);
      if (t) {
        getProjectById(t.projectId).then(p => setProject(p ?? null));
        getLabelsByProject(t.projectId).then((lbls) => {
          setLabels(lbls);
          if (lbls.length > 0) setSelectedLabel(lbls[0]);
        });
      }
      Promise.all(imgs.map((img) => getAnnotationsByImage(img.id))).then((results) => {
        const counts: Record<number, number> = {};
        results.forEach((anns, i) => { counts[imgs[i].id] = anns.length; });
        setAnnotationCounts(counts);
        if (formattedImgs.length > 0) {
          setSelectedImage(formattedImgs[0]);
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
      createAnnotation({ imageId: selectedImage.id, labelId: selectedLabel.id, x, y, w, h, type: 'BOX' }).then((ann) => {
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
    if (isReadOnly || !selectedLabel || !selectedImage) return;
    e.preventDefault();
    const pos = getRelativePos(e);

    if (tool === 'BOX') {
        dragModeRef.current = { type: 'draw', startX: pos.x, startY: pos.y };
        setPreviewBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
        setSelectedBoxId(null);
    } else {
        // POLYGON logic
        setActivePoints(prev => [...prev, pos]);
        setSelectedBoxId(null);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isReadOnly || tool !== 'POLYGON' || activePoints.length < 3 || !selectedLabel || !selectedImage) return;
    e.preventDefault();
    e.stopPropagation();

    // Finalize polygon
    const points = [...activePoints];
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const w = Math.max(...xs) - x;
    const h = Math.max(...ys) - y;

    setSaving(true);
    createAnnotation({
      imageId: selectedImage.id,
      labelId: selectedLabel.id,
      type: 'POLYGON',
      points,
      x, y, w, h
    }).then(ann => {
      const next = [...currentAnnotationsRef.current, ann];
      setAnnotations(next);
      pushHistory(next);
      setAnnotationCounts(prev => ({ ...prev, [selectedImage.id]: (prev[selectedImage.id] ?? 0) + 1 }));
      setActivePoints([]);
      setSaving(false);
    });
  };

  const handleBoxMouseDown = (e: React.MouseEvent, ann: Annotation) => {
    if (isReadOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedBoxId(ann.id);
    const pos = getRelativePos(e);
    dragModeRef.current = { type: 'move', annId: ann.id, startMx: pos.x, startMy: pos.y, origX: ann.x, origY: ann.y };
  };

  const handleCornerMouseDown = (e: React.MouseEvent, ann: Annotation, corner: 'tl' | 'tr' | 'bl' | 'br') => {
    if (isReadOnly) return;
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
    if (isReadOnly || !selectedImage) return;
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
      <Box display="flex" alignItems="center" gap={2} mb={2} sx={{ py: 1, px: 2, bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(8px)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.2)' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => {
            navigate(isReviewerOrAdmin ? '/review' : '/my-tasks');
          }}
          sx={{ borderRadius: 2, fontWeight: 'bold' }}
        >
          Thoát
        </Button>
        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ color: 'primary.main', opacity: 0.7 }}>Workspace</Box>
          <Box component="span" sx={{ px: 1, py: 0.2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>Task #{taskId}</Box>
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {saving && (
            <Box display="flex" alignItems="center" gap={1} mr={1}>
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">Đang lưu...</Typography>
            </Box>
          )}
          {!isReadOnly && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Hoàn tác (Ctrl+Z)">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canUndo}
                    onClick={() => { if (historyIndexRef.current > 0) applySnapshot(historyIndexRef.current - 1); }}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1, border: '1px solid', borderColor: 'divider' }}
                  >
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Làm lại (Ctrl+Y)">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canRedo}
                    onClick={() => { if (historyIndexRef.current < historyRef.current.length - 1) applySnapshot(historyIndexRef.current + 1); }}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1, border: '1px solid', borderColor: 'divider' }}
                  >
                    <RedoIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
          {!loading && images.length > 0 && (
            isReviewerOrAdmin ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={submitting || saving}
                  onClick={() => setOpenRejectDialog(true)}
                  startIcon={<CloseIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Từ chối
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  disabled={submitting || saving}
                  onClick={handleApproveTask}
                  startIcon={<CheckIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)' }}
                >
                  {submitting ? <CircularProgress size={18} color="inherit" /> : 'Phê duyệt'}
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                color="primary"
                disabled={submitting || saving}
                onClick={handleSubmit}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', px: 4, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' }}
              >
                {submitting ? <CircularProgress size={18} color="inherit" /> : 'Nộp Task'}
              </Button>
            )
          )}
          <Tooltip title="Xem hướng dẫn gán nhãn">
            <IconButton
              size="small"
              color="info"
              onClick={() => setOpenGuidelineDialog(true)}
              sx={{ ml: 1, bgcolor: alpha(theme.palette.info.main, 0.1) }}
            >
              <HelpOutlineIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {task?.status === 'REJECTED' && (
        <Alert 
          severity="error" 
          variant="outlined"
          sx={{ mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.02) }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>Thông báo: Task bị từ chối</AlertTitle>
          <Typography variant="body2"><strong>Lý do:</strong> {task.errorCategory || '—'} | <strong>Ghi chú từ reviewer:</strong> {task.comment || '—'}</Typography>
        </Alert>
      )}

      {/* TOOLBAR */}
      {!loading && !isReadOnly && (
        <Paper sx={{ ...glassStyle, p: 1.5, mb: 2, display: 'flex', alignItems: 'center' }}>
          <AnnotationToolbar
            labels={labels}
            selectedLabel={selectedLabel}
            onLabelChange={setSelectedLabel}
            tool={tool}
            onToolChange={(t) => {
              setTool(t);
              setActivePoints([]);
              setPreviewBox(null);
            }}
          />
        </Paper>
      )}

      {submitError && (
        <Alert severity="error" variant="filled" onClose={() => setSubmitError(null)} sx={{ mb: 2, borderRadius: 2 }}>
          {submitError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : images.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>Không có mục dữ liệu nào để hiển thị.</Typography>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
          {/* LEFT PANEL — thumbnail list */}
          <Paper
            sx={{
              ...glassStyle,
              width: 180,
              flexShrink: 0,
              overflowY: 'auto',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
              Dữ liệu nguồn ({images.length})
            </Typography>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {images.map((img) => (
              <Box
                key={img.id}
                onClick={() => { setAnnotations([]); setSelectedImage(img); }}
                sx={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
              >
                <ImageWithAuth
                  src={img.thumbnailUrl}
                  alt={img.name}
                  sx={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 2,
                    display: 'block',
                    border: '3px solid',
                    borderColor: selectedImage?.id === img.id ? 'primary.main' : 'transparent',
                    boxShadow: selectedImage?.id === img.id ? 4 : 0,
                  }}
                />
                {(annotationCounts[img.id] ?? 0) > 0 && (
                  <Chip
                    label={annotationCounts[img.id]}
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute', top: 5, right: 5, height: 20, fontSize: 10, fontWeight: 'bold',
                      boxShadow: 2, pointerEvents: 'none'
                    }}
                  />
                )}
              </Box>
            ))}
          </Paper>

          {/* RIGHT PANEL — annotation canvas */}
          <Paper
            sx={{
              ...glassStyle,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              p: 1,
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
                    cursor: (isReadOnly || !selectedLabel) ? 'default' : 'crosshair',
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                  onDoubleClick={handleDoubleClick}
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
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    {currentAnnotations.map((ann) => {
                      const color = getColor(ann.labelId);
                      const isSelected = selectedBoxId === ann.id;
                      
                      if (ann.type === 'POLYGON' && ann.points) {
                        const pointsStr = ann.points.map(p => `${p.x},${p.y}`).join(' ');
                        return (
                          <g key={ann.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                             onMouseDown={(e) => { e.stopPropagation(); setSelectedBoxId(ann.id); }}
                             onContextMenu={(e) => { e.preventDefault(); handleDeleteAnnotation(ann.id); }}>
                            <polygon
                              points={pointsStr}
                              style={{
                                fill: color,
                                fillOpacity: isSelected ? 0.3 : 0.15,
                                stroke: color,
                                strokeWidth: isSelected ? 0.8 : 0.4,
                              }}
                            />
                            <foreignObject
                                x={Math.min(...ann.points.map(p => p.x))}
                                y={Math.min(...ann.points.map(p => p.y))}
                                width="30"
                                height="10"
                                style={{ overflow: 'visible' }}
                            >
                              <div style={{
                                backgroundColor: color,
                                color: 'white',
                                fontSize: '2px',
                                padding: '0 1px',
                                borderRadius: '0.5px',
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                transform: 'translateY(-110%)'
                              }}>
                                {labels.find(l => l.id === ann.labelId)?.name}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      }
                      return null;
                    })}

                    {/* Drawing polygon live preview */}
                    {tool === 'POLYGON' && activePoints.length > 0 && (
                      <g>
                        <polyline
                          points={activePoints.map(p => `${p.x},${p.y}`).join(' ')}
                          style={{ fill: 'none', stroke: selectedLabel?.color || '#000', strokeWidth: 0.5, strokeDasharray: '1' }}
                        />
                        {mousePos && (
                          <line
                            x1={activePoints[activePoints.length - 1].x}
                            y1={activePoints[activePoints.length - 1].y}
                            x2={mousePos.x}
                            y2={mousePos.y}
                            style={{ stroke: selectedLabel?.color || '#000', strokeWidth: 0.4, strokeDasharray: '1' }}
                          />
                        )}
                      </g>
                    )}
                  </svg>

                  {currentAnnotations.map((ann) => {
                    if (ann.type === 'POLYGON') return null; // Handled by SVG above
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
                          cursor: isReadOnly ? 'default' : 'move',
                          pointerEvents: 'auto',
                          boxSizing: 'border-box',
                          zIndex: 11,
                          '&:hover': !isReadOnly ? {
                            border: `3px solid ${color}`,
                            outline: `2px solid rgba(255,255,255,0.45)`,
                            outlineOffset: '-2px',
                          } : {},
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
                        {isSelected && !isReadOnly && (
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
                        {isSelected && !isReadOnly && CORNER_HANDLES.map(({ key, cursor, sx }) => (
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
                  {previewBox && selectedLabel && tool === 'BOX' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${previewBox.x}%`,
                        top: `${previewBox.y}%`,
                        width: `${previewBox.w}%`,
                        height: `${previewBox.h}%`,
                        border: `2px dashed ${selectedLabel.color}`,
                        pointerEvents: 'none',
                        zIndex: 20,
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

      {/* Guideline Dialog */}
      <Dialog open={openGuidelineDialog} onClose={() => setOpenGuidelineDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpOutlineIcon color="info" />
          Hướng dẫn dự án: {project?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ 
            '& p': { my: 1.5 },
            '& ul, & ol': { pl: 3 },
            '& h1, & h2, & h3': { mt: 2.5, mb: 1 },
            '& code': { bgcolor: 'grey.100', p: '2px 4px', borderRadius: '4px', fontSize: '0.9em' },
            '& blockquote': { borderLeft: '4px solid', borderColor: 'grey.300', pl: 2, m: '15px 0', color: 'text.secondary' },
            '& img': { maxWidth: '100%' }
          }}>
            {project?.guideline ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.guideline}
              </ReactMarkdown>
            ) : (
              <Typography color="text.secondary">Dự án này chưa có hướng dẫn chi tiết.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGuidelineDialog(false)} variant="contained">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnotationPage;
