import React from 'react';
import { ArrowRight, Clock, FileCheck, HardDrive, Cpu, Percent } from 'lucide-react';
import { ImageMetadata, ProcessResult } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface StatsCardProps {
  originalMeta: ImageMetadata;
  result: ProcessResult | null;
}

export const StatsCard: React.FC<StatsCardProps> = ({ originalMeta, result }) => {
  if (!result) return null;

  const sizeDiff = originalMeta.originalSize - result.fileSize;
  const ratio = (sizeDiff / originalMeta.originalSize) * 100;
  const isReduced = sizeDiff > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            转换与压缩性能报告
          </h3>
        </div>
        <div className="text-xs text-neutral-500 font-mono">
          Canvas 2D / WebP Engine
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Resolution */}
        <div className="p-3 bg-neutral-50 dark:bg-slate-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>分辨率转换</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100">
            <span className="text-neutral-500 line-through">
              {originalMeta.originalWidth}×{originalMeta.originalHeight}
            </span>
            <ArrowRight className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              1612 × 801
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono">
            总计 1,291,212 像素
          </div>
        </div>

        {/* Metric 2: File Size */}
        <div className="p-3 bg-neutral-50 dark:bg-slate-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <HardDrive className="w-3.5 h-3.5" />
            <span>文件体积变化</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100">
            <span className="text-neutral-500">
              {formatBytes(originalMeta.originalSize)}
            </span>
            <ArrowRight className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatBytes(result.fileSize)}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono">
            格式: {originalMeta.originalFormat.toUpperCase()} → WEBP
          </div>
        </div>

        {/* Metric 3: Compression Ratio */}
        <div className="p-3 bg-neutral-50 dark:bg-slate-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <Percent className="w-3.5 h-3.5" />
            <span>体积优化率</span>
          </div>
          <div className="text-base font-mono font-bold">
            {isReduced ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                节省 {Math.abs(ratio).toFixed(1)}%
              </span>
            ) : (
              <span className="text-neutral-700 dark:text-neutral-300">
                变动 {ratio > 0 ? '-' : '+'}{Math.abs(ratio).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {isReduced ? `减少 ${formatBytes(sizeDiff)} 存储占用` : '包含完整无损重采样数据'}
          </div>
        </div>

        {/* Metric 4: Processing Time */}
        <div className="p-3 bg-neutral-50 dark:bg-slate-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>重构耗时</span>
          </div>
          <div className="text-base font-mono font-bold text-neutral-900 dark:text-neutral-100">
            {result.durationMs} <span className="text-xs font-normal text-neutral-500">毫秒 (ms)</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            客户端本地硬件加速
          </div>
        </div>
      </div>
    </div>
  );
};
