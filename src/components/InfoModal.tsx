import React from 'react';
import { X, CheckCircle, ShieldCheck, Zap, Image as ImageIcon } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              技术规格与转换原理
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              1. 目标分辨率 1612 × 801 (≈ 2.012 : 1)
            </h4>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed pl-6">
              1612 × 801 是高端 Web 应用首屏视窗 Banner、电商产品展台、高分辨率大卡片（Retina 2x 适配 806×400 或 3x 适配）的标准画幅。像素总计精确达到 1,291,212 像素，兼顾宽广视野与视网膜级锐度。
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              2. WebP 无损压缩 (VP8L Lossless)
            </h4>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed pl-6">
              WebP 无损格式利用预测编码、色彩变换、熵编码和 LZ77-Huffman 混合压缩，在保留图像 100% 原始色彩与透明 Alpha 通道的同时，比同画质 PNG 平均缩减 26% 体积，加载极速。
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. 纯本地沙盒与隐私安全
            </h4>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed pl-6">
              本工具所有重采样缩放与 WebP 编码计算均通过浏览器原生 HTML5 Canvas 2D 及 GPU 硬件加速在您本地设备端完成。您的私密图片与照片绝不会上传至任何远程服务器。
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            了解并返回
          </button>
        </div>
      </div>
    </div>
  );
};
