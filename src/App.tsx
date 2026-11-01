import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ControlPanel } from './components/ControlPanel';
import { ComparisonSlider } from './components/ComparisonSlider';
import { InteractiveCropper } from './components/InteractiveCropper';
import { StatsCard } from './components/StatsCard';
import { BatchQueue } from './components/BatchQueue';
import { InfoModal } from './components/InfoModal';
import { ImageMetadata, ProcessOptions, ProcessResult, BatchItem } from './types';
import { processImageToWebP, loadImage } from './utils/imageProcessor';
import { SAMPLE_IMAGES, SampleImage } from './utils/sampleImages';
import { Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [items, setItems] = useState<BatchItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const [options, setOptions] = useState<ProcessOptions>({
    targetWidth: 1612,
    targetHeight: 801,
    fitMode: 'cover',
    quality: 1.0, // 100% Lossless WebP
    backgroundMode: 'blur',
    customBgColor: '#0f172a',
    zoom: 1,
    panX: 0,
    panY: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  // Sync dark class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activeItem = items.find((i) => i.id === activeItemId) || items[0] || null;

  // Process a single item
  const processItem = useCallback(
    async (item: BatchItem, currentOptions: ProcessOptions): Promise<ProcessResult> => {
      return await processImageToWebP(item.meta.originalUrl, currentOptions);
    },
    []
  );

  // Re-process active item whenever options or activeItem changes
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!activeItem) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const result = await processItem(activeItem, options);
        setItems((prev) =>
          prev.map((i) =>
            i.id === activeItem.id
              ? { ...i, status: 'completed', result }
              : i
          )
        );
      } catch (err) {
        console.error('Processing error:', err);
        setItems((prev) =>
          prev.map((i) =>
            i.id === activeItem.id
              ? { ...i, status: 'error', error: String(err) }
              : i
          )
        );
      } finally {
        setIsProcessing(false);
      }
    }, 60);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeItem?.id, activeItem?.meta.originalUrl, options, processItem]);

  // Load File[] into batch items
  const handleImagesSelected = useCallback(
    async (files: File[]) => {
      const newItems: BatchItem[] = [];

      for (const file of files) {
        const objectUrl = URL.createObjectURL(file);
        try {
          const img = await loadImage(objectUrl);
          const meta: ImageMetadata = {
            name: file.name,
            originalSize: file.size,
            originalWidth: img.naturalWidth || img.width,
            originalHeight: img.naturalHeight || img.height,
            originalFormat: file.type.replace('image/', '') || 'unknown',
            originalUrl: objectUrl,
            file,
          };

          const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          newItems.push({
            id,
            meta,
            status: 'pending',
          });
        } catch (e) {
          console.error('Failed to inspect image:', file.name, e);
        }
      }

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
        setActiveItemId(newItems[0].id);

        // Process all newly added items
        for (const item of newItems) {
          try {
            const res = await processItem(item, options);
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, status: 'completed', result: res } : i))
            );
          } catch (e) {
            console.error('Batch item process failure', e);
          }
        }
      }
    },
    [options, processItem]
  );

  // Load a procedural sample image
  const handleSampleSelected = useCallback(
    async (sample: SampleImage) => {
      const dataUrl = sample.generate();
      const img = await loadImage(dataUrl);

      // Estimate byte length of dataUrl
      const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
      const approxBytes = Math.floor(base64Length * 0.75);

      const meta: ImageMetadata = {
        name: `${sample.id}.jpg`,
        originalSize: approxBytes,
        originalWidth: sample.width,
        originalHeight: sample.height,
        originalFormat: 'png',
        originalUrl: dataUrl,
      };

      const id = `sample-${Date.now()}`;
      const newItem: BatchItem = {
        id,
        meta,
        status: 'pending',
      };

      setItems([newItem]);
      setActiveItemId(id);

      const result = await processImageToWebP(dataUrl, options);
      setItems([{ ...newItem, status: 'completed', result }]);
    },
    [options]
  );

  // Single download
  const handleDownload = () => {
    if (!activeItem?.result) return;
    const blob = activeItem.result.blob;
    const baseName = activeItem.meta.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_1612x801.webp`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3000);
  };

  // Download all completed items in batch
  const handleDownloadAll = () => {
    const completed = items.filter((i) => i.result && i.status === 'completed');
    completed.forEach((item, index) => {
      setTimeout(() => {
        if (!item.result) return;
        const blob = item.result.blob;
        const baseName = item.meta.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_1612x801.webp`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, index * 250);
    });

    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3000);
  };

  // Copy Data URL
  const handleCopyDataUrl = async () => {
    if (!activeItem?.result) return;
    try {
      await navigator.clipboard.writeText(activeItem.result.dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = activeItem.result.dataUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset custom zoom/pan
  const handleResetPanZoom = () => {
    setOptions((prev) => ({
      ...prev,
      zoom: 1,
      panX: 0,
      panY: 0,
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (activeItemId === id) {
        setActiveItemId(next[0]?.id || null);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenInfo={() => setInfoModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Feature Lead */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <span>WebP 1612 × 801 无损重构工作台</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                100% 无损算法
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              上传任意图片，自动转换为新一代 WebP 格式并精确缩放至 1612×801 像素，支持多种取景模式
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
            <span>分辨率: 1612 × 801 px</span>
            <span>·</span>
            <span>格式: WebP (VP8L)</span>
          </div>
        </div>

        {/* When no image is uploaded yet */}
        {!activeItem ? (
          <div className="space-y-6">
            <DropZone
              onImagesSelected={handleImagesSelected}
              onSampleSelected={handleSampleSelected}
            />

            {/* Quick spec cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <span className="font-mono font-bold text-xs">1:1</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  精准 1612 × 801 分辨率
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  严格锁定 1612 像素宽度与 801 像素高度，宽高比约 2.012:1，完美匹配高端宽幅横幅与高质量展示位。
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  原生 WebP 无损压缩
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  采用 Google WebP 无损算法，在保留每个像素绝对保真度的同时，比 PNG 节省约 26% 空间，加载更迅猛。
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  四种构图适配模式
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  支持智能居中裁切 (Cover)、等比留白模糊填充 (Contain)、交互自由取景 (Pan & Zoom) 与强制拉伸铺满。
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Image Studio */
          <div className="space-y-6">
            {/* Compact Uploader & Batch Queue Bar */}
            <div className="space-y-4">
              <DropZone
                onImagesSelected={handleImagesSelected}
                onSampleSelected={handleSampleSelected}
                compact={true}
              />

              <BatchQueue
                items={items}
                onSelectItem={(item) => setActiveItemId(item.id)}
                onRemoveItem={handleRemoveItem}
                onDownloadItem={(item) => {
                  setActiveItemId(item.id);
                  handleDownload();
                }}
                onDownloadAll={handleDownloadAll}
                activeItemId={activeItemId}
              />
            </div>

            {/* Main Studio 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Visual Canvas (Comparison or Custom Cropper) */}
              <div className="lg:col-span-7 space-y-4">
                {options.fitMode === 'custom' ? (
                  <InteractiveCropper
                    imageSrc={activeItem.meta.originalUrl}
                    options={options}
                    onOptionsChange={setOptions}
                  />
                ) : (
                  <ComparisonSlider
                    originalMeta={activeItem.meta}
                    result={activeItem.result || null}
                    isProcessing={isProcessing}
                  />
                )}

                {/* Technical Stats Card */}
                <StatsCard
                  originalMeta={activeItem.meta}
                  result={activeItem.result || null}
                />
              </div>

              {/* Right Column: Control Panel */}
              <div className="lg:col-span-5">
                <ControlPanel
                  options={options}
                  onOptionsChange={setOptions}
                  onDownload={handleDownload}
                  onCopyDataUrl={handleCopyDataUrl}
                  onReset={handleResetPanZoom}
                  isProcessing={isProcessing}
                  copied={copied}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 py-6 text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              WebP 1612×801 Studio
            </span>
            <span>·</span>
            <span>客户端高保真图像处理引擎</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>像素总数: 1,291,212 px</span>
            <span>·</span>
            <span>格式标准: RFC 7914 / VP8L</span>
            <span>·</span>
            <span>零隐私上传</span>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      <InfoModal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} />

      {/* Download Success Toast */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>WebP 1612×801 文件已成功下载到您的设备！</span>
        </div>
      )}
    </div>
  );
}
