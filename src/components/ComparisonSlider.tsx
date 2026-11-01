import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, SplitSquareVertical, ZoomIn, Eye } from 'lucide-react';
import { ImageMetadata, ProcessResult } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface ComparisonSliderProps {
  originalMeta: ImageMetadata;
  result: ProcessResult | null;
  isProcessing: boolean;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalMeta,
  result,
  isProcessing,
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'split' | 'side' | 'inspect'>('split');
  const [inspectZoom, setInspectZoom] = useState(1.5);
  const [inspectPos, setInspectPos] = useState({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updateSlider(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  // Keyboard navigation for slider
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPos((prev) => Math.min(100, prev + 5));
    }
  };

  const handleInspectMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'inspect') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setInspectPos({ x, y });
  };

  return (
    <div className="space-y-3">
      {/* View Mode Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>滑块对比</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              viewMode === 'side'
                ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>并排对比</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('inspect')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              viewMode === 'inspect'
                ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>放大镜检查</span>
          </button>
        </div>

        {viewMode === 'inspect' && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>倍率:</span>
            {[1.5, 2, 3].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setInspectZoom(z)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                  inspectZoom === z
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {z}x
              </button>
            ))}
          </div>
        )}

        <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
          <span>画幅比 1612:801 (≈ 2.01 : 1)</span>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === 'split' && (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-valuenow={Math.round(sliderPos)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="拖动滑块对比原图与 1612x801 WebP"
          className="relative w-full aspect-[1612/801] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 select-none shadow-sm cursor-ew-resize focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          {/* Target Result (Right / Bottom layer) */}
          <div className="absolute inset-0 w-full h-full">
            {result ? (
              <img
                src={result.dataUrl}
                alt="转换后的 1612x801 WebP"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                处理中...
              </div>
            )}

            {/* Label Bottom Right */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-neutral-900/80 backdrop-blur-md text-emerald-400 font-mono text-[11px] font-semibold border border-neutral-800">
              WebP 1612×801 · {result ? formatBytes(result.fileSize) : '--'}
            </div>
          </div>

          {/* Original Image (Left / Clipped overlay) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                maxWidth: 'none',
              }}
            >
              <img
                src={originalMeta.originalUrl}
                alt="原始输入图片"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Label Bottom Left */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-neutral-900/80 backdrop-blur-md text-neutral-300 font-mono text-[11px] font-semibold border border-neutral-800 whitespace-nowrap">
              原图 ({originalMeta.originalWidth}×{originalMeta.originalHeight}) · {formatBytes(originalMeta.originalSize)}
            </div>
          </div>

          {/* Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 text-neutral-800 dark:text-neutral-200 border-2 border-emerald-500 shadow-lg flex items-center justify-center text-xs">
              <SplitSquareVertical className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {isProcessing && (
            <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center z-30">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/90 text-white text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                正在实时重采样与编码...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side View */}
      {viewMode === 'side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 flex flex-col">
            <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">原始图像 (Original)</span>
              <span className="font-mono text-neutral-400">
                {originalMeta.originalWidth} × {originalMeta.originalHeight} · {formatBytes(originalMeta.originalSize)}
              </span>
            </div>
            <div className="aspect-[1612/801] w-full flex items-center justify-center overflow-hidden p-2">
              <img
                src={originalMeta.originalUrl}
                alt="原图"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Result WebP 1612x801 */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 flex flex-col ring-1 ring-emerald-500/30">
            <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400">无损重构 1612×801 WebP</span>
              <span className="font-mono text-emerald-400">
                1612 × 801 · {result ? formatBytes(result.fileSize) : '--'}
              </span>
            </div>
            <div className="aspect-[1612/801] w-full flex items-center justify-center overflow-hidden p-2">
              {result && (
                <img
                  src={result.dataUrl}
                  alt="WebP"
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1:1 Pixel Inspection */}
      {viewMode === 'inspect' && result && (
        <div
          onMouseMove={handleInspectMouseMove}
          className="relative w-full aspect-[1612/801] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 cursor-crosshair"
        >
          <div
            className="w-full h-full transition-transform duration-75"
            style={{
              backgroundImage: `url(${result.dataUrl})`,
              backgroundPosition: `${inspectPos.x}% ${inspectPos.y}%`,
              backgroundSize: `${inspectZoom * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-neutral-900/90 text-neutral-300 text-xs backdrop-blur-md flex items-center gap-2 border border-neutral-800">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>移动鼠标查看 1612×801 像素微观锐利度与边缘质量</span>
          </div>
        </div>
      )}
    </div>
  );
};
