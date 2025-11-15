import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for large file uploads
});

/**
 * Axios request interceptor - handle FormData and JSON properly
 */
apiClient.interceptors.request.use((config) => {
  // If the data is FormData, don't set Content-Type (axios will set it automatically with boundary)
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
    }
  } else if (config.data && typeof config.data === 'object') {
    // For JSON data, set Content-Type to application/json
    if (config.headers) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  return config;
});

/**
 * Axios response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.status, error.response?.statusText, error.message);
    return Promise.reject(error);
  }
);

/**
 * API Response wrapper from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  error_raw?: Error | null;
  data: T | null;
}

/**
 * Content Performance KPI from backend
 */
export interface ContentPerformanceKPI {
  content_id: string;
  title: string;
  content_group: string;
  total_impressions: number;
  attention_rate: number;
  entrance_rate: number;
  performance_grade: string;
}

/**
 * Group Performance KPI from backend
 */
export interface GroupPerformanceKPI {
  content_group: string;
  total_impressions: number;
  attention_rate: number;
  entrance_rate: number;
  content_count: number;
}

/**
 * Query parameters for performance API
 */
export interface PerformanceQueryParams {
  sortBy?: 'entrance_rate' | 'attention_rate' | 'total_impressions' | 'content_id' | 'title';
  order?: 'asc' | 'desc';
  grade?: 'S' | 'A' | 'B' | 'C' | 'D';
  limit?: number;
  offset?: number;
}

/**
 * Fetch content performance data from backend
 */
export async function fetchContentPerformance(
  params?: PerformanceQueryParams
): Promise<ContentPerformanceKPI[]> {
  try {
    const response = await apiClient.get<ApiResponse<ContentPerformanceKPI[]>>('/api/performance', {
      params: {
        sortBy: params?.sortBy,
        order: params?.order,
        grade: params?.grade,
        limit: params?.limit,
        offset: params?.offset,
      },
    });

    const result = response.data;
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch performance data');
    }

    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to fetch performance data: ${message}`);
    }
    throw error;
  }
}

/**
 * Fetch group performance data from backend
 */
export async function fetchGroupPerformance(
  params?: Omit<PerformanceQueryParams, 'grade'>
): Promise<GroupPerformanceKPI[]> {
  try {
    const response = await apiClient.get<ApiResponse<GroupPerformanceKPI[]>>('/api/performance/group', {
      params: {
        sortBy: params?.sortBy,
        order: params?.order,
        limit: params?.limit,
        offset: params?.offset,
      },
    });

    const result = response.data;
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch group performance data');
    }

    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to fetch group performance data: ${message}`);
    }
    throw error;
  }
}

/**
 * CSV Upload Response from backend
 */
export interface CsvUploadResponse {
  totalRecords: number;
  recordsProcessed: number;
  errors: string[] | null;
}

/**
 * Upload Content Performance CSV file using FormData (multipart/form-data)
 */
export async function uploadContentPerformanceCSV(file: File): Promise<CsvUploadResponse> {
  // Check file size (warn if very large)
  if (file.size > 50 * 1024 * 1024) { // 50MB
    console.warn("Large file detected, upload may take longer");
  }
  
  try {    
    // Use FormData for efficient file upload (multipart/form-data)
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<CsvUploadResponse>>(
      '/api/process-csv/content-perf',
      formData,
      {
        // Axios automatically sets Content-Type with boundary for FormData
        // Don't set Content-Type header - let axios handle it
        timeout: file.size > 10 * 1024 * 1024 ? 120000 : 60000, // 2 minutes for files > 10MB
      }
    );
    
    const result = response.data;
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to upload content performance CSV');
    }

    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      
      const message = error.response?.data?.message || error.message;
      const statusText = error.response?.statusText || 'Unknown error';
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout: File is too large or connection is too slow. Please try a smaller file or check your connection.');
      }
      
      throw new Error(`Failed to upload content performance CSV: ${statusText}. ${message}`);
    }
    throw error;
  }
}

/**
 * Upload Player History CSV file using FormData (multipart/form-data)
 */
export async function uploadPlayerHistoryCSV(file: File): Promise<CsvUploadResponse> {  
  // Check file size (warn if very large)
  if (file.size > 50 * 1024 * 1024) { // 50MB
    console.warn("Large file detected, upload may take longer");
  }
  
  try {    
    // Use FormData for efficient file upload (multipart/form-data)
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<CsvUploadResponse>>(
      '/api/process-csv/player-history',
      formData,
      {
        // Axios automatically sets Content-Type with boundary for FormData
        // Don't set Content-Type header - let axios handle it
        timeout: file.size > 10 * 1024 * 1024 ? 120000 : 60000, // 2 minutes for files > 10MB
      }
    );
    
    const result = response.data;
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to upload player history CSV');
    }

    return result.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      
      const message = error.response?.data?.message || error.message;
      const statusText = error.response?.statusText || 'Unknown error';
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout: File is too large or connection is too slow. Please try a smaller file or check your connection.');
      }
      
      throw new Error(`Failed to upload player history CSV: ${statusText}. ${message}`);
    }
    throw error;
  }
}
