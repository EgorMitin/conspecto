import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmptyState from './EmptyState';
import { LucideIcon } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

interface TimeSeriesChartProps {
  data: Array<{ date: string;[key: string]: string | number }>;
  dataKey: string;
  title: string;
  yAxisLabel: string;
  yAxisDomain?: [number, number];
  emptyStateIcon: LucideIcon;
  emptyStateTitle: string;
  emptyStateDescription: string;
  color?: string;
  height?: number;
  formatTooltip?: (value: any) => [string, string];
}

export default function TimeSeriesChart({
  data,
  dataKey,
  title,
  yAxisLabel,
  yAxisDomain,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  color = "#9333ea",
  height = 240,
  formatTooltip
}: TimeSeriesChartProps) {
  const hasData = data && data.some(item => item[dataKey] !== 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState(height);

  useLayoutEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setDynamicHeight(Math.max(120, Math.min(height, width / 1.5)));
      }
    }
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [height]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div
        ref={containerRef}
        className="relative"
        style={{
          height: dynamicHeight,
          minWidth: 240,
          maxWidth: '100%',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={{ stroke: '#e0e0e0' }}
              label={{
                value: 'Date',
                position: 'insideBottom',
                offset: -10,
                style: { textAnchor: 'middle', fontSize: 12, fill: '#666' }
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yAxisDomain}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={{ stroke: '#e0e0e0' }}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: '#666' }
              }}
            />
            <Tooltip
              formatter={formatTooltip || ((value) => [value, dataKey])}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={hasData ? color : "#e0e0e0"}
              strokeWidth={2}
              dot={{ r: 2, fill: hasData ? color : "#e0e0e0" }}
              activeDot={{ r: 4 }}
              strokeDasharray={hasData ? "0" : "5,5"}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {!hasData && (
          <EmptyState
            icon={emptyStateIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        )}
      </div>
    </div>
  );
}
