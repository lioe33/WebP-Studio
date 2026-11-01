import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';
import { ProcessOptions } from '../types';

interface InteractiveCropperProps {
  imageSrc: string;
  options: ProcessOptions;
  onOptionsChange: (newOptions: ProcessOptions) => void;
}

export const InteractiveCropper: React.FC<InteractiveCropperProps> = ({
  imageSrc,
  options,
  onOptionsChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startPanRef = useRef({ x: 0, y: 0 });

  const zoom = options.zoom ?? 1;
  const panX = options.panX ?? 0;
  const panY = options.panY ?? 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { x: panX, y: panY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    // Scale delta relative to 1612x801 coordinate space
    const rect = containerRef.current?.getBoundingClientRect();
    const scaleFactor = rect ? 1612 / rect.width : 1;

    onOptionsChange({
      ...options,
      panX: startPanRef.current.x + deltaX * scaleFactor,
      panY: startPanRef.current.y + deltaY * scaleFactor,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
    const newZoom = Math.max(0.5, Math.min(4.0, zoom + zoomStep));
    onOptionsChange({
      ...options,
      zoom: Number(newZoom.toFixed(2)),
    });
  };

  const resetPanZoom = () => {
    onOptionsChange({
      ...options,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          <Move className="w-3.5 h-3.5 text-emerald-600" />
          <span>在下方画布中自由拖拽平移、滚轮缩放取景</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
            <button
              type="button"
              onClick={() =>
                onOptionsChange({
                  ...options,
                  zoom: Math.max(0.5, Number((zoom - 0.1).toFixed(2))),
                })
              }
              className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              title="缩小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-medium w-12 text-center text-neutral-700 dark:text-neutral-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                onOptionsChange({
                  ...options,
                  zoom: Math.min(4.0, Number((zoom + 0.1).toFixed(2))),
                })
              }
              className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={resetPanZoom}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 text-xs flex items-center gap-1"
            title="居中重置"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-full aspect-[1612/801] rounded-2xl overflow-hidden border-2 border-emerald-500/80 bg-neutral-950 cursor-grab active:cursor-grabbing select-none shadow-md"
      >
        {/* Render base image with current transform */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center transition-none"
          style={{
            transform: `translate(${panX * (containerRef.current ? containerRef.current.clientWidth / 1612 : 0.5)}px, ${
              panY * (containerRef.current ? containerRef.current.clientHeight / 801 : 0.5)
            }px) scale(${zoom})`,
          }}
        >
          <img
            src={imageSrc}
            alt="裁剪预览"
            className="w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Rule of thirds grid lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-emerald-500/30">
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-r border-white/20" />
          <div />
        </div>

        {/* Framing badge */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/75 text-emerald-300 font-mono text-[11px] pointer-events-none border border-emerald-500/40">
          1612 × 801 构图取景框
        </div>
      </div>
    </div>
  );
};
