import { useEffect, useState } from 'react';
import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { getProjectProgress, type ProgressItem } from '../../../mock/dashboardMock';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  TODO:        { label: 'Chưa làm',   color: '#9e9e9e' },
  IN_PROGRESS: { label: 'Đang làm',   color: '#2196f3' },
  SUBMITTED:   { label: 'Đã nộp',     color: '#ff9800' },
  APPROVED:    { label: 'Đã duyệt',   color: '#4caf50' },
  REJECTED:    { label: 'Bị từ chối', color: '#f44336' },
};

interface ChartEntry {
  name: string;
  value: number;
  color: string;
}

const toChartData = (items: ProgressItem[]): ChartEntry[] =>
  items.map((item) => ({
    name:  STATUS_MAP[item.status]?.label ?? item.status,
    value: item.count,
    color: STATUS_MAP[item.status]?.color ?? '#9e9e9e',
  }));

const renderLabel = ({ cx, cy, midAngle, outerRadius, name, percent }: PieLabelRenderProps) => {
  const RADIAN = Math.PI / 180;
  const r = Number(outerRadius ?? 0) + 24;
  const x = Number(cx ?? 0) + r * Math.cos(-Number(midAngle ?? 0) * RADIAN);
  const y = Number(cy ?? 0) + r * Math.sin(-Number(midAngle ?? 0) * RADIAN);
  const pct = ((Number(percent ?? 0)) * 100).toFixed(0);
  return (
    <text
      x={x}
      y={y}
      textAnchor={x > Number(cx ?? 0) ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fill="#555"
    >
      {`${name ?? ''} (${pct}%)`}
    </text>
  );
};

interface Props {
  projectId?: number;
  title?: string;
}

const ProjectProgressWidget = ({ projectId, title = 'Tiến độ dự án' }: Props) => {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjectProgress(projectId).then((data) => {
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [projectId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const chartData = toChartData(items);

  return (
    <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        {title}
      </Typography>

      {chartData.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Chưa có dữ liệu.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value ?? 0} task`, 'Số lượng']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default ProjectProgressWidget;
