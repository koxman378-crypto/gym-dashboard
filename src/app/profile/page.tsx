"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Building2, Camera, LogOut, Save, X } from "lucide-react";
import { useLogoutMutation } from "@/src/store/services/authApi";
import { useGeneratePresignedUrlMutation } from "@/src/store/services/usersApi";
import {
  useGetGymProfileQuery,
  useUpdateGymProfileMutation,
} from "@/src/store/services/gymProfileApi";
import type { GymProfile } from "@/src/types/type";

type GymProfileFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  latitude: string;
  longitude: string;
  locationLabel: string;
  googleMapsUrl: string;
  description: string;
  coverImage: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  isActive: boolean;
  isEditing: boolean;
  uploadingImage: boolean;
  uploadError: string | null;
  successMessage: string | null;
};

type GymProfileAction =
  | { type: "hydrate"; payload?: GymProfile }
  | {
      type: "set_field";
      field: keyof Omit<
        GymProfileFormState,
        "isEditing" | "uploadingImage" | "uploadError" | "successMessage"
      >;
      value: string | boolean;
    }
  | { type: "set_editing"; value: boolean }
  | { type: "set_uploading"; value: boolean }
  | { type: "set_error"; value: string | null }
  | { type: "set_success"; value: string | null }
  | { type: "reset"; payload?: GymProfile };

const emptyFormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  logo: "",
  latitude: "",
  longitude: "",
  locationLabel: "",
  googleMapsUrl: "",
  description: "",
  coverImage: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  isActive: true,
  isEditing: false,
  uploadingImage: false,
  uploadError: null,
  successMessage: null,
};

function gymProfileReducer(
  state: GymProfileFormState,
  action: GymProfileAction,
): GymProfileFormState {
  switch (action.type) {
    case "hydrate":
    case "reset":
      return {
        ...emptyFormState,
        name: action.payload?.name || "",
        email: action.payload?.email || "",
        phone: action.payload?.phone || "",
        address: action.payload?.address || "",
        logo: action.payload?.logo || "",
        coverImage: action.payload?.coverImage || "",
        latitude:
          action.payload?.latitude === null ||
          action.payload?.latitude === undefined
            ? ""
            : String(action.payload.latitude),
        longitude:
          action.payload?.longitude === null ||
          action.payload?.longitude === undefined
            ? ""
            : String(action.payload.longitude),
        locationLabel: action.payload?.locationLabel || "",
        googleMapsUrl: action.payload?.googleMapsUrl || "",
        description: action.payload?.description || "",
        facebook: action.payload?.facebook || "",
        instagram: action.payload?.instagram || "",
        tiktok: action.payload?.tiktok || "",
        isActive: action.payload?.isActive ?? true,
      };
    case "set_field":
      return { ...state, [action.field]: action.value };
    case "set_editing":
      return { ...state, isEditing: action.value };
    case "set_uploading":
      return { ...state, uploadingImage: action.value };
    case "set_error":
      return { ...state, uploadError: action.value };
    case "set_success":
      return { ...state, successMessage: action.value };
    default:
      return state;
  }
}

