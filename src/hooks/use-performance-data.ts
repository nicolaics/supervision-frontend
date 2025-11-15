import { useQuery } from '@tanstack/react-query';
import { fetchContentPerformance, fetchGroupPerformance, type PerformanceQueryParams } from '@/lib/api';
import { AdPerformanceData } from '@/types/performance';

/**
 * Convert backend ContentPerformanceKPI to frontend AdPerformanceData
 */
function convertToAdPerformanceData(kpi: Awaited<ReturnType<typeof fetchContentPerformance>>[0]): AdPerformanceData {
  return {
    content_id: kpi.content_id,
    title: kpi.title,
    content_group: kpi.content_group,
    total_impressions: kpi.total_impressions,
    attention_rate: kpi.attention_rate,
    entrance_rate: kpi.entrance_rate,
    performance_grade: kpi.performance_grade as 'S' | 'A' | 'B' | 'C' | 'D',
  };
}

/**
 * React Query hook to fetch content performance data
 */
export function usePerformanceData(params?: PerformanceQueryParams) {
  return useQuery({
    queryKey: ['performance', params],
    queryFn: () => fetchContentPerformance(params),
    select: (data) => data.map(convertToAdPerformanceData),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * React Query hook to fetch group performance data
 */
export function useGroupPerformanceData(params?: Omit<PerformanceQueryParams, 'grade'>) {
  return useQuery({
    queryKey: ['group-performance', params],
    queryFn: () => fetchGroupPerformance(params),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });
}

