import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getUserPerformance } from '../../../mock/dashboardMock';
import type { UserPerformance } from '../../../types/performance';

export default function PerformanceWidget() {
  const [data, setData] = useState<UserPerformance[]>([]);

  useEffect(() => {
    getUserPerformance().then(setData);
  }, []);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box px={2.5} pt={2.5} pb={1.5}>
        <Typography variant="h6" fontWeight={700}>
          Hiệu suất annotator
        </Typography>
      </Box>

      {data.length === 0 ? (
        <Box px={2.5} pb={3}>
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                {['Tên', 'Đã gán', 'Đã duyệt', 'Bị từ chối', 'Tỉ lệ duyệt'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, py: 1.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((u) => {
                const rate =
                  u.annotated === 0 ? 0 : Math.round((u.approved / u.annotated) * 100);
                return (
                  <TableRow key={u.userId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                    <TableCell>{u.annotated}</TableCell>
                    <TableCell sx={{ color: '#2e7d32', fontWeight: 600 }}>{u.approved}</TableCell>
                    <TableCell sx={{ color: '#d32f2f', fontWeight: 600 }}>{u.rejected}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={rate}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32', borderRadius: 3 },
                          }}
                        />
                        <Typography variant="caption" fontWeight={600} minWidth={32}>
                          {rate}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
