"use client";

import * as React from "react";
import { Building2, Camera } from "lucide-react";
import { Label } from "@/src/components/ui/label";

interface GymLogoUploadProps {
  logo: string;
  isEditing: boolean;
  uploadingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function GymLogoUpload({
  logo,
  isEditing,
  uploadingImage,
  fileInputRef,
  onFileChange,
}: GymLogoUploadProps) {
  const isLocked = !isEditing || uploadingImage;

  return (
    <div className="mb-6">
      <Label className="mb-2 block text-sm font-medium text-slate-900">
        Gym Logo
      </Label>
      <div className="flex items-center gap-4">
        <div className="relative">
          {logo ? (
            <img
              src={logo}
              alt="Gym logo"
              className="h-24 w-24 rounded-full border-2 border-black/10 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-black/10 bg-slate-100">
              <Building2 className="h-12 w-12 text-slate-500" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLocked}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={isLocked}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600">
            {isEditing
              ? "Click the camera icon to upload a new gym logo"
              : "Enable edit mode to upload a new gym logo"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG or GIF. Max size 5MB.
          </p>
          {uploadingImage && (
            <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
          )}
        </div>
      </div>
    </div>
  );
}
