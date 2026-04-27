"use client";

import * as React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Label } from "@/src/components/ui/label";

interface GymLogoUploadProps {
  logo: string;
  isEditing: boolean;
  uploadingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelected: (file: File) => void;
}

export function GymLogoUpload({
  logo,
  isEditing,
  uploadingImage,
  fileInputRef,
  onFileSelected,
}: GymLogoUploadProps) {
  const isLocked = !isEditing || uploadingImage;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelected(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
      <div className="mb-6">
        <Label className="mb-2 block text-sm font-medium text-gray-700">
          Gym Logo
        </Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {logo ? (
              <img
                src={logo}
                alt="Gym logo"
                className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                <Image
                  src="/gym-logo.png"
                  alt="Gym logo placeholder"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLocked}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLocked}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {isEditing
                ? "Click the camera icon to upload a new gym logo"
                : "Enable edit mode to upload a new gym logo"}
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
