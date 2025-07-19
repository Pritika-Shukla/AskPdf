"use client";

import { AlertCircleIcon, FileIcon, UploadIcon, XIcon, FileTextIcon, SendIcon } from "lucide-react";
import { useState } from "react";

import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

export default function UploadFile() {
  const maxSizeMB = 2;
  const maxSize = maxSizeMB * 1024 * 1024; // 2MB default
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "application/pdf",
    maxSize,
  });

  const uploadedFile = files[0];

  const handleUpload = async () => {
    if (!uploadedFile || !(uploadedFile.file instanceof File)) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('pdf', uploadedFile.file);

      const response = await fetch('http://localhost:8000/uploads/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setUploadSuccess(true);
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-r border-gray-300 w-xl justify-center items-center h-screen">
      <div className="w-full p-4">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-2 border-dashed border-slate-300 data-[dragging=true]:border-blue-500 data-[dragging=true]:bg-blue-50/50 relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:border-slate-400  bg-white/80 backdrop-blur-sm"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload PDF file"
          />
          {uploadedFile ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-red-50 mb-4 flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-red-200 shadow-lg">
                  <FileTextIcon className="size-10 text-red-500" />
                </div>
                <div className="max-w-full">
                  <p className="mb-2 text-sm font-semibold text-slate-900 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-slate-600 text-xs bg-slate-100 px-3 py-1.5 rounded-full font-medium">
                    {formatBytes(uploadedFile.file.size)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
              <div
                className="bg-blue-50 mb-4 flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-blue-200 shadow-lg"
                aria-hidden="true"
              >
                <FileIcon className="size-8 text-blue-500" />
              </div>
              <p className="mb-2 text-base font-semibold text-slate-900">Drop your PDF here</p>
              <p className="text-slate-500 text-sm mb-4">
                PDF (max. {maxSizeMB}MB)
              </p>
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 shadow-sm transition-all duration-200 hover:shadow-md"
                onClick={openFileDialog}
                type="button"
              >
                <UploadIcon
                  className="mr-2 size-4"
                  aria-hidden="true"
                />
                Select PDF
              </Button>
            </div>
          )}
        </div>

        {uploadedFile && (
          <div className="absolute -top-2 -right-2">
            <button
              type="button"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white transition-all duration-200 outline-none hover:bg-red-600 hover:scale-110 shadow-lg"
              onClick={() => removeFile(uploadedFile.id)}
              aria-label="Remove PDF"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {uploadedFile && (
        <div className="w-full p-4">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <SendIcon className="mr-2 size-4" />
                Upload PDF
              </>
            )}
          </Button>
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="text-red-600 flex items-center gap-2 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-200 shadow-sm"
          role="alert"
          aria-live="polite"
        >
          <AlertCircleIcon className="size-4 shrink-0" />
          <span className="font-medium">{errors[0]}</span>
        </div>
      )}

      {uploadError && (
        <div
          className="text-red-600 flex items-center gap-2 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-200 shadow-sm"
          role="alert"
          aria-live="polite"
        >
          <AlertCircleIcon className="size-4 shrink-0" />
          <span className="font-medium">{uploadError}</span>
        </div>
      )}

      {uploadedFile && !uploadSuccess && !uploadError && (
        <div className="text-emerald-600 mt-2 text-center text-sm bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 shadow-sm">
          <p className="font-medium">✓ PDF file ready for processing</p>
        </div>
      )}

      {uploadSuccess && (
        <div className="text-emerald-600 mt-2 text-center text-sm bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 shadow-sm">
          <p className="font-medium">✓ PDF uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}
