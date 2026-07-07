'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  onPhotoSelected: (file: File, preview: string, base64: string) => void;
  preview?: string;
  onClear?: () => void;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
  });
}

export function PhotoCapture({ onPhotoSelected, preview, onClear }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const objectUrl = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);
      onPhotoSelected(file, objectUrl, base64);
    },
    [onPhotoSelected],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) await handleFile(file);
    },
    [handleFile],
  );

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Selected photo" className="w-full object-cover max-h-64" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button
            onClick={onClear}
            className="bg-destructive text-destructive-foreground p-2 rounded-full"
            title="Remove photo"
          >
            <X className="size-4" />
          </button>
          <ZoomIn className="size-6 text-white" />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onClear}
            className="bg-background/80 backdrop-blur-sm p-1.5 rounded-lg border border-border"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all',
        dragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-foreground/30 hover:bg-accent/30',
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="size-14 rounded-full bg-secondary flex items-center justify-center">
        <Upload className="size-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-medium text-sm">Drag & drop or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP up to 10 MB</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
        >
          <Upload className="size-3.5" />
          Gallery
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Camera className="size-3.5" />
          Camera
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
