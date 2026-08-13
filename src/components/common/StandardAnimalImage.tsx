'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Beef, ImageOff, Maximize2, X } from 'lucide-react';

import { resolveImageUrl } from '@/utils/imageUrl';

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
  allowZoom = false,
}: StandardAnimalImageProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const resolvedSrc = src ? resolveImageUrl(src) : null;
  const hasImage = Boolean(resolvedSrc && resolvedSrc.trim() !== '' && resolvedSrc !== '/logo.png' && resolvedSrc !== '/apple-touch-icon.png');


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
          <div
            className="relative w-full h-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              if (allowZoom) {
                e.stopPropagation();
                setIsZoomed(true);
              }
            }}
          >
            <img
              ref={imgRef}
              src={resolvedSrc!}
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
              <div className="absolute bottom-2 right-2 bg-slate-900/60 backdrop-blur-xs text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none bg-slate-50">
            <Beef className="h-7 w-7 text-slate-300 mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{fallbackText}</span>
          </div>
        )}
      </div>

      {/* High Definition Zoom Lightbox Modal */}
      {isZoomed && hasImage && resolvedSrc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl p-2 border border-slate-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-10 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-white text-xs font-bold mt-4 tracking-wide text-center bg-slate-900/80 px-4 py-2 rounded-full border border-white/10">
              {alt} • 1:1 HD Standard Image
            </p>
          </div>
        </div>
      )}
    </>
  );
}
