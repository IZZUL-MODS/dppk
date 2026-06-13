"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileArchive, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  isUploading: boolean;
}

export default function FileUploader({ onFileSelect, isUploading }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError("Invalid file format");
      return;
    }

    const selected = acceptedFiles[0];
    if (!selected.name.endsWith(".zip")) {
      setError("Only .zip files are allowed");
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    setFile(selected);
    onFileSelect(selected);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
              transition-all duration-300 overflow-hidden group
              ${isDragActive 
                ? "border-primary bg-primary/10 shadow-glow" 
                : "border-primary/30 hover:border-primary hover:bg-primary/5"
              }
              ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]" />
            
            <div className="animate-float">
              <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {isDragActive ? "Drop your ZIP file here" : "Drop your project ZIP here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse (max 50MB)
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Supports: Next.js, React, Vue, Angular, and any static site
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/50 border border-primary/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileArchive className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                disabled={isUploading}
                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group"
              >
                <X className="w-5 h-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 text-red-500 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}