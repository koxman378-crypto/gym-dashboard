"use client";

import * as React from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface ImageCropModalProps {
  src: string;
  onDone: (file: File) => void;
  onCancel: () => void;
}

async function getCroppedFile(
  imageSrc: string,
  pixelCrop: Area,
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.95,
    );
  });
}

export function ImageCropModal({ src, onDone, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
    null,
  );
  const [processing, setProcessing] = React.useState(false);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const file = await getCroppedFile(src, croppedAreaPixels);
      onDone(file);
    } finally {
      setProcessing(false);
    }
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Modal box */}
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden w-[90vw] max-w-md">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Done</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag to reposition · Scroll or pinch to zoom
          </p>
        </div>

        {/* Cropper area */}
        <div
          className="relative w-full"
          style={{ height: 320, background: "#1e293b" }}
        >
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 flex items-center gap-3 bg-slate-50 border-b border-slate-200">
          <span className="text-xs text-slate-500 shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs text-slate-500 w-8 text-right shrink-0">
            {zoom.toFixed(1)}×
          </span>
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-4 flex justify-end gap-3 bg-white">
          <button
            onClick={onCancel}
            disabled={processing}
            className="px-5 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={processing || !croppedAreaPixels}
            className="px-6 py-2 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
