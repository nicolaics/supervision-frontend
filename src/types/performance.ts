export interface AdPerformanceData {
  content_id: string;
  title: string;
  content_group: string;
  total_impressions: number;
  attention_rate: number;
  entrance_rate: number;
  performance_grade: 'S' | 'A' | 'B' | 'C' | 'D';
}
