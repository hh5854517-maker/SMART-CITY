# FileVault — Smart Personal File Storage and Gallery Application

**FileVault** is a modern, responsive personal cloud storage and media gallery system inspired by Google Drive, Google Photos, and Dropbox. Built with React, TypeScript, Tailwind CSS, Lucide Icons, and Supabase.

---

## ✨ Features Overview

### 1. 🎛️ Main Dashboard
- **Storage Metrics**: Real-time counter of total files, used space, available quota, and starred favorites.
- **Quota Visualization**: Dynamic multi-color category bar showing consumption across Photos, Videos, Documents, Audio, and Archives.
- **Recent Files Grid**: Quick access to newly uploaded files with direct previews.
- **Live Activity Feed**: Audit trail tracking uploads, moves, favorites, folder creations, and deletions.
- **Quick Actions**: One-click upload modal and new folder creation.

### 2. 📂 File & Folder Management
- **Hierarchical Directory Tree**: Support for root folders, nested sub-folders, and deep navigation.
- **Interactive Breadcrumbs**: One-click navigation back to parent folders with live file counts.
- **Drag-and-Drop Organization**: Drag files and drop them onto folder cards to move them.
- **Folder Customization**: Choose from 8 curated accent colors when creating folders.
- **Multi-Selection & Batch Actions**: Select multiple files simultaneously to:
  - Download all selected files bundled as a `.zip` archive.
  - Star / unstar in bulk.
  - Move to another folder.
  - Move to Trash.
- **Views**: Seamless toggle between responsive Grid view and dense Table List view.
- **Sorting & Filtering**: Sort by Date Added, Filename, Size, or MIME type (ascending/descending). Quick-filter by Photos, Videos, Documents, or Audio.

### 3. 📸 High-Performance Photo Gallery & Lightbox
- **Curated Gallery Grid**: Responsive photo grid with hover overlays displaying file size and dimensions.
- **Fullscreen Lightbox**:
  - Zoom controls: 50% to 300% zoom with pan.
  - 90° clockwise rotation.
  - Keyboard navigation: Left/Right arrow keys to cycle through photos, `Esc` to close.
  - Direct download and share actions.
  - Detailed metadata drawer showing EXIF attributes, location, and upload date.
- **Custom Photo Albums**: Create albums, curate photos, add descriptions, and organize memories.

### 4. 👁️ Rich In-Browser Previews
- **Images**: Responsive lightbox with zoom and rotation.
- **Videos**: Built-in HTML5 player with streaming controls.
- **Audio**: Custom audio player with playback bar.
- **PDF Documents**: Embedded PDF reader with download fallback.
- **Code & Markdown**: Syntax-styled text viewer with one-click content copying.
- **Unsupported Files**: Structured metadata inspection and instant download button.

### 5. 🚀 Upload Engine & Global Dropzone
- **Multi-File Concurrent Uploads**: Drag and drop multiple files at once.
- **Whole-Window Dropzone**: Drag files from your operating system anywhere onto the window to trigger an instant upload.
- **Progress Tracking**: Real-time progress bar with percentage, status, and error reporting.
- **Duplicate Protection**: Automatically appends unique numerical suffixes for conflicting file names.
- **Storage Quota Enforcement**: Blocks uploads that exceed the 5 GB quota limit.

### 6. 🗑️ Trash & Recovery
- **Soft Deletion**: Moving items to trash preserves them safely without permanent loss.
- **Restoration**: One-click restore back to the original folder location.
- **Permanent Purging**: Confirmation dialog prevents accidental data loss when emptying trash.

### 7. 🔒 Security & Supabase Backend Integration
- **Row Level Security (RLS)**: Comprehensive PostgreSQL security script (`supabase-schema.sql`) enforcing tenant isolation (`auth.uid() = user_id`).
- **Private Storage Bucket**: User-scoped storage paths (`filevault/{user_id}/...`).
- **Flexible Modes**:
  - **Live Supabase Mode**: Connect your live Supabase project by entering your Project URL and Anon Key in Settings.
  - **Standalone Demo Mode**: Fully working offline test mode with preloaded photographic assets and simulated storage.
- **Auth**: User registration, login, password recovery, and 1-click instant demo sign-in.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)

### Quick Run
```bash
# Start development server
npm run dev

# Open in browser:
http://localhost:5173
```

---

## 🗄️ Supabase Database Setup

To sync FileVault with your own Supabase project:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Go to the **SQL Editor** tab.
3. Open `supabase-schema.sql` in this repository (or copy it from the in-app **Settings -> SQL Migration Schema** tab) and click **Run**.
4. Retrieve your **Project URL** and **Anon Key** from **Project Settings -> API**.
5. In FileVault, click the **Settings** gear icon (or the Supabase badge in the sidebar) and paste your credentials.

---

## ⌨️ Keyboard Shortcuts
- `Ctrl + K` / `⌘K`: Focus search bar
- `Esc`: Close open modal or preview
- `←` / `→`: Navigate photos in gallery preview
- `?`: Open keyboard shortcuts guide