export default function GymProfilePage() {
  const router = useRouter();
  const { data: profileData, isLoading: profileLoading } =
    useGetGymProfileQuery();
  const [updateGymProfile, { isLoading: isUpdating }] =
    useUpdateGymProfileMutation();
  const [generatePresignedUrl] = useGeneratePresignedUrlMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [state, dispatch] = React.useReducer(
    gymProfileReducer,
    emptyFormState,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    dispatch({ type: "hydrate", payload: profileData });
  }, [profileData]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
    } finally {
      router.push("/auth/login");
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      dispatch({ type: "set_error", value: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch({
        type: "set_error",
        value: "Image size must be less than 5MB",
      });
      return;
    }

    dispatch({ type: "set_uploading", value: true });
    dispatch({ type: "set_error", value: null });

    try {
      const response = await generatePresignedUrl({
        fileName: file.name,
        contentType: file.type,
      }).unwrap();

      if (!response.uploadUrl || !response.publicUrl) {
        throw new Error("Backend didn't return upload information");
      }

      const uploadResponse = await fetch(response.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `S3 upload failed with status: ${uploadResponse.status}. ${errorText}`,
        );
      }

      dispatch({ type: "set_field", field: "logo", value: response.publicUrl });
      dispatch({ type: "set_editing", value: true });
      dispatch({
        type: "set_success",
        value: "Logo uploaded! Click 'Save Changes' to update the gym profile.",
      });
    } catch (error: any) {
      if (error?.status === 404) {
        dispatch({
          type: "set_error",
          value: "Upload endpoint not found. Please restart the backend server.",
        });
      } else if (error?.data?.message) {
        dispatch({
          type: "set_error",
          value: `Upload failed: ${error.data.message}`,
        });
      } else if (error?.message) {
        dispatch({ type: "set_error", value: `Upload failed: ${error.message}` });
      } else {
        dispatch({
          type: "set_error",
          value: "Failed to upload image. Please try again.",
        });
      }
    } finally {
      dispatch({ type: "set_uploading", value: false });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    try {
      dispatch({ type: "set_error", value: null });

      const name = state.name.trim();
      const email = state.email.trim();
      const phone = state.phone.trim();
      const address = state.address.trim();
      const latitude = state.latitude.trim();
      const longitude = state.longitude.trim();

      if (!name) {
        dispatch({ type: "set_error", value: "Gym name is required" });
        return;
      }
      if (!email) {
        dispatch({ type: "set_error", value: "Email is required" });
        return;
      }
      if (!phone) {
        dispatch({ type: "set_error", value: "Phone is required" });
        return;
      }
      if (!/^\d{9,11}$/.test(phone)) {
        dispatch({
          type: "set_error",
          value: "Phone must contain 9 to 11 digits only",
        });
        return;
      }
      if (!address) {
        dispatch({ type: "set_error", value: "Address is required" });
        return;
      }
      if (!latitude) {
        dispatch({ type: "set_error", value: "Latitude is required" });
        return;
      }
      if (!longitude) {
        dispatch({ type: "set_error", value: "Longitude is required" });
        return;
      }

      const parsedLatitude = Number(latitude);
      if (Number.isNaN(parsedLatitude)) {
        dispatch({
          type: "set_error",
          value: "Latitude must be a valid number",
        });
        return;
      }

      const parsedLongitude = Number(longitude);
      if (Number.isNaN(parsedLongitude)) {
        dispatch({
          type: "set_error",
          value: "Longitude must be a valid number",
        });
        return;
      }

      const updateData = {
        name,
        email,
        phone,
        address,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        isActive: state.isActive,
        ...(state.logo ? { logo: state.logo } : {}),
        ...(state.locationLabel.trim()
          ? { locationLabel: state.locationLabel.trim() }
          : {}),
        ...(state.googleMapsUrl.trim()
          ? { googleMapsUrl: state.googleMapsUrl.trim() }
          : {}),
        ...(state.description.trim()
          ? { description: state.description.trim() }
          : {}),
        ...(state.coverImage ? { coverImage: state.coverImage } : {}),
        ...(state.facebook.trim() ? { facebook: state.facebook.trim() } : {}),
        ...(state.instagram.trim()
          ? { instagram: state.instagram.trim() }
          : {}),
        ...(state.tiktok.trim() ? { tiktok: state.tiktok.trim() } : {}),
      };

      const updatedProfile = await updateGymProfile(updateData).unwrap();

      if (updatedProfile?.logo) {
        dispatch({ type: "set_field", field: "logo", value: updatedProfile.logo });
      }
      if (updatedProfile?.coverImage) {
        dispatch({
          type: "set_field",
          field: "coverImage",
          value: updatedProfile.coverImage,
        });
      }
      if (updatedProfile?.latitude !== undefined && updatedProfile?.latitude !== null) {
        dispatch({
          type: "set_field",
          field: "latitude",
          value: String(updatedProfile.latitude),
        });
      }
      if (updatedProfile?.longitude !== undefined && updatedProfile?.longitude !== null) {
        dispatch({
          type: "set_field",
          field: "longitude",
          value: String(updatedProfile.longitude),
        });
      }

      dispatch({ type: "set_editing", value: false });
      dispatch({ type: "set_success", value: "Gym profile updated successfully!" });
      setTimeout(() => dispatch({ type: "set_success", value: null }), 3000);
    } catch (error: any) {
      if (error?.data?.message) {
        const errorMsg = Array.isArray(error.data.message)
          ? error.data.message.join(", ")
          : error.data.message;
        dispatch({ type: "set_error", value: `Update failed: ${errorMsg}` });
      } else {
        dispatch({
          type: "set_error",
          value: "Failed to update gym profile. Please try again.",
        });
      }
    }
  };

  const handleCancel = () => {
    dispatch({ type: "reset", payload: profileData });
    dispatch({ type: "set_error", value: null });
    dispatch({ type: "set_success", value: null });
  };

  const setField = (
    field: keyof Omit<
      GymProfileFormState,
      "isEditing" | "uploadingImage" | "uploadError" | "successMessage"
    >,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "set_field", field, value: e.target.value });
    dispatch({ type: "set_editing", value: true });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0F172B] flex items-center justify-center">
        <div className="text-slate-400">Loading gym profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172B]">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Gym Profile
              </h2>
                <p className="text-sm text-slate-400 mt-1">
                Owner-only gym information and branding
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>

          {state.successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{state.successMessage}</p>
            </div>
          )}

          {state.uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{state.uploadError}</p>
            </div>
          )}

            <div className="mb-6">
              <Label className="text-sm font-medium text-slate-300 mb-2 block">
                Gym Logo
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {state.logo ? (
                  <img
                    src={state.logo}
                    alt="Gym logo"
                    className="h-24 w-24 rounded-full object-cover border-2 border-slate-700"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-slate-600 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={state.uploadingImage}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={state.uploadingImage}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400">
                  Click the camera icon to upload a new gym logo
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                {state.uploadingImage && (
                  <p className="text-sm text-blue-600 mt-2">
                    Uploading image...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-300">
                Gym Name
              </Label>
              <Input
                value={state.name}
                onChange={setField("name")}
                placeholder="Enter gym name"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">Email</Label>
              <Input
                value={state.email}
                onChange={setField("email")}
                placeholder="Enter gym email"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">Phone</Label>
              <Input
                value={state.phone}
                onChange={setField("phone")}
                placeholder="Enter gym phone"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Location Label
              </Label>
              <Input
                value={state.locationLabel}
                onChange={setField("locationLabel")}
                placeholder="Downtown Branch"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Google Maps URL
              </Label>
              <Input
                value={state.googleMapsUrl}
                onChange={setField("googleMapsUrl")}
                placeholder="https://maps.google.com/?q=..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Description
              </Label>
              <Input
                value={state.description}
                onChange={setField("description")}
                placeholder="Open daily 6AM - 10PM"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Latitude
              </Label>
              <Input
                value={state.latitude}
                onChange={setField("latitude")}
                placeholder="16.825808"
                className="mt-1"
                inputMode="decimal"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Longitude
              </Label>
              <Input
                value={state.longitude}
                onChange={setField("longitude")}
                placeholder="96.123456"
                className="mt-1"
                inputMode="decimal"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Cover Image URL
              </Label>
              <Input
                value={state.coverImage}
                onChange={setField("coverImage")}
                placeholder="https://cdn.example.com/gym-cover.jpg"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Facebook
              </Label>
              <Input
                value={state.facebook}
                onChange={setField("facebook")}
                placeholder="https://facebook.com/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Instagram
              </Label>
              <Input
                value={state.instagram}
                onChange={setField("instagram")}
                placeholder="https://instagram.com/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                TikTok
              </Label>
              <Input
                value={state.tiktok}
                onChange={setField("tiktok")}
                placeholder="https://tiktok.com/@..."
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-slate-300">
                Address
              </Label>
              <Input
                value={state.address}
                onChange={setField("address")}
                placeholder="Enter gym address"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-slate-700 bg-[#0F172B] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Active</p>
                <p className="text-xs text-slate-400">
                  Toggle gym profile visibility
                </p>
              </div>
              <input
                type="checkbox"
                checked={state.isActive}
                onChange={(e) => {
                  dispatch({
                    type: "set_field",
                    field: "isActive",
                    value: e.target.checked,
                  });
                  dispatch({ type: "set_editing", value: true });
                }}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          {state.isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
              <Button
                onClick={handleSave}
                disabled={isUpdating || state.uploadingImage}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating || state.uploadingImage}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
