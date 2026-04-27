"use client";

import * as React from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

const LIGHT_INPUT_CN =
  "mt-1 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-gray-300 focus-visible:ring-0 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:border-gray-200";

type FormFields = {
  name: string;
  email: string;
  phone: string;
  locationLabel: string;
  googleMapsUrl: string;
  description: string;
  latitude: string;
  longitude: string;
  coverImage: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  address: string;
  isActive: boolean;
};

type FieldKey = keyof Omit<FormFields, "isActive">;

interface GymProfileFormFieldsProps {
  fields: FormFields;
  disabled: boolean;
  onFieldChange: (
    field: FieldKey,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onActiveChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TEXT_FIELDS: {
  label: string;
  key: FieldKey;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  span2?: boolean;
}[] = [
  { label: "Gym Name", key: "name", placeholder: "Enter gym name" },
  { label: "Email", key: "email", placeholder: "Enter gym email" },
  { label: "Phone", key: "phone", placeholder: "Enter gym phone" },
  {
    label: "Location Label",
    key: "locationLabel",
    placeholder: "Downtown Branch",
  },
  {
    label: "Google Maps URL",
    key: "googleMapsUrl",
    placeholder: "https://maps.google.com/?q=...",
  },
  {
    label: "Description",
    key: "description",
    placeholder: "Open daily 6AM - 10PM",
  },
  {
    label: "Latitude",
    key: "latitude",
    placeholder: "16.825808",
    inputMode: "decimal",
  },
  {
    label: "Longitude",
    key: "longitude",
    placeholder: "96.123456",
    inputMode: "decimal",
  },
  {
    label: "Cover Image URL",
    key: "coverImage",
    placeholder: "https://cdn.example.com/gym-cover.jpg",
  },
  {
    label: "Facebook",
    key: "facebook",
    placeholder: "https://facebook.com/...",
  },
  {
    label: "Instagram",
    key: "instagram",
    placeholder: "https://instagram.com/...",
  },
  { label: "TikTok", key: "tiktok", placeholder: "https://tiktok.com/@..." },
  {
    label: "Address",
    key: "address",
    placeholder: "Enter gym address",
    span2: true,
  },
];

export function GymProfileFormFields({
  fields,
  disabled,
  onFieldChange,
  onActiveChange,
}: GymProfileFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {TEXT_FIELDS.map((f) => (
        <div key={f.key} className={f.span2 ? "md:col-span-2" : undefined}>
          <Label className="text-sm font-medium text-gray-700">
            {f.label}
          </Label>
          <Input
            value={fields[f.key]}
            onChange={onFieldChange(f.key)}
            placeholder={f.placeholder}
            className={LIGHT_INPUT_CN}
            inputMode={f.inputMode}
            disabled={disabled}
          />
        </div>
      ))}

      <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-gray-200 bg-[#F8F8F8] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Active</p>
          <p className="text-xs text-gray-500">
            Toggle gym profile visibility
          </p>
        </div>
        <input
          type="checkbox"
          checked={fields.isActive}
          onChange={onActiveChange}
          className="h-4 w-4 rounded border-gray-300 bg-white text-emerald-600"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
