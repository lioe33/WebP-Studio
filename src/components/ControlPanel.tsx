import React from 'react';
import {
  Crop,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Palette,
  Lock,
} from 'lucide-react';
import { FitMode, BackgroundMode, ProcessOptions } from '../types';

interface ControlPanelProps {
  options: ProcessOptions;
  onOptionsChange: (newOptions: ProcessOptions) => void;
  onDownload: () => void;
  onCopyDataUrl: () => void;
  onReset: () => void;
  isProcessing: boolean;
  copied: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  options,
  onOptionsChange,
  onDownload,
  onCopyDataUrl,
  onReset,
  isProcessing,
  copied,
}) => {
  const updateOption = <K extends keyof ProcessOptions>(key: K, value: ProcessOptions[K]) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const fitModes: { id: FitMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'cover',
      label: '智能裁切 (Cover)',
      desc: '保持比例，填满 1612×801 并裁剪超出边缘',
      icon: <Crop className="w-4 h-4" />,
    },
    {
      id: 'contain',
      label: '等比留白 (Contain)',
      desc: '原图完整无裁切，四周填充背景色或模糊',
      icon: <Minimize2 className="w-4 h-4" />,
    },
    {
      id: 'custom',
      label: '自由取景 (Pan & Zoom)',
      desc: '在预览窗口中手动拖动构图与缩放',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: 'stretch',
      label: '强制拉伸 (Stretch)',
      desc: '拉伸铺满 1612×801（可能会轻微变形）',
      icon: <Maximize2 className="w-4 h-4" />,
    },
  ];

  const qualityPresets = [
    { value: 1.0, label: '无损 100%', tag: 'True Lossless WebP' },
    { value: 0.95, label: '极清 95%', tag: 'Near Lossless' },
    { value: 0.85, label: '均衡 85%', tag: 'Web Recommended' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-6 shadow-xs">
      {/* Target Spec Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              目标输出规格
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              精准锁定目标分辨率与格式
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-neutral-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
            1612 × 801 px · WebP
          </div>
        </div>
      </div>

      {/* Fit Mode Section */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
          缩放与裁切模式
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {fitModes.map((mode) => {
            const isSelected = options.fitMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateOption('fitMode', mode.id)}
                className={`p-3 text-left rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 text-neutral-900 dark:text-neutral-100 ring-1 ring-emerald-600'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-slate-900/40 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-100 dark:bg-slate-800 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {mode.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold">{mode.label}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
                    {mode.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Options (Active only when contain mode is selected) */}
      {options.fitMode === 'contain' && (
        <div className="p-3.5 bg-neutral-50 dark:bg-slate-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-neutral-500" />
              留白填充背景
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              Mode: {options.backgroundMode}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'blur' as BackgroundMode, label: '原图模糊 (推荐)' },
              { id: 'dark' as BackgroundMode, label: '经典深空黑' },
              { id: 'white' as BackgroundMode, label: '纯洁纯白' },
              { id: 'transparent' as BackgroundMode, label: '透明背景' },
              { id: 'custom' as BackgroundMode, label: '自定义色' },
            ].map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => updateOption('backgroundMode', bg.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-center transition-colors truncate ${
                  options.backgroundMode === bg.id
                    ? 'border-emerald-600 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-slate-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>

          {options.backgroundMode === 'custom' && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="color"
                value={options.customBgColor}
                onChange={(e) => updateOption('customBgColor', e.target.value)}
                className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                type="text"
                value={options.customBgColor}
                onChange={(e) => updateOption('customBgColor', e.target.value)}
                className="px-2.5 py-1 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100 w-28"
                placeholder="#ffffff"
              />
              <span className="text-xs text-neutral-500">选择填充边缘的底色</span>
            </div>
          )}
        </div>
      )}

      {/* WebP Compression & Quality Setting */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            WebP 压缩品质 (品质因数)
          </label>
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {Math.round(options.quality * 100)}% {options.quality === 1.0 ? '(无损模式 Lossless)' : ''}
          </span>
        </div>

        {/* Quality Presets */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {qualityPresets.map((preset) => {
            const isMatch = Math.abs(options.quality - preset.value) < 0.01;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateOption('quality', preset.value)}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  isMatch
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="text-xs font-semibold">{preset.label}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 truncate">{preset.tag}</div>
              </button>
            );
          })}
        </div>

        {/* Fine-tuning Slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.01"
            value={options.quality}
            onChange={(e) => updateOption('quality', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-xs font-mono font-medium text-neutral-500 w-12 text-right">
            {(options.quality * 100).toFixed(0)}%
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          当品质设置为 100% 时，将调用浏览器的 WebP 无损算法，保留每个像素的原始保真度。
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={isProcessing}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
        >
          <Download className="w-4 h-4" />
          <span>下载 1612×801 WebP 图片</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCopyDataUrl}
            title="复制 Base64 Data URL"
            className="flex-1 sm:flex-initial py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制' : '复制 Base64'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            title="重置缩放和取景位置"
            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
