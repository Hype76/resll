import React, { useRef, useState, useEffect } from 'react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files: File[] = [];
    const newPreviews: { url: string; type: string }[] = [];

    Array.from(fileList).forEach(file => {
      // Accept images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        files.push(file);
        newPreviews.push({
          url: URL.createObjectURL(file),
          type: file.type
        });
      }
    });

    if (files.length > 0) {
      setPreviews(prev => [...prev, ...newPreviews]);
      onFilesSelected(files);
    }
  };

  // Cleanup object URLs on unmount/change
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    handleFiles(e.dataTransfer.files);
  };

  // Global Paste Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      const newPreviews: { url: string; type: string }[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('video') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            pastedFiles.push(file);
            newPreviews.push({
                url: URL.createObjectURL(file),
                type: file.type
            });
          }
        }
      }
      
      if (pastedFiles.length > 0) {
        setPreviews(prev => [...prev, ...newPreviews]);
        onFilesSelected(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, onFilesSelected]);


  // If we have selected files, we show a mini grid, but keep the dropzone active for adding more
  const hasFiles = previews.length > 0;

  return (
    <div className="space-y-4">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group bg-slate-800
          ${disabled ? 'opacity-50 cursor-not-allowed border-slate-700' : 
            isDragging 
              ? 'border-cyan-500 bg-slate-800/80 scale-[1.02]' 
              : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700/50'
          }
          ${hasFiles ? 'h-40' : 'h-64'}
        `}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,video/*"
          multiple
          className="hidden"
          disabled={disabled}
        />
        
        <div className="text-center p-6 space-y-2 pointer-events-none">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-cyan-500/20' : 'bg-slate-900 group-hover:bg-slate-900'}`}>
            <svg className={`w-6 h-6 ${isDragging ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-gray-50">
              {hasFiles ? 'Add more Photos or Video' : 'Drop Photos & Video Here'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Upload multiple angles for better accuracy</p>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {hasFiles && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 animate-[fadeIn_0.3s_ease-out]">
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
              {p.type.startsWith('video') ? (
                <video src={p.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={p.url} alt={`preview ${i}`} className="w-full h-full object-cover" />
              )}
              {p.type.startsWith('video') && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                   <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};