import React from 'react';
import { Layers, Sun, Moon, HelpCircle } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenInfo,
}) => {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              WebP Studio
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              1612 × 801 无损重构
            </span>
          </div>
        </div>

        {/* Zone 2: Concise navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <span className="text-neutral-900 dark:text-neutral-100">
            无损转换
          </span>
          <button
            onClick={onOpenInfo}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap"
          >
            1612×801 规格解析
          </button>
          <button
            onClick={onOpenInfo}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap"
          >
            WebP 压缩原理
          </button>
          <span className="text-neutral-400 dark:text-neutral-500 cursor-default">
            本地离线安全
          </span>
        </nav>

        {/* Zone 3: Primary action + Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenInfo}
            title="查看规格与技术说明"
            aria-label="查看规格与技术说明"
            className="p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleDarkMode}
            title={darkMode ? '切换为浅色模式' : '切换为深色模式'}
            aria-label="切换主题模式"
            className="p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
