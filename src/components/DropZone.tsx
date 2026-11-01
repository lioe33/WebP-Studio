import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Clipboard, ShieldCheck } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '../utils/sampleImages';

interface DropZoneProps {
  onImagesSelected: (files: File[]) => void;
  onSampleSelected: (sample: SampleImage) => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onImagesSelected,
  onSampleSelected,
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        onImagesSelected(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImagesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onImagesSelected(files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onImagesSelected(files);
      }
    }
    // Reset value so same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 border border-dashed rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4 ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900/60 hover:border-neutral-400 dark:hover:border-neutral-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
            <UploadCloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              替换或上传新图片
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              点击、拖拽或按 <kbd className="font-mono px-1 py-0.5 bg-neutral-100 dark:bg-slate-800 rounded text-[10px]">Ctrl+V</kbd> 粘贴
            </p>
          </div>
        </div>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          浏览文件
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 scale-[0.995]'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900/40 hover:border-emerald-500/70 hover:bg-neutral-50/50 dark:hover:bg-slate-800/20 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50 dark:ring-emerald-950/20">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
            拖拽或点击上传图片
          </h2>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 max-w-sm">
            支持 JPG、PNG、AVIF、GIF、BMP、SVG 等格式，一键重采样至{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              1612 × 801
            </strong>{' '}
            分辨率并输出无损 WebP
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-6">
            <span className="flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5 text-neutral-400" />
              支持截图直接 <kbd className="font-mono px-1.5 py-0.5 bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-neutral-700 rounded text-[11px]">Ctrl+V</kbd> 粘贴
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              纯本地 Canvas 处理，零服务器上传
            </span>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm transition-all whitespace-nowrap"
          >
            选择本地图片文件
          </button>
        </div>
      </div>

      {/* Instant sample images shelf */}
      <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            暂无现成图片？点击一秒加载测试样本：
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={(e) => {
                e.stopPropagation();
                onSampleSelected(sample);
              }}
              className="group p-3 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-sm transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {sample.title}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                  {sample.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
