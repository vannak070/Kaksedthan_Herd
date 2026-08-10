'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Beef, ImageOff, Maximize2, X } from 'lucide-react';

export interface StandardAnimalImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  fallbackText?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animalType?: 'sire' | 'dam' | 'calf' | 'animal';
  allowZoom?: boolean;
}

export default function StandardAnimalImage({
  src,
  alt = 'Animal Photo',
  className = '',
  containerClassName = '',
  fallbackText = 'No Image',
  size = 'full',
  animalType = 'animal',
  allowZoom = true,
}: StandardAnimalImageProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const hasImage = Boolean(src && typeof src === 'string' && src.trim() !== '' && src !== '/logo.png');

  useEffect(() => {
    setLoading(true);
    setError(false);

    if (imgRef.current) {
      if (imgRef.current.complete) {
        if (imgRef.current.naturalWidth === 0) {
          setError(true);
        }
        setLoading(false);
      }
    }
  }, [src]);

  const sizeClasses = {
    sm: 'w-12 h-12 rounded-xl flex-shrink-0',
    md: 'w-20 h-20 rounded-2xl flex-shrink-0',
    lg: 'w-28 h-28 rounded-2xl flex-shrink-0',
    xl: 'w-36 h-36 sm:w-40 sm:h-40 rounded-3xl flex-shrink-0',
    full: 'w-full aspect-square rounded-3xl',
  }[size];

  const themeBadges = {
    sire: 'bg-orange-50 text-[#dc5c15]',
    dam: 'bg-purple-50 text-purple-600',
    calf: 'bg-indigo-50 text-indigo-600',
    animal: 'bg-slate-50 text-slate-600',
  }[animalType];

  return (
    <>
      <div
        className={`relative aspect-square bg-slate-100 overflow-hidden border border-slate-200/90 shadow-2xs group ${sizeClasses} ${containerClassName}`}
      >
        {/* Loading Skeleton */}
        {loading && hasImage && !error && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-10">
            <Beef className="h-8 w-8 text-slate-300 animate-bounce" />
          </div>
        )}

        {/* Main Image */}
        {hasImage && !error ? (
          <div className="relative w-full h-full cursor-pointer overflow-hidden" onClick={() => allowZoom && setIsZoomed(true)}>
            <img
              ref={imgRef}
              src={src!}
              alt={alt}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
              className={`w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 ${
                loading ? 'opacity-0' : 'opacity-100'
              } ${className}`}
            />
            {allowZoom && (
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="h-5 w-5 drop-shadow-md" />
              </div>
            )}
          </div>
        ) : (
          /* Standardized Empty / Error Placeholder Container (1:1 Ratio) */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 p-3 text-center space-y-1 select-none">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${themeBadges}`}>
              {error ? <ImageOff className="h-4 w-4" /> : <Beef className="h-4 w-4" />}
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight">
              {error ? 'Image Unavailable' : fallbackText}
            </span>
          </div>
        )}
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {isZoomed && hasImage && !error && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 bg-slate-800/80 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black max-h-[80vh]">
              <img
                src={src!}
                alt={alt}
                className="max-h-[80vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>
            <p className="text-white text-xs font-bold mt-4 tracking-wide text-center bg-slate-900/80 px-4 py-2 rounded-full border border-white/10">
              {alt} • 1:1 HD Standard Image
            </p>
          </div>
        </div>
      )}
    </>
  );
}
