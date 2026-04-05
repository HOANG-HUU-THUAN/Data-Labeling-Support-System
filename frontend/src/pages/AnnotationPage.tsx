import { useEffect, useState } from 'react';
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

const AnnotationPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [images, setImages] = useState<AnnotationImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<AnnotationImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    getTaskImages(Number(taskId)).then((imgs) => {
      setImages(imgs);
      if (imgs.length > 0) setSelectedImage(imgs[0]);
      setLoading(false);
    });
  }, [taskId]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* HEADER */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
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

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
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
                component="img"
                src={img.url}
                alt={`Ảnh #${img.id}`}
                onClick={() => setSelectedImage(img)}
                sx={{
                  width: '100%',
                  height: 90,
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: selectedImage?.id === img.id
                    ? '2px solid'
                    : '2px solid transparent',
                  borderColor: selectedImage?.id === img.id ? 'primary.main' : 'transparent',
                  transition: 'border-color 0.15s',
                  '&:hover': { opacity: 0.85 },
                }}
              />
            ))}
          </Paper>

          {/* RIGHT PANEL — large view */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              overflow: 'hidden',
            }}
          >
            {selectedImage ? (
              <Box
                component="img"
                src={selectedImage.url}
                alt={`Ảnh #${selectedImage.id}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
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
