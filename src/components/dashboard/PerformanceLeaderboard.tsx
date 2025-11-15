import { useState, useMemo } from 'react';
import { AdPerformanceData } from '@/types/performance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, TrendingUp } from 'lucide-react';

interface PerformanceLeaderboardProps {
  data: AdPerformanceData[];
}

type SortKey = 'title' | 'content_group' | 'total_impressions' | 'attention_rate' | 'entrance_rate' | 'performance_grade';
type SortDirection = 'asc' | 'desc';

const getGradeStyles = (grade: string) => {
  const styles = {
    S: 'bg-grade-s-bg text-grade-s border-grade-s',
    A: 'bg-grade-a-bg text-grade-a border-grade-a',
    B: 'bg-grade-b-bg text-grade-b border-grade-b',
    C: 'bg-grade-c-bg text-grade-c border-grade-c',
    D: 'bg-grade-d-bg text-grade-d border-grade-d',
  };
  return styles[grade as keyof typeof styles] || styles.D;
};

const getRowStyles = (grade: string) => {
  const styles = {
    S: 'bg-grade-s-bg/50 hover:bg-grade-s-bg/70',
    A: 'bg-grade-a-bg/50 hover:bg-grade-a-bg/70',
    B: 'bg-grade-b-bg/50 hover:bg-grade-b-bg/70',
    C: 'bg-grade-c-bg/50 hover:bg-grade-c-bg/70',
    D: 'bg-grade-d-bg/50 hover:bg-grade-d-bg/70',
  };
  return styles[grade as keyof typeof styles] || styles.D;
};

export const PerformanceLeaderboard = ({ data }: PerformanceLeaderboardProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('total_impressions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (sortKey === 'performance_grade') {
        const gradeOrder = { S: 5, A: 4, B: 3, C: 2, D: 1 };
        aVal = gradeOrder[a.performance_grade];
        bVal = gradeOrder[b.performance_grade];
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Performance Leaderboard</CardTitle>
        </div>
        <CardDescription>Compare all advertisements by key metrics</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-colors"
                  >
                    Content Title
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('content_group')}
                    className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-colors"
                  >
                    Content Group
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSort('total_impressions')}
                    className="flex items-center justify-end gap-2 font-semibold text-sm text-foreground hover:text-primary transition-colors ml-auto"
                  >
                    Total Impressions
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSort('attention_rate')}
                    className="flex items-center justify-end gap-2 font-semibold text-sm text-foreground hover:text-primary transition-colors ml-auto"
                  >
                    Attention Rate
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSort('entrance_rate')}
                    className="flex items-center justify-end gap-2 font-semibold text-sm text-foreground hover:text-primary transition-colors ml-auto"
                  >
                    Entrance Rate
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleSort('performance_grade')}
                    className="flex items-center justify-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-colors mx-auto"
                  >
                    Grade
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  key={row.content_id}
                  className={`border-b border-border/30 transition-colors ${getRowStyles(row.performance_grade)}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{row.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{row.content_id}</div>
                  </td>
                  <td className="px-6 py-4 text-foreground">{row.content_group}</td>
                  <td className="px-6 py-4 text-right font-mono text-foreground">
                    {row.total_impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-foreground">
                    {(row.attention_rate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-foreground">
                    {(row.entrance_rate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className={`font-bold ${getGradeStyles(row.performance_grade)}`}>
                      {row.performance_grade}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
