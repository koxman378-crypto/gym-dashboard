"use client";

import * as React from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

const LIGHT_INPUT_CN =
  "mt-1 border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10 disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:hover:border-black/10";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TEXT_FIELDS.map((f) => (
        <div key={f.key} className={f.span2 ? "md:col-span-2" : undefined}>
          <Label className="text-sm font-medium text-slate-900">
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

      <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-black/10 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Active</p>
          <p className="text-xs text-slate-500">
            Toggle gym profile visibility
          </p>
        </div>
        <input
          type="checkbox"
          checked={fields.isActive}
          onChange={onActiveChange}
          className="h-4 w-4 rounded border-black/20 bg-white text-emerald-600 focus:ring-black/10"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
