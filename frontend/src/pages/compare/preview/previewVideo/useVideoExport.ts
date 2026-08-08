import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExportConfig } from "@plscompare/shared/types";
import posthog from "../../../../posthog";
import { get } from "idb-keyval";
import type { FrameData } from "../../../../utils/getFrameData";

export function useVideoExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startExport = (files: File[], config: ExportConfig) => {
    const body = new FormData();
    body.append("options", JSON.stringify(config));
    files.forEach((file) => {
      body.append("files", file);
    });
    setIsExporting(true);
    void fetch("/api/exports", {
      method: "POST",
      body,
    });
  };

  return {
    startExport,
    isExporting,
    progress,
    error,
  };
}
