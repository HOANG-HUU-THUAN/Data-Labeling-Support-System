import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getReviewTaskDetail, approveTask, rejectTask, getAssigneeName } from '../mock/reviewerMock';
import type { ReviewTaskDetail } from '../mock/reviewerMock';
import type { AnnotationImage } from '../mock/annotatorMock';
import type { TaskStatus } from '../types/task';

const ERROR_TYPES = ['Sai label', 'Sai vị trí box', 'Thiếu annotation', 'Khác'];

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Chưa làm',
  IN_PROGRESS: 'Đang làm',
  SUBMITTED: 'Đã nộp',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

const STATUS_COLOR: Record<TaskStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  TODO: 'default',
  IN_PROGRESS: 'warning',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
};

const ReviewDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<ReviewTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<AnnotationImage | null>(null);
  const [visibleLabels, setVisibleLabels] = useState<Set<number>>(new Set());
  const canvasRef = useRef<HTMLDivElement>(null);

  // Approve / reject
  const [submitting, setSubmitting] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [errorType, setErrorType] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    getReviewTaskDetail(Number(taskId))
      .then((d) => {
        setDetail(d);
        setVisibleLabels(new Set(d.labels.map((l) => l.id)));
        if (d.images.length > 0) setSelectedImage(d.images[0]);
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  const toggleLabel = (labelId: number) => {
    setVisibleLabels((prev) => {
      const next = new Set(prev);
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      return next;
    });
  };

  const getColor = (labelId: number) =>
    detail?.labels.find((l) => l.id === labelId)?.color ?? '#9e9e9e';

  const getAnnotationCount = (imageId: number) =>
    detail?.annotations.filter((a) => a.imageId === imageId).length ?? 0;

  const visibleAnnotations = selectedImage
    ? (detail?.annotations ?? []).filter(
        (a) => a.imageId === selectedImage.id && visibleLabels.has(a.labelId)
      )
    : [];

  const handleApprove = () => {
    if (!taskId) return;
    if (!window.confirm('Bạn có chắc muốn duyệt task?')) return;
    setSubmitting(true);
    approveTask(Number(taskId))
      .then(() => navigate('/review'))
      .catch(() => setSubmitting(false));
  };

  const handleOpenReject = () => {
    setComment('');
    setErrorType('');
    setRejectError(null);
    setRejectOpen(true);
  };

  const handleSubmitReject = () => {
    if (!comment.trim()) { setRejectError('Vui lòng nhập nhận xét.'); return; }
    if (!errorType) { setRejectError('Vui lòng chọn loại lỗi.'); return; }
    if (!taskId) return;
    setSubmitting(true);
    rejectTask(Number(taskId), { comment: comment.trim(), errorType })
      .then(() => navigate('/review'))
      .catch(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" height="100%">
        {/* skeleton toolbar */}
        <Box display="flex" alignItems="center" gap={2} px={2} py={1.5} borderBottom="1px solid" sx={{ borderColor: 'divider' }}>
          <Skeleton variant="rounded" width={100} height={34} />
          <Skeleton variant="text" width={220} height={28} />
          <Box ml="auto" display="flex" gap={1.5}>
            <Skeleton variant="rounded" width={110} height={36} />
            <Skeleton variant="rounded" width={110} height={36} />
          </Box>
        </Box>
        <Box display="flex" flex={1} minHeight={0}>
          <Box sx={{ width: 220, p: 1.5, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" width="100%" height={110} />)}
          </Box>
          <Box flex={1} sx={{ bgcolor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: 'grey.600' }} />
          </Box>
          <Box sx={{ width: 260, p: 2, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[80, 120, 100].map((w, i) => <Skeleton key={i} variant="rounded" width="100%" height={w} />)}
          </Box>
        </Box>
      </Box>
    );
  }

  if (!detail) {
    return (
      <Typography color="error" mt={4} textAlign="center">
        Không tìm thấy task.
      </Typography>
    );
  }

  return (
    <>
      {/* ── TOP TOOLBAR ───────────────────────────────────── */}
      <Paper
        elevation={2}
        square
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.25,
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          variant="text"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/review')}
        >
          Quay lại
        </Button>
        <Divider orientation="vertical" flexItem />
        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ maxWidth: 340 }}>
          {detail.task.name}
        </Typography>
        <Box ml="auto" display="flex" gap={1.5}>
          <Button
            variant="contained"
            color="success"
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />
            }
            disabled={submitting}
            onClick={handleApprove}
            sx={{ borderRadius: 3, fontWeight: 600, px: 2.5, textTransform: 'none' }}
          >
            Duyệt
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            disabled={submitting}
            onClick={handleOpenReject}
            sx={{ borderRadius: 3, fontWeight: 600, px: 2.5, textTransform: 'none' }}
          >
            Từ chối
          </Button>
        </Box>
      </Paper>

      {/* ── 3-COLUMN BODY ─────────────────────────────────── */}
      <Box display="flex" flex={1} minHeight={0} sx={{ height: 'calc(100% - 58px)', overflow: 'hidden' }}>

        {/* LEFT — thumbnail list */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            overflowY: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={600}
            sx={{ letterSpacing: 1 }}
          >
            Ảnh ({detail.images.length})
          </Typography>
          <Divider sx={{ mb: 0.5 }} />
          {detail.images.length === 0 ? (
            <Typography variant="body2" color="text.secondary" mt={2} textAlign="center">
              Không có ảnh nào
            </Typography>
          ) : (
            detail.images.map((img) => {
              const count = getAnnotationCount(img.id);
              const isSelected = selectedImage?.id === img.id;
              return (
                <Box
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    boxShadow: isSelected ? '0 0 0 1px rgba(25,118,210,0.4)' : 0,
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    '&:hover': {
                      borderColor: isSelected ? 'primary.main' : 'grey.400',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={img.url}
                    alt={img.name}
                    sx={{
                      width: '100%',
                      height: 110,
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'opacity 0.15s',
                      '&:hover': { opacity: 0.88 },
                    }}
                  />
                  {/* name overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.58)',
                      color: '#fff',
                      fontSize: 10,
                      px: 1,
                      py: 0.4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {img.name}
                  </Box>
                  {/* annotation badge */}
                  {count > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        bgcolor: 'primary.main',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: '10px',
                        px: 0.8,
                        lineHeight: 1.8,
                        minWidth: 20,
                        textAlign: 'center',
                        boxShadow: 1,
                      }}
                    >
                      {count}
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>

        {/* CENTER — image viewer */}
        <Box
          flex={1}
          sx={{
            bgcolor: '#111',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {selectedImage ? (
            <Box
              ref={canvasRef}
              sx={{ position: 'relative', width: '100%', height: '100%' }}
            >
              <Box
                key={selectedImage.id}
                component="img"
                src={selectedImage.url}
                alt={selectedImage.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  animation: 'rvFadeIn 0.2s ease',
                  '@keyframes rvFadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
                }}
              />
              {/* Annotation boxes */}
              {visibleAnnotations.map((ann) => {
                const color = getColor(ann.labelId);
                const labelName =
                  detail.labels.find((l) => l.id === ann.labelId)?.name ?? '';
                return (
                  <Tooltip key={ann.id} title={labelName} placement="top" arrow>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${ann.w}%`,
                        height: `${ann.h}%`,
                        border: `2px solid ${color}`,
                        boxSizing: 'border-box',
                        cursor: 'default',
                        transition: 'border-width 0.1s, box-shadow 0.1s',
                        '&:hover': {
                          border: `3px solid ${color}`,
                          boxShadow: `0 0 10px 3px ${color}66`,
                        },
                      }}
                    >
                      {/* Label tag — top-left inside box */}
                      <Typography
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: color,
                          color: '#fff',
                          px: 0.7,
                          py: 0.15,
                          borderRadius: '0 0 4px 0',
                          lineHeight: 1.7,
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          userSelect: 'none',
                          letterSpacing: 0.3,
                        }}
                      >
                        {labelName}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ) : (
            <Typography color="grey.600" variant="body2">
              Chọn ảnh để xem
            </Typography>
          )}
        </Box>

        {/* RIGHT — controls */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            overflowY: 'auto',
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* ── Label toggles */}
          <Box>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <LabelOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="overline" color="text.secondary" fontWeight={600} lineHeight={2}>
                Nhãn hiển thị
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            {detail.labels.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Không có nhãn</Typography>
            ) : (
              <FormGroup sx={{ gap: 0.25 }}>
                {detail.labels.map((label) => (
                  <FormControlLabel
                    key={label.id}
                    control={
                      <Checkbox
                        checked={visibleLabels.has(label.id)}
                        onChange={() => toggleLabel(label.id)}
                        size="small"
                        sx={{
                          color: label.color,
                          '&.Mui-checked': { color: label.color },
                          p: 0.5,
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: label.color,
                            flexShrink: 0,
                            boxShadow: `0 0 0 1px ${label.color}55`,
                          }}
                        />
                        <Typography variant="body2">{label.name}</Typography>
                      </Box>
                    }
                    sx={{ ml: -0.5, mr: 0 }}
                  />
                ))}
              </FormGroup>
            )}
          </Box>

          {/* ── Annotation stats */}
          <Box>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <ImageOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="overline" color="text.secondary" fontWeight={600} lineHeight={2}>
                Thống kê
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'action.hover',
                borderRadius: 2,
                px: 1.5,
                py: 1.25,
              }}
            >
              {[
                { label: 'Số ảnh', value: detail.images.length },
                { label: 'Tổng annotation', value: detail.annotations.length },
                ...(selectedImage
                  ? [{ label: 'Box ảnh đang xem', value: getAnnotationCount(selectedImage.id) }]
                  : []),
              ].map(({ label, value }) => (
                <Box key={label} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Review info */}
          <Box>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="overline" color="text.secondary" fontWeight={600} lineHeight={2}>
                Thông tin
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Người thực hiện</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {getAssigneeName(detail.task.assigneeId)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                <Chip
                  label={STATUS_LABEL[detail.task.status]}
                  color={STATUS_COLOR[detail.task.status]}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── REJECT DIALOG ─────────────────────────────────── */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Từ chối task</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}
        >
          {rejectError && (
            <Typography variant="body2" color="error" sx={{ mt: -1 }}>
              {rejectError}
            </Typography>
          )}
          <FormControl fullWidth size="small">
            <InputLabel>Loại lỗi</InputLabel>
            <Select
              value={errorType}
              label="Loại lỗi"
              onChange={(e) => {
                setErrorType(e.target.value);
                setRejectError(null);
              }}
            >
              {ERROR_TYPES.map((et) => (
                <MenuItem key={et} value={et}>
                  {et}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Nhận xét"
            multiline
            minRows={4}
            fullWidth
            size="small"
            placeholder="Mô tả chi tiết vấn đề..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setRejectError(null);
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setRejectOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={submitting}
            onClick={handleSubmitReject}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
          >
            {submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              'Xác nhận từ chối'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewDetailPage;
