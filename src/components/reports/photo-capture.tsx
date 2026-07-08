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

async function compressImage(
  file: File,
): Promise<{ file: File; preview: string; base64: string }> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const maxDimension = 1600;
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.width, image.height),
    );
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error('Image compression failed')),
        'image/jpeg',
        0.82,
      );
    });

    const compressedFile = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, '.jpg'),
      { type: 'image/jpeg', lastModified: file.lastModified },
    );

    return {
      file: compressedFile,
      preview: URL.createObjectURL(blob),
      base64: await fileToBase64(compressedFile),
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function PhotoCapture({
  onPhotoSelected,
  preview,
  onClear,
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const compressed = await compressImage(file);
      onPhotoSelected(compressed.file, compressed.preview, compressed.base64);
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
      <div className="border-border group relative overflow-hidden rounded-xl border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Selected photo"
          className="max-h-64 w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-colors group-hover:bg-black/40 group-hover:opacity-100">
          <button
            onClick={onClear}
            aria-label="Remove photo"
            className="bg-destructive text-destructive-foreground rounded-full p-2"
            title="Remove photo"
          >
            <X className="size-4" />
          </button>
          <ZoomIn className="size-6 text-white" />
        </div>
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onClear}
            aria-label="Remove photo"
            className="bg-background/80 border-border rounded-lg border p-1.5 backdrop-blur-sm"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all',
        dragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-foreground/30 hover:bg-accent/30',
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="bg-secondary flex size-14 items-center justify-center rounded-full">
        <Upload className="text-muted-foreground size-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Drag & drop or click to upload</p>
        <p className="text-muted-foreground mt-1 text-xs">
          JPEG, PNG, WEBP up to 10 MB
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="border-border hover:bg-accent flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <Upload className="size-3.5" />
          Gallery
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cameraInputRef.current?.click();
          }}
          className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
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
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
