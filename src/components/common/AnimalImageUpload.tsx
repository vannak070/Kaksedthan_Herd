'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, Image as ImageLucide, X as CloseIcon, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, CheckCircle2, Move, Crop } from 'lucide-react';

export interface AnimalImageUploadProps {
  value?: string;
  currentImageUrl?: string;
  onChange?: (url: string) => void;
  onImageChange?: (url: string) => void;
  label?: string;
  placeholder?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | '1:1' | '16:9';
  readOnly?: boolean;
}

export default function AnimalImageUpload({
  value,
  currentImageUrl,
  onChange,
  onImageChange,
  label = 'Animal Photo (1:1 Standardized)',
  placeholder = 'Upload Animal Photo',
  aspectRatio = 'square',
  readOnly = false
}: AnimalImageUploadProps) {
  const initialUrl = value || currentImageUrl || null;
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);

  // Modal & Processing State
  const [modalOpen, setModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [fileSizeMb, setFileSizeMb] = useState<string>('0');
  const [fileType, setFileType] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lowResWarning, setLowResWarning] = useState<boolean>(false);

  // Transform Controls (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [processing, setProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setPreviewUrl(value || currentImageUrl || null);
  }, [value, currentImageUrl]);

  // File Validation & Modal Initialization
  const processSelectedFile = (file: File) => {
    setValidationError(null);
    setLowResWarning(false);

    // 1. File Type Validation (JPG, PNG, WebP)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setValidationError('Invalid file format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    // 2. File Size Validation (Max 200 MB)
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 200) {
      setValidationError(`File size (${sizeMb.toFixed(1)} MB) exceeds maximum allowed limit of 200 MB.`);
      return;
    }

    setFileSizeMb(sizeMb.toFixed(2));
    setFileType(file.type.split('/')[1].toUpperCase());

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        if (img.width < 600 || img.height < 600) {
          setLowResWarning(true);
        }
        setRawImageSrc(src);
        setZoom(1.0);
        setPanX(0);
        setPanY(0);
        setModalOpen(true);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (readOnly) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Canvas Live Preview Rendering
  const drawCropPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rawImageSrc) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const size = 400; // Preview Canvas Size
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);

      // Base scaling to fit image inside 1:1 box
      const scaleBase = Math.max(size / img.width, size / img.height);
      const drawWidth = img.width * scaleBase * zoom;
      const drawHeight = img.height * scaleBase * zoom;

      const centerX = (size - drawWidth) / 2 + panX;
      const centerY = (size - drawHeight) / 2 + panY;

      ctx.drawImage(img, centerX, centerY, drawWidth, drawHeight);

      // Overlay 1:1 Square Framing Guidelines
      ctx.strokeStyle = '#dc5c15';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, size, size);

      // Rule of thirds grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size / 3, 0); ctx.lineTo(size / 3, size);
      ctx.moveTo((size * 2) / 3, 0); ctx.lineTo((size * 2) / 3, size);
      ctx.moveTo(0, size / 3); ctx.lineTo(size, size / 3);
      ctx.moveTo(0, (size * 2) / 3); ctx.lineTo(size, (size * 2) / 3);
      ctx.stroke();
    };
    img.src = rawImageSrc;
  }, [rawImageSrc, zoom, panX, panY]);

  useEffect(() => {
    if (modalOpen && rawImageSrc) {
      drawCropPreview();
    }
  }, [modalOpen, rawImageSrc, drawCropPreview]);

  // Mouse Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  // Requirement 3 & 5: Export Standardized 1200 × 1200 Image
  const handleConfirmCrop = () => {
    if (!rawImageSrc) return;
    setProcessing(true);

    const targetSize = 1200; // System Standard Target Dimension
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = targetSize;
    offscreenCanvas.height = targetSize;
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) {
      setProcessing(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const previewSize = 400;
      const ratio = targetSize / previewSize;

      const scaleBase = Math.max(previewSize / img.width, previewSize / img.height);
      const drawWidth = img.width * scaleBase * zoom * ratio;
      const drawHeight = img.height * scaleBase * zoom * ratio;

      const centerX = (targetSize - drawWidth) / 2 + panX * ratio;
      const centerY = (targetSize - drawHeight) / 2 + panY * ratio;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, centerX, centerY, drawWidth, drawHeight);

      // Export 88% JPEG Quality Base64 Data URI (~150KB - 250KB)
      const standardizedDataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.88);

      setPreviewUrl(standardizedDataUrl);
      if (onChange) onChange(standardizedDataUrl);
      if (onImageChange) onImageChange(standardizedDataUrl);

      setProcessing(false);
      setModalOpen(false);
    };
    img.src = rawImageSrc;
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    if (onChange) onChange('');
    if (onImageChange) onImageChange('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">{label}</label>
          <span className="text-[10px] font-bold text-[#dc5c15]">1:1 Square (1200×1200 px)</span>
        </div>
      )}

      {/* Main Upload Box Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#dc5c15] transition-all flex flex-col items-center justify-center group shadow-xs"
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Standardized Animal Profile"
              className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            {!readOnly && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                <label className="cursor-pointer bg-[#dc5c15] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-orange-700 flex items-center gap-2 transition-all cursor-pointer">
                  <CameraIcon className="h-4 w-4" />
                  <span>Adjust / Replace Photo</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileInputChange} />
                </label>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full h-full space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-orange-100/80 text-[#dc5c15] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <ImageLucide className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">{placeholder}</p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Drag & Drop or Click to Browse</p>
            </div>

            {/* Standardized Requirement Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="bg-slate-200/70 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                1200 × 1200 px
              </span>
              <span className="bg-orange-100 text-[#dc5c15] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                Square 1:1
              </span>
              <span className="bg-slate-200/70 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                JPG, PNG, WebP
              </span>
              <span className="bg-slate-200/70 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                Max 200 MB
              </span>
            </div>

            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileInputChange} disabled={readOnly} />
          </label>
        )}
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Requirement 4: INTERACTIVE 1:1 SQUARE CROP & POSITIONING MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Crop className="h-5 w-5 text-[#dc5c15]" />
                <h3 className="text-base font-black text-slate-900">Standardize Animal Image</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Low Resolution Warning Banner */}
            {lowResWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Image quality is low ({originalDimensions.width} × {originalDimensions.height} px). For best results, use an image at least 600 × 600 px.</span>
              </div>
            )}

            {/* Interactive Canvas Drag & Pan Container */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-2xl overflow-hidden border-4 border-[#dc5c15] shadow-lg cursor-grab active:cursor-grabbing bg-slate-900 flex items-center justify-center select-none"
              >
                <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                  <Move className="h-3 w-3 text-[#dc5c15]" />
                  <span>Drag to position animal</span>
                </div>
              </div>

              {/* Zoom & Reset Controls */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl w-full justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4 text-slate-400" />
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-32 accent-[#dc5c15] cursor-pointer"
                  />
                  <ZoomIn className="h-4 w-4 text-[#dc5c15]" />
                  <span className="font-mono font-bold text-slate-700 w-10">{Math.round(zoom * 100)}%</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.0);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold px-2.5 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* File Specifications Summary Footer */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center text-xs">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block">Original</span>
                <span className="font-mono font-bold text-slate-800">{originalDimensions.width} × {originalDimensions.height}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-[#dc5c15] block">Target Standard</span>
                <span className="font-mono font-black text-[#dc5c15]">1200 × 1200 px</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block">File Size</span>
                <span className="font-mono font-bold text-slate-800">{fileSizeMb} MB ({fileType})</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={processing}
                className="inline-flex items-center gap-2 bg-[#dc5c15] text-white text-xs font-black px-6 py-2.5 rounded-xl hover:bg-orange-700 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{processing ? 'Processing 1200×1200...' : 'Confirm & Save Standardized Image'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
