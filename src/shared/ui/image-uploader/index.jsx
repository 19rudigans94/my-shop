"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { X, Upload, ImagePlus } from "lucide-react";

// Exposed via ref: { uploadPending() => Promise<string[]> }
const ImageUploader = forwardRef(function ImageUploader(
  { images = [], onChange, uploadType },
  ref
) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [entries, setEntries] = useState(() =>
    images.map((src) => ({ src, file: null }))
  );

  // Синхронизируем с prop когда родитель подгружает данные после монтирования
  useEffect(() => {
    const hasPending = entries.some((e) => !!e.file);
    if (!hasPending) {
      setEntries(images.map((src) => ({ src, file: null })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  useImperativeHandle(ref, () => ({
    async uploadPending() {
      const results = [];
      for (const entry of entries) {
        if (!entry.file) {
          results.push(entry.src);
          continue;
        }
        const fd = new FormData();
        fd.append("file", entry.file);
        fd.append("type", uploadType);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Ошибка загрузки файла");
        }
        const { url } = await res.json();
        results.push(url);
      }
      return results;
    },
    hasPending() {
      return entries.some((e) => !!e.file);
    },
  }));

  function addFiles(fileList) {
    const newEntries = Array.from(fileList).map((file) => ({
      src: URL.createObjectURL(file),
      file,
    }));
    const updated = [...entries, ...newEntries];
    setEntries(updated);
    onChange?.(updated.filter((e) => !e.file).map((e) => e.src));
  }

  function removeEntry(index) {
    const entry = entries[index];
    if (entry.file) URL.revokeObjectURL(entry.src);
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    onChange?.(updated.filter((e) => !e.file).map((e) => e.src));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors
          ${dragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
          }`}
      >
        <ImagePlus className="w-8 h-8 text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Нажмите или перетащите изображения
        </span>
        <span className="text-xs text-gray-400">JPEG, PNG, WebP, GIF · до 10 МБ</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {entries.map((entry, i) => (
            <div key={entry.src} className="relative group aspect-square">
              <img
                src={entry.src}
                alt=""
                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              {entry.file && (
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded flex items-center gap-1">
                  <Upload className="w-2.5 h-2.5" />
                  новое
                </div>
              )}
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ImageUploader;
