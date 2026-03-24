import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';

/**
 * Interface định nghĩa kiểu dữ liệu cho Project
 */
interface Project {
  id: string | number;
  name: string;
  description?: string;
  type?: string;
}

/**
 * Props của ProjectCard component
 */
interface ProjectCardProps {
  project: Project;
}

/**
 * ProjectCard Component
 * Hiển thị thông tin dự án dưới dạng Card với hiệu ứng hover
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  /**
   * Xử lý click vào card
   * Navigate đến trang chi tiết dự án
   */
  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  /**
   * Hàm trả về màu chip dựa trên loại dự án
   */
  const getTypeColor = (type?: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (type?.toLowerCase()) {
      case 'image':
        return 'primary';
      case 'text':
        return 'secondary';
      case 'video':
        return 'error';
      case 'audio':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          // Hiệu ứng hover: nâng lên và tăng shadow
          transform: 'translateY(-8px)',
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Tên dự án */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              mb: 1.5,
              color: '#1976d2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {project.name}
          </Typography>

          {/* Mô tả dự án */}
          {project.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '40px',
              }}
            >
              {project.description}
            </Typography>
          )}

          {/* Spacer để đẩy loại dự án xuống dưới */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Loại dự án */}
          {project.type && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip
                label={project.type}
                size="small"
                color={getTypeColor(project.type)}
                variant="outlined"
              />
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProjectCard;
