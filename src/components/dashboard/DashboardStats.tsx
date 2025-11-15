import { useMemo } from 'react';
import { AdPerformanceData } from '@/types/performance';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Users, TrendingUp, Award } from 'lucide-react';

interface DashboardStatsProps {
  data: AdPerformanceData[];
}

export const DashboardStats = ({ data }: DashboardStatsProps) => {
  const stats = useMemo(() => {
    const totalImpressions = data.reduce((sum, item) => sum + item.total_impressions, 0);
    const avgAttention = data.reduce((sum, item) => sum + item.attention_rate, 0) / data.length;
    const avgEntrance = data.reduce((sum, item) => sum + item.entrance_rate, 0) / data.length;
    const topPerformers = data.filter(item => item.performance_grade === 'S' || item.performance_grade === 'A').length;

    return {
      totalImpressions,
      avgAttention: avgAttention * 100,
      avgEntrance: avgEntrance * 100,
      topPerformers,
    };
  }, [data]);

  const statCards = [
    {
      title: 'Total Impressions',
      value: stats.totalImpressions.toLocaleString(),
      icon: Eye,
      color: 'text-chart-1',
    },
    {
      title: 'Avg Attention Rate',
      value: `${stats.avgAttention.toFixed(1)}%`,
      icon: Users,
      color: 'text-chart-2',
    },
    {
      title: 'Avg Entrance Rate',
      value: `${stats.avgEntrance.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-chart-3',
    },
    {
      title: 'Top Performers',
      value: `${stats.topPerformers} ads`,
      icon: Award,
      color: 'text-chart-4',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="shadow-lg border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-primary/10 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
