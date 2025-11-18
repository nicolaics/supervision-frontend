import { useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  uploadContentPerformanceCSV,
  uploadPlayerHistoryCSV,
  fetchDatasetStatus,
  DatasetName,
  CsvUploadResponse,
} from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

type UploadType = "content-performance" | "player-history";
type UploadMode = "replace" | "append";

interface CsvUploadCardProps {
  type: UploadType;
}

export const CsvUploadCard = ({ type }: CsvUploadCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("replace");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const config: Record<
    UploadType,
    {
      title: string;
      description: string;
      accept: string;
      uploadFn: (
        file: File,
        options?: { mode?: UploadMode }
      ) => Promise<CsvUploadResponse>;
      dataset: DatasetName;
    }
  > = {
    "content-performance": {
      title: "Content Performance CSV",
      description:
        "Upload content_performance.csv file with ad performance data",
      accept: ".csv",
      uploadFn: uploadContentPerformanceCSV,
      dataset: "content-performance",
    },
    "player-history": {
      title: "Player History CSV",
      description:
        "Upload player_history.csv file with player interaction data",
      accept: ".csv",
      uploadFn: uploadPlayerHistoryCSV,
      dataset: "player-history",
    },
  };

  const currentConfig = config[type];

  const {
    data: datasetStatus,
    isLoading: isStatusLoading,
    isFetching: isStatusFetching,
  } = useQuery({
    queryKey: ["dataset-status", currentConfig.dataset],
    queryFn: () => fetchDatasetStatus(currentConfig.dataset),
    staleTime: 30_000,
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      setUploadResult({
        success: false,
        message: "Invalid file type",
        details: "Please select a CSV file.",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      console.log("Starting CSV upload for type:", type, "mode:", uploadMode);
      const result = await currentConfig.uploadFn(file, { mode: uploadMode });
      console.log("Upload result received:", result);

      // Determine if there were processing errors (but upload still succeeded)
      const hasErrors = result.errors && result.errors.length > 0;

      const detailParts: string[] = [];
      if (hasErrors && result.errors) {
        detailParts.push(
          `${result.errors.length} row(s) were skipped due to validation errors.`
        );
      }
      detailParts.push(
        `Database now stores ${result.databaseRecords.toLocaleString()} record(s).`
      );
      if (result.lastUpdatedAt) {
        detailParts.push(
          `Last updated at ${format(new Date(result.lastUpdatedAt), "PPpp")}.`
        );
      }

      setUploadResult({
        success: true,
        message: hasErrors
          ? `Upload completed (${uploadMode} mode): ${result.recordsProcessed.toLocaleString(
              "en-US"
            )} record(s) processed successfully`
          : `Successfully uploaded ${result.recordsProcessed.toLocaleString(
              "en-US"
            )} record(s) using ${uploadMode} mode`,
        details: detailParts.join(" "),
      });

      // Invalidate and refetch performance data since both datasets affect KPIs
      queryClient.invalidateQueries({ queryKey: ["performance"] });
      queryClient.invalidateQueries({ queryKey: ["group-performance"] });
      // Update store to indicate data is available (will be confirmed when data loads)
      // The Index page useEffect will handle the actual state update

      // Invalidate dataset status
      queryClient.invalidateQueries({
        queryKey: ["dataset-status", currentConfig.dataset],
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error caught in component:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      setUploadResult({
        success: false,
        message: "Upload failed",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
    }
  }, []);

  const recordsInDb = datasetStatus?.records_count ?? 0;
  const lastUpdatedDate = datasetStatus?.last_updated_at
    ? new Date(datasetStatus.last_updated_at)
    : null;
  const lastUpdatedDisplay = lastUpdatedDate
    ? formatDistanceToNow(lastUpdatedDate, { addSuffix: true })
    : "No uploads yet";
  const lastUpdatedTooltip = lastUpdatedDate
    ? format(lastUpdatedDate, "PPpp")
    : undefined;
  const statusLoading = isStatusLoading || isStatusFetching;

  const handleReplaceMode = useCallback(() => {
    setUploadMode("replace");
  }, []);

  const handleAppendMode = useCallback(() => {
    setUploadMode("append");
  }, []);

  const handleDismissResult = useCallback(() => {
    setUploadResult(null);
  }, []);

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{currentConfig.title}</CardTitle>
            <CardDescription className="mt-1">
              {currentConfig.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Records in database
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {statusLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  recordsInDb.toLocaleString()
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p
                className="text-sm font-medium text-foreground"
                title={lastUpdatedTooltip}
              >
                {statusLoading ? "Loading..." : lastUpdatedDisplay}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Upload mode
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant={uploadMode === "replace" ? "default" : "outline"}
              onClick={handleReplaceMode}
              disabled={isUploading}
            >
              Replace data
            </Button>
            <Button
              type="button"
              variant={uploadMode === "append" ? "default" : "outline"}
              onClick={handleAppendMode}
              disabled={isUploading}
            >
              Append data
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {uploadMode === "replace"
              ? "Clears all existing records before inserting the new CSV."
              : "Keeps existing records and adds new rows from the CSV."}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={currentConfig.accept}
          onChange={handleFileSelect}
          onClick={(e) => {
            // Reset value to allow selecting the same file again
            (e.target as HTMLInputElement).value = "";
          }}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full"
          variant="outline"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Select CSV File
            </>
          )}
        </Button>

        {uploadResult && (
          <Alert variant={uploadResult.success ? "default" : "destructive"}>
            <button
              type="button"
              aria-label="Dismiss upload status"
              className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={handleDismissResult}
            >
              <X className="h-4 w-4" />
            </button>
            {uploadResult.success ? (
              uploadResult.details ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{uploadResult.message}</AlertTitle>
            {uploadResult.details && (
              <AlertDescription className="mt-2">
                {uploadResult.details}
              </AlertDescription>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
