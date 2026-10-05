import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { formatFileSize, MAX_FILE_SIZE_BYTES } from "../../utils/pdfLoader";

/**
 * Drag-and-drop + click-to-browse PDF picker. Purely presentational: file
 * validation and parsing live in PresentationContext/pdfLoader.
 */
export default function FileUploader({ onFileSelected, isLoading, progress, selectedFileName }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a PDF presentation by dragging it here or browsing files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-accent-indigo bg-accent-indigo/5"
            : "border-navy-900/15 bg-white hover:border-accent-blue/50 hover:bg-mist-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-indigo">
          <UploadCloud size={30} strokeWidth={1.8} aria-hidden="true" />
        </span>

        <div>
          <p className="text-lg font-semibold text-navy-900">
            Drag and drop your presentation here
          </p>
          <p className="mt-1 text-sm text-navy-500">
            or <span className="font-medium text-accent-indigo underline underline-offset-2">browse files</span>
          </p>
        </div>

        <p className="text-xs text-navy-400">
          PDF files only &middot; up to {formatFileSize(MAX_FILE_SIZE_BYTES)}
        </p>

        {isLoading && (
          <div className="w-full max-w-xs mt-2">
            <div className="flex items-center justify-between text-xs text-navy-500 mb-1">
              <span className="flex items-center gap-1.5 truncate">
                <FileText size={14} /> {selectedFileName}
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-navy-900/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all"
                style={{ width: `${Math.max(progress * 100, 4)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SelectedFilePill({ fileName, fileSize, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-900/10 bg-white px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-indigo/10 text-accent-indigo">
          <FileText size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-navy-900 truncate">{fileName}</p>
          <p className="text-xs text-navy-400">{fileSize}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove file"
        className="shrink-0 rounded-lg p-2 text-navy-400 hover:bg-red-50 hover:text-red-500"
      >
        <X size={16} />
      </button>
    </div>
  );
}
