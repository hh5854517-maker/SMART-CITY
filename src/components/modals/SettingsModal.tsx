import React, { useState } from 'react';
import {
  X,
  Settings,
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Code2,
  HardDrive,
  Shield,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { getSupabaseConfig } from '../../lib/supabase';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    configureSupabase,
    resetAllData,
    isSupabaseConfigured,
  } = useVault();

  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [activeTab, setActiveTab] = useState<'supabase' | 'sql' | 'reset'>('supabase');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    configureSupabase(url.trim(), anonKey.trim());
    setTestStatus('success');
    setTimeout(() => {
      setIsSettingsModalOpen(false);
    }, 1000);
  };

  const sqlSchemaCode = `-- Run this in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  storage_quota_bytes BIGINT DEFAULT 5368709120,
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4f46e5',
  is_favorite BOOLEAN DEFAULT FALSE,
  is_trash BOOLEAN DEFAULT FALSE,
  trash_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_trash BOOLEAN DEFAULT FALSE,
  trash_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own folders" ON public.folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own files" ON public.files FOR ALL USING (auth.uid() = user_id);

-- Storage bucket 'filevault'
INSERT INTO storage.buckets (id, name, public) VALUES ('filevault', 'filevault', false) ON CONFLICT DO NOTHING;
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-scale-in max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                FileVault Settings & Cloud Sync
              </h3>
              <p className="text-xs text-slate-400">
                {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL & Storage' : 'Operating in Standalone Demo Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'supabase'
                ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Supabase Connection
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SQL Migration Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-3 py-1.5 rounded-lg transition-colors text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto`}
          >
            Reset Demo Data
          </button>
        </div>

        {/* Tab 1: Supabase Configuration */}
        {activeTab === 'supabase' && (
          <form onSubmit={handleSave} className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Zero Setup Demo Mode Included</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                You can test all uploads, gallery views, folder operations, downloads, and trash recovery immediately without any setup. To connect your live Supabase database and storage, paste your Project URL and Anon Key below.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Anon / Public Key</span>
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {testStatus === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Supabase configuration saved! Reloading client...</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  configureSupabase('', '');
                  setUrl('');
                  setAnonKey('');
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mr-auto"
              >
                Clear to Demo Mode
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-colors"
              >
                Save & Connect
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: SQL Schema */}
        {activeTab === 'sql' && (
          <div className="mt-4 space-y-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Run this script in your Supabase SQL Editor:
              </p>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="flex-1 overflow-auto p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed">
              {sqlSchemaCode}
            </pre>
          </div>
        )}

        {/* Tab 3: Reset Demo Data */}
        {activeTab === 'reset' && (
          <div className="mt-4 p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-4">
            <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
              Reset Application State
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
              This will restore all default seed folders, photos, documents, and album collections. Any local test uploads will be cleared.
            </p>
            <button
              onClick={() => {
                if (confirm('Reset all vault data to initial starter state?')) {
                  resetAllData();
                  setIsSettingsModalOpen(false);
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirm & Reset Default Data</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
