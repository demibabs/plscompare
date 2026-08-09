export type ExportJobStatus =
  | "queued"
  | "processing"
  | "complete"
  | "failed"
  | "cancelled";

export type ExportJob = {
  id: string;
  fileName: string,
  status: ExportJobStatus;
  progress: number;
  outputPath?: string;
  error?: string;
  createdAt: Date;
};

export const exportJobs = new Map<string, ExportJob>();