import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';
import axiosInstance from '../api/axios';

interface ImageWithAuthProps extends BoxProps {
  src: string;
  alt?: string;
}

const ImageWithAuth: React.FC<ImageWithAuthProps> = ({ src, alt, ...rest }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    
    let cancelled = false;
    let url = '';
    
    axiosInstance.get(src, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) return;
        url = URL.createObjectURL(response.data);
        setObjectUrl(url);
      })
      .catch((error) => {
        console.error('Failed to load image:', src, error);
      });

    return () => {
      cancelled = true;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [src]);

  return (
    <Box
      component="img"
      src={objectUrl || ''}
      alt={alt}
      {...rest}
    />
  );
};

export default ImageWithAuth;
