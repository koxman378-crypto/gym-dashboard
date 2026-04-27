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
      <Label className="mb-2 block text-sm font-medium text-gray-700">
        Profile Picture
      </Label>
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
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
          <p className="text-sm text-gray-600">
            Click the camera icon to upload a new profile picture
          </p>
          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG or GIF. Max size 5MB.
          </p>
          {uploadingImage && (
            <p className="mt-2 text-sm text-blue-600">Uploading image...</p>
          )}
        </div>
      </div>
    </div>
  );
}
