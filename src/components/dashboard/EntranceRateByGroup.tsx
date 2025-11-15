import { useMemo } from 'react';
import { AdPerformanceData } from '@/types/performance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface EntranceRateByGroupProps {
  data: AdPerformanceData[];
}

export const EntranceRateByGroup = ({ data }: EntranceRateByGroupProps) => {
  const chartData = useMemo(() => {
    const groupMap = new Map<string, { sum: number; count: number }>();

    data.forEach(item => {
      const existing = groupMap.get(item.content_group) || { sum: 0, count: 0 };
      groupMap.set(item.content_group, {
        sum: existing.sum + item.entrance_rate,
        count: existing.count + 1,
      });
    });

    return Array.from(groupMap.entries()).map(([group, stats]) => ({
      content_group: group,
      average_entrance_rate: (stats.sum / stats.count) * 100,
    })).sort((a, b) => b.average_entrance_rate - a.average_entrance_rate);
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-1">{data.content_group}</p>
          <p className="text-sm text-muted-foreground">
            Avg Entrance Rate: <span className="font-mono text-foreground">{data.average_entrance_rate.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Average Entrance Rate by Group</CardTitle>
        </div>
        <CardDescription>
          Compare effectiveness of different ad categories
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="content_group"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--foreground))' }}
              label={{ value: 'Average Entrance Rate (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="average_entrance_rate"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              maxBarSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
