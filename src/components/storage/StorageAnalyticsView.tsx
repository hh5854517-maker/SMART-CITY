import React from 'react';
import {
  HardDrive,
  PieChart,
  ShieldCheck,
  AlertCircle,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  ArrowUpRight,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { formatBytes, formatDate, downloadFile } from '../../lib/utils';
import type { FileItem } from '../../types';

export const StorageAnalyticsView: React.FC = () => {
  const { storageStats, files, openPreview, deleteFile, setIsUploadModalOpen } = useVault();

  const activeFiles = files.filter(f => !f.isTrash);
  const usedPercent = Math.min(
    100,
    Math.round((storageStats.usedBytes / storageStats.totalQuotaBytes) * 100)
  );

  const remainingBytes = Math.max(0, storageStats.totalQuotaBytes - storageStats.usedBytes);

  // Largest files in descending order
  const largestFiles = [...activeFiles]
    .sort((a, b) => b.size - a.size)
    .slice(0, 8);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PieChart className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Storage & Quota Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor storage utilization, file distribution, and optimize your cloud capacity.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          Upload More Files
        </button>
      </div>

      {/* Storage Gauge Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Circular / Radial Gauge Simulation */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-brand-600 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - usedPercent / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {usedPercent}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Utilized
                </span>
              </div>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Used</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatBytes(storageStats.usedBytes)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Across {activeFiles.length} stored files
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Free Capacity</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatBytes(remainingBytes)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Out of {formatBytes(storageStats.totalQuotaBytes)} total quota
                </p>
              </div>
            </div>

            {/* Quota Disclaimer alert */}
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Configured Personal Tier: 5 GB</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed">
                  This storage limit is an enforced application-level security quota. Uploads exceeding 5 GB are automatically blocked to prevent account overages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Category Distribution
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageStats.categories.map(cat => {
            const catPercent = storageStats.usedBytes > 0
              ? Math.round((cat.bytes / storageStats.usedBytes) * 100)
              : 0;

            return (
              <div
                key={cat.category}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </span>
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {catPercent}%
                    </span>
                  </div>

                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatBytes(cat.bytes)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cat.count} {cat.count === 1 ? 'file' : 'files'}
                  </p>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${catPercent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Largest Files in Vault
            </h2>
            <p className="text-xs text-slate-400">
              Clean up heavy media to recover cloud space
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Date Added</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {largestFiles.map(file => (
                <tr
                  key={file.id}
                  onClick={() => openPreview(file)}
                  className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    <span className="truncate max-w-xs md:max-w-md block" title={file.name}>
                      {file.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 capitalize">
                    {file.category}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {formatBytes(file.size)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDate(file.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => downloadFile(file.url, file.name)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
