import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { loadPdfFromFile, PdfValidationError } from "../utils/pdfLoader";

const PresentationContext = createContext(null);

export function PresentationProvider({ children }) {
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("empty"); // empty | loading | ready | error
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadFile = useCallback(async (nextFile) => {
    setStatus("loading");
    setError(null);
    setUploadProgress(0);
    try {
      const doc = await loadPdfFromFile(nextFile, setUploadProgress);
      setFile(nextFile);
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof PdfValidationError
          ? err.message
          : "Something went wrong while reading this file."
      );
      setFile(null);
      setPdfDoc(null);
      setNumPages(0);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(1);
    setStatus("empty");
    setError(null);
  }, []);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage((prev) => {
        const next = typeof page === "function" ? page(prev) : page;
        return Math.min(Math.max(next, 1), Math.max(numPages, 1));
      });
    },
    [numPages]
  );

  const nextSlide = useCallback(() => goToPage((p) => p + 1), [goToPage]);
  const prevSlide = useCallback(() => goToPage((p) => p - 1), [goToPage]);

  const value = useMemo(
    () => ({
      file,
      pdfDoc,
      numPages,
      currentPage,
      status,
      error,
      uploadProgress,
      loadFile,
      clearFile,
      goToPage,
      nextSlide,
      prevSlide,
      isFirstSlide: currentPage <= 1,
      isLastSlide: currentPage >= numPages,
    }),
    [
      file,
      pdfDoc,
      numPages,
      currentPage,
      status,
      error,
      uploadProgress,
      loadFile,
      clearFile,
      goToPage,
      nextSlide,
      prevSlide,
    ]
  );

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const ctx = useContext(PresentationContext);
  if (!ctx) throw new Error("usePresentation must be used within PresentationProvider");
  return ctx;
}
