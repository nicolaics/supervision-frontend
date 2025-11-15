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
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { uploadContentPerformanceCSV, uploadPlayerHistoryCSV } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

type UploadType = "content-performance" | "player-history";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const config = {
    "content-performance": {
      title: "Content Performance CSV",
      description:
        "Upload content_performance.csv file with ad performance data",
      accept: ".csv",
      uploadFn: uploadContentPerformanceCSV,
    },
    "player-history": {
      title: "Player History CSV",
      description:
        "Upload player_history.csv file with player interaction data",
      accept: ".csv",
      uploadFn: uploadPlayerHistoryCSV,
    },
  };

  const currentConfig = config[type];

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
      const result = await currentConfig.uploadFn(file);

      setUploadResult({
        success: true,
        message: `Successfully uploaded ${result.recordsProcessed} records`,
        details:
          result.errors && result.errors.length > 0
            ? `${result.errors.length} errors occurred during processing.`
            : undefined,
      });

      // Invalidate and refetch performance data if content performance was uploaded
      if (type === "content-performance") {
        queryClient.invalidateQueries({ queryKey: ["performance"] });
        queryClient.invalidateQueries({ queryKey: ["group-performance"] });
        // Update store to indicate data is available (will be confirmed when data loads)
        // The Index page useEffect will handle the actual state update
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
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
            {uploadResult.success ? (
              <CheckCircle2 className="h-4 w-4" />
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
