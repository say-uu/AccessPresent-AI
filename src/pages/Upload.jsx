import { useNavigate } from "react-router-dom";
import { PlayCircle, RefreshCcw, Layers } from "lucide-react";
import FileUploader, { SelectedFilePill } from "../components/upload/FileUploader.jsx";
import PDFViewer from "../components/pdf/PDFViewer.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";
import { usePresentation } from "../context/PresentationContext.jsx";
import { formatFileSize } from "../utils/pdfLoader";

export default function Upload() {
  const navigate = useNavigate();
  const {
    file,
    pdfDoc,
    numPages,
    status,
    error,
    uploadProgress,
    loadFile,
    clearFile,
  } = usePresentation();

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-navy-900 tracking-tight">
          Upload Presentation
        </h1>
        <p className="mt-3 text-navy-500 max-w-xl mx-auto">
          Upload a PDF exported from PowerPoint, Google Slides or any other tool to get
          started. Only PDF files are supported in this version.
        </p>
      </div>

      {status === "error" && (
        <div className="mb-6">
          <ErrorMessage
            title="We couldn't use that file"
            description={error}
            actionLabel="Try a different file"
            onAction={clearFile}
          />
        </div>
      )}

      {status !== "ready" && (
        <FileUploader
          onFileSelected={loadFile}
          isLoading={status === "loading"}
          progress={uploadProgress}
          selectedFileName={file?.name}
        />
      )}

      {status === "ready" && (
        <div className="space-y-6 animate-fade-in">
          <SelectedFilePill
            fileName={file.name}
            fileSize={formatFileSize(file.size)}
            onRemove={clearFile}
          />

          <div className="rounded-2xl border border-navy-900/10 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-navy-900">Preview</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-500">
                <Layers size={14} /> {numPages} slide{numPages === 1 ? "" : "s"}
              </span>
            </div>
            <div className="aspect-video w-full bg-mist-100 rounded-xl overflow-hidden">
              <PDFViewer pdfDoc={pdfDoc} pageNumber={1} className="h-full" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate("/presentation")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.01] hover:bg-navy-800"
            >
              <PlayCircle size={18} />
              Start Presentation
            </button>
            <button
              type="button"
              onClick={clearFile}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/15 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 hover:bg-mist-100"
            >
              <RefreshCcw size={16} />
              Replace File
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
