"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfPreview({ url }: { url: string }) {
  const [pdfPreviewWidth, setPdfPreviewWidth] = useState(360);
  const [pdfHasError, setPdfHasError] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const proxiedUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;

  useEffect(() => {
    const el = pdfContainerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const nextWidth = Math.max(280, Math.floor(el.clientWidth) - 16);
      setPdfPreviewWidth(nextWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={pdfContainerRef}
      className="w-full min-h-[420px] bg-[#0f0f0f] flex items-center justify-center p-2"
    >
      {pdfHasError ? (
        <p className="text-sm text-white/60 px-4 text-center">
          PDF preview unavailable on this device.
        </p>
      ) : (
        <Document
          file={proxiedUrl}
          loading={<p className="text-sm text-white/60">Loading PDF preview...</p>}
          error={
            <p className="text-sm text-white/60 px-4 text-center">
              PDF preview unavailable on this device.
            </p>
          }
          onLoadError={() => setPdfHasError(true)}
        >
          <Page
            pageNumber={1}
            width={pdfPreviewWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      )}
    </div>
  );
}
