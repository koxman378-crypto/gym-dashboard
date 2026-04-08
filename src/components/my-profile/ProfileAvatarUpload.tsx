"use client";

import * as React from "react";
import { User, Camera } from "lucide-react";
import { Label } from "@/src/components/ui/label";

interface ProfileAvatarUploadProps {
  avatar: string;
  uploadingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatarUpload({
  avatar,
  uploadingImage,
  fileInputRef,
  onFileChange,
}: ProfileAvatarUploadProps) {
  return (
    <div className="mb-6">
      <Label className="text-sm font-medium text-slate-300 mb-2 block">
        Profile Picture
      </Label>
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover border-2 border-slate-700"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-slate-600 flex items-center justify-center">
              <User className="h-12 w-12 text-slate-400" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
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
            disabled={uploadingImage}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-400">
            Click the camera icon to upload a new profile picture
          </p>
          <p className="text-xs text-slate-400 mt-1">
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
