'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

interface DynamicUploadProps {
  value?: string;
  onChange: (url: string) => void;
  mode?: 'image' | 'file';
  accept?: string;
  label?: string;
  targetSizeText?: string;
  aspectRatio?: number; // Default 1:1 or 16:9
}

export const DynamicUpload: React.FC<DynamicUploadProps> = ({
  value,
  onChange,
  mode = 'image',
  accept = 'image/jpeg,image/png,image/webp,image/jpg',
  label = 'Upload Image',
  targetSizeText = 'Supports up to 200 MB (Auto-optimized to 1280×1280 HD)',
  aspectRatio = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  // Compress & Optimize Image via Canvas (Handles up to 200MB files smoothly)
  const processAndOptimizeImage = (file: File) => {
    // 1. File Size Validation (Max 200 MB)
    const MAX_SIZE_BYTES = 200 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage('File exceeds maximum upload size limit of 200 MB.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
      setIsProcessing(false);
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setErrorMessage('Invalid or corrupt image format.');
        setIsProcessing(false);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 1280; // Standard HD dimension

          let width = img.width;
          let height = img.height;

          // Preserve aspect ratio while resizing large images
          if (width > height) {
            if (width > MAX_DIMENSION) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context unavailable');
          }

          // Smooth rendering algorithm
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Compress image to JPEG (Quality: 0.90)
          const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.90);

          setPreviewUrl(optimizedBase64);
          onChange(optimizedBase64);
        } catch (err: any) {
          setErrorMessage('Failed to process image optimization: ' + err.message);
        } finally {
          setIsProcessing(false);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndOptimizeImage(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setErrorMessage(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs max-w-sm">
          <div className="aspect-video w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => {
                setPreviewUrl('/placeholder-image.png');
              }}
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
              Image Optimized & Saved
            </span>
            <span className="text-slate-400 font-mono text-[10px]">1280×1280 HD</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/30 rounded-2xl p-6 text-center bg-slate-50 transition-all cursor-pointer ${
            isProcessing ? 'opacity-60 cursor-wait' : ''
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
              <p className="text-xs font-bold text-slate-700">Optimizing & Compressing Image...</p>
              <p className="text-[10px] text-slate-400">Processing up to 200 MB upload</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Click or Drag & Drop to Upload Image</p>
                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">{targetSizeText}</p>
                <p className="text-[9.5px] text-slate-400 font-semibold uppercase mt-1">Formats: JPG, JPEG, PNG, WebP (Max 200 MB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
