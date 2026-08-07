import React from 'react';

export default function InteractiveCropperModal({
  imageSrc,
  onClose,
  onConfirm
}: {
  imageSrc: string;
  onClose: () => void;
  onConfirm: (croppedUrl: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Default crop box preset: Centered 4:3 Landscape
  const [crop, setCrop] = React.useState({ x: 10, y: 10, w: 80, h: 60 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [activeHandle, setActiveHandle] = React.useState<string | null>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, cropX: 10, cropY: 10, cropW: 80, cropH: 60 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  // Compute 4:3 Aspect Ratio Crop Box based on image dimensions
  const setLandscapePreset = React.useCallback(() => {
    const img = imgRef.current;
    if (!img) {
      setCrop({ x: 10, y: 10, w: 80, h: 60 });
      return;
    }
    const nw = img.naturalWidth || img.width || 1600;
    const nh = img.naturalHeight || img.height || 1200;
    const targetAspect = 1600 / 1200; // 4:3 = 1.3333

    let cropW_px, cropH_px;
    if (nw / nh > targetAspect) {
      cropH_px = nh * 0.8;
      cropW_px = cropH_px * targetAspect;
    } else {
      cropW_px = nw * 0.8;
      cropH_px = cropW_px / targetAspect;
    }

    const wPercent = (cropW_px / nw) * 80;
    const hPercent = (cropH_px / nh) * 80;
    const xPercent = (100 - wPercent) / 2;
    const yPercent = (100 - hPercent) / 2;

    setCrop({ x: xPercent, y: yPercent, w: wPercent, h: hPercent });
  }, []);

  React.useEffect(() => {
    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        setLandscapePreset();
      } else {
        img.onload = () => setLandscapePreset();
      }
    }
  }, [setLandscapePreset]);

  const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setActiveHandle(handle || 'move');
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
      cropW: crop.w,
      cropH: crop.h
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cw = rect.width || 600;
    const ch = rect.height || 340;

    const deltaX = ((e.clientX - dragStart.x) / cw) * 100;
    const deltaY = ((e.clientY - dragStart.y) / ch) * 100;

    if (activeHandle === 'move') {
      const newX = Math.max(0, Math.min(100 - dragStart.cropW, dragStart.cropX + deltaX));
      const newY = Math.max(0, Math.min(100 - dragStart.cropH, dragStart.cropY + deltaY));
      setCrop(prev => ({ ...prev, x: newX, y: newY }));
    } else {
      // Locked 4:3 Aspect Ratio handling
      const targetAspect = 1600 / 1200; // 4:3 = 1.3333
      const dragWidthPx = (dragStart.cropW / 100) * cw;
      const mouseDeltaPx = activeHandle === 'se' ? Math.max(e.clientX - dragStart.x, (e.clientY - dragStart.y) * targetAspect)
        : activeHandle === 'nw' ? Math.max(dragStart.x - e.clientX, (dragStart.y - e.clientY) * targetAspect)
        : activeHandle === 'ne' ? Math.max(e.clientX - dragStart.x, (dragStart.y - e.clientY) * targetAspect)
        : Math.max(dragStart.x - e.clientX, (e.clientY - dragStart.y) * targetAspect);

      const maxW_px = Math.min(cw, ch * targetAspect);
      const newWidthPx = Math.max(80, Math.min(maxW_px * 0.95, dragWidthPx + mouseDeltaPx));
      const newHeightPx = newWidthPx / targetAspect;

      const newW = (newWidthPx / cw) * 100;
      const newH = (newHeightPx / ch) * 100;

      if (activeHandle === 'se') {
        const newX = Math.min(100 - newW, dragStart.cropX);
        const newY = Math.min(100 - newH, dragStart.cropY);
        setCrop({ x: newX, y: newY, w: newW, h: newH });
      } else if (activeHandle === 'nw') {
        const deltaW = (newWidthPx - dragWidthPx);
        const newX = Math.max(0, dragStart.cropX - (deltaW / cw) * 100);
        const newY = Math.max(0, dragStart.cropY - ((deltaW / targetAspect) / ch) * 100);
        setCrop({ x: newX, y: newY, w: newW, h: newH });
      } else if (activeHandle === 'ne') {
        const deltaW = (newWidthPx - dragWidthPx);
        const newX = Math.min(100 - newW, dragStart.cropX);
        const newY = Math.max(0, dragStart.cropY - ((deltaW / targetAspect) / ch) * 100);
        setCrop({ x: newX, y: newY, w: newW, h: newH });
      } else if (activeHandle === 'sw') {
        const deltaW = (newWidthPx - dragWidthPx);
        const newX = Math.max(0, dragStart.cropX - (deltaW / cw) * 100);
        const newY = Math.min(100 - newH, dragStart.cropY);
        setCrop({ x: newX, y: newY, w: newW, h: newH });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  const executeCrop = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const nw = img.naturalWidth || 1600;
    const nh = img.naturalHeight || 1200;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Calculate crop box position in container px
    const cropLeftPx = (crop.x / 100) * containerRect.width;
    const cropTopPx = (crop.y / 100) * containerRect.height;
    const cropWidthPx = (crop.w / 100) * containerRect.width;
    const cropHeightPx = (crop.h / 100) * containerRect.height;

    // Calculate crop box position relative to actual rendered image
    const imgOffsetLeftPx = imgRect.left - containerRect.left;
    const imgOffsetTopPx = imgRect.top - containerRect.top;

    const relLeftPx = cropLeftPx - imgOffsetLeftPx;
    const relTopPx = cropTopPx - imgOffsetTopPx;

    // Scale to natural image resolution
    const scaleX = nw / (imgRect.width || 1);
    const scaleY = nh / (imgRect.height || 1);

    const sourceX = Math.max(0, relLeftPx * scaleX);
    const sourceY = Math.max(0, relTopPx * scaleY);
    const sourceW = Math.min(nw - sourceX, Math.max(1, cropWidthPx * scaleX));
    const sourceH = Math.min(nh - sourceY, Math.max(1, cropHeightPx * scaleY));

    // Target exact 1600 x 1200 px HD Landscape resolution
    const targetW = 1600;
    const targetH = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill neutral white canvas background first
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);

      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceW, sourceH,
        0, 0, canvas.width, canvas.height
      );
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onConfirm(croppedDataUrl);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div style={{ background: 'white', borderRadius: '16px', maxWidth: '700px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #E5E7EB', userSelect: 'none' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>✂️ Image Crop & Adjust (1600 × 1200 px HD)</h3>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>Drag green box or corner handles to reposition crop area (Default preset: 1600 × 1200 px HD)</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#F3F4F6', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700, color: '#4b5563' }}>✕</button>
        </div>

        {/* Cropper Workspace */}
        <div
          ref={containerRef}
          style={{ position: 'relative', height: '340px', background: '#0F172A', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop Target"
            onLoad={setLandscapePreset}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease'
            }}
          />

          {/* Interactive Crop Mask */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            style={{
              position: 'absolute',
              top: `${crop.y}%`,
              left: `${crop.x}%`,
              width: `${crop.w}%`,
              height: `${crop.h}%`,
              border: '2px solid #22c55e',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
              borderRadius: '4px',
              cursor: isDragging ? 'grabbing' : 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Crop Tag Label */}
            <span style={{ position: 'absolute', top: '6px', left: '6px', background: '#22c55e', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, pointerEvents: 'none' }}>
              Drag Box / Resize Corners
            </span>

            {/* Corner Resize Handles */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              style={{ position: 'absolute', top: '-6px', left: '-6px', width: '14px', height: '14px', background: '#22c55e', border: '2px solid white', borderRadius: '3px', cursor: 'nwse-resize' }}
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              style={{ position: 'absolute', top: '-6px', right: '-6px', width: '14px', height: '14px', background: '#22c55e', border: '2px solid white', borderRadius: '3px', cursor: 'nesw-resize' }}
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '14px', height: '14px', background: '#22c55e', border: '2px solid white', borderRadius: '3px', cursor: 'nesw-resize' }}
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '14px', height: '14px', background: '#22c55e', border: '2px solid white', borderRadius: '3px', cursor: 'nwse-resize' }}
            />
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Zoom ({zoom.toFixed(1)}x)</label>
            <input type="range" min="0.8" max="2.5" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#16a34a' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Rotation ({rotation}°)</label>
            <button onClick={() => setRotation(r => (r + 90) % 360)} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, background: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
              🔄 Rotate 90°
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            ✨ Exports 1600 × 1200 px HD Image
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: 600, background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={executeCrop} style={{ padding: '9px 24px', fontSize: '13px', fontWeight: 700, background: '#16a34a', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✓ Confirm Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
