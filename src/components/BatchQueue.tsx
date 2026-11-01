import React from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { BatchItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface BatchQueueProps {
  items: BatchItem[];
  onSelectItem: (item: BatchItem) => void;
  onRemoveItem: (id: string) => void;
  onDownloadItem: (item: BatchItem) => void;
  onDownloadAll: () => void;
  activeItemId: string | null;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  items,
  onSelectItem,
  onRemoveItem,
  onDownloadItem,
  onDownloadAll,
  activeItemId,
}) => {
  if (items.length <= 1) return null;

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            批量队列 ({completedCount} / {items.length} 张已就绪)
          </h4>
        </div>
        <button
          type="button"
          onClick={onDownloadAll}
          disabled={completedCount === 0}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>一键下载全部 WebP</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = item.id === activeItemId;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                isActive
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-600'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="w-12 h-8 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-700">
                <img
                  src={item.result?.dataUrl || item.meta.originalUrl}
                  alt={item.meta.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {item.meta.name}
                </p>
                <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <span>{formatBytes(item.meta.originalSize)}</span>
                  <span>→</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {item.result ? formatBytes(item.result.fileSize) : '1612×801'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {item.status === 'processing' && (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                )}
                {item.status === 'completed' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadItem(item);
                    }}
                    title="下载此张"
                    className="p-1.5 text-neutral-500 hover:text-emerald-600 hover:bg-neutral-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  title="移除"
                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
