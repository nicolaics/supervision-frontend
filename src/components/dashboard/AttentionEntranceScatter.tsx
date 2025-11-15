import { AdPerformanceData } from "@/types/performance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Target } from "lucide-react";

interface AttentionEntranceScatterProps {
  data: AdPerformanceData[];
}

const getGradeColor = (grade: string) => {
  const colors = {
    S: "hsl(var(--grade-s))",
    A: "hsl(var(--grade-a))",
    B: "hsl(var(--grade-b))",
    C: "hsl(var(--grade-c))",
    D: "hsl(var(--grade-d))",
  };
  return colors[grade as keyof typeof colors] || colors.D;
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, number>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-1">{data.title}</p>
        <p className="text-sm text-muted-foreground">
          Attention:{" "}
          <span className="font-mono text-foreground">
            {data.attentionPercent.toFixed(1)}%
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Entrance:{" "}
          <span className="font-mono text-foreground">
            {data.entrancePercent.toFixed(1)}%
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Grade:{" "}
          <span className="font-bold" style={{ color: data.fill }}>
            {data.performance_grade}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const AttentionEntranceScatter = ({
  data,
}: AttentionEntranceScatterProps) => {
  const chartData = data.map((item) => ({
    ...item,
    attentionPercent: item.attention_rate * 100,
    entrancePercent: item.entrance_rate * 100,
    fill: getGradeColor(item.performance_grade),
  }));

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">
            Attention-Entrance Correlation
          </CardTitle>
        </div>
        <CardDescription>
          Identify ads with high attention but low entrance rates
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              type="number"
              dataKey="attentionPercent"
              name="Attention Rate"
              unit="%"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--foreground))" }}
              label={{
                value: "Attention Rate (%)",
                position: "bottom",
                fill: "hsl(var(--foreground))",
              }}
            />
            <YAxis
              type="number"
              dataKey="entrancePercent"
              name="Entrance Rate"
              unit="%"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--foreground))" }}
              label={{
                value: "Entrance Rate (%)",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--foreground))",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={chartData}
              fill="hsl(var(--primary))"
              fillOpacity={0.8}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {["S", "A", "B", "C", "D"].map((grade) => (
            <div key={grade} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getGradeColor(grade) }}
              />
              <span className="text-sm text-muted-foreground">
                Grade {grade}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
