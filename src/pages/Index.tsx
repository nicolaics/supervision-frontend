import { usePerformanceData } from "@/hooks/use-performance-data";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { PerformanceLeaderboard } from "@/components/dashboard/PerformanceLeaderboard";
import { AttentionEntranceScatter } from "@/components/dashboard/AttentionEntranceScatter";
import { EntranceRateByGroup } from "@/components/dashboard/EntranceRateByGroup";
import { CsvUploadCard } from "@/components/dashboard/CsvUploadCard";
import { Activity, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const {
    data: performanceData,
    isLoading,
    isError,
    error,
  } = usePerformanceData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Ad Performance Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg ml-[60px]">
            Comprehensive insights into your digital signage advertisements
          </p>
        </div>

        {/* CSV Upload Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CsvUploadCard type="content-performance" />
            <CsvUploadCard type="player-history" />
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading data</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load performance data. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
            <Skeleton className="h-96" />
          </div>
        )}

        {/* Data Content */}
        {!isLoading && !isError && performanceData && (
          <>
            {/* Stats Cards */}
            <div className="mb-8">
              <DashboardStats data={performanceData} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <AttentionEntranceScatter data={performanceData} />
              <EntranceRateByGroup data={performanceData} />
            </div>

            {/* Leaderboard */}
            <PerformanceLeaderboard data={performanceData} />
          </>
        )}

        {/* Empty State */}
        {!isLoading &&
          !isError &&
          (!performanceData || performanceData.length === 0) && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No data available</AlertTitle>
              <AlertDescription>
                No performance data found. Please upload content performance
                data via the API.
              </AlertDescription>
            </Alert>
          )}
      </div>
    </div>
  );
};

export default Index;
