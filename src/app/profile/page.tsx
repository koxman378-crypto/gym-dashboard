"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { LogOut, Pencil, Save } from "lucide-react";
import { useLogoutMutation } from "@/src/store/services/authApi";
import { useGeneratePresignedUrlMutation } from "@/src/store/services/usersApi";
import {
  useGetGymProfileQuery,
  useUpdateGymProfileMutation,
} from "@/src/store/services/gymProfileApi";
import type { GymProfile } from "@/src/types/type";
import { GymLogoUpload } from "@/src/components/profile/GymLogoUpload";
import { GymProfileFormFields } from "@/src/components/profile/GymProfileFormFields";

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

  const [state, dispatch] = React.useReducer(gymProfileReducer, emptyFormState);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const lightSurfaceClassName =
    "border border-black/15 bg-white text-slate-900 shadow-sm";
  const lightInputClassName =
    "mt-1 border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10 disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:hover:border-black/10";
  const lightButtonClassName =
    "border border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-sm";
  const primaryActionButtonClassName =
    "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:text-white shadow-sm";
  const isFormLocked = !state.isEditing || isUpdating;

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

  const handleImageUpload = async (file: File) => {
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
          value:
            "Upload endpoint not found. Please restart the backend server.",
        });
      } else if (error?.data?.message) {
        dispatch({
          type: "set_error",
          value: `Upload failed: ${error.data.message}`,
        });
      } else if (error?.message) {
        dispatch({
          type: "set_error",
          value: `Upload failed: ${error.message}`,
        });
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
        dispatch({
          type: "set_field",
          field: "logo",
          value: updatedProfile.logo,
        });
      }
      if (updatedProfile?.coverImage) {
        dispatch({
          type: "set_field",
          field: "coverImage",
          value: updatedProfile.coverImage,
        });
      }
      if (
        updatedProfile?.latitude !== undefined &&
        updatedProfile?.latitude !== null
      ) {
        dispatch({
          type: "set_field",
          field: "latitude",
          value: String(updatedProfile.latitude),
        });
      }
      if (
        updatedProfile?.longitude !== undefined &&
        updatedProfile?.longitude !== null
      ) {
        dispatch({
          type: "set_field",
          field: "longitude",
          value: String(updatedProfile.longitude),
        });
      }

      dispatch({ type: "set_editing", value: false });
      dispatch({
        type: "set_success",
        value: "Gym profile updated successfully!",
      });
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

  const handleStartEditing = () => {
    dispatch({ type: "set_error", value: null });
    dispatch({ type: "set_success", value: null });
    dispatch({ type: "set_editing", value: true });
  };

  const setField =
    (
      field: keyof Omit<
        GymProfileFormState,
        "isEditing" | "uploadingImage" | "uploadError" | "successMessage"
      >,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "set_field", field, value: e.target.value });
      dispatch({ type: "set_editing", value: true });
    };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-slate-500">Loading gym profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="p-6 max-w-4xl mx-auto">
        <div className={`rounded-lg p-6 ${lightSurfaceClassName}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Gym Profile
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Owner-only gym information and branding
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={state.isEditing ? handleSave : handleStartEditing}
                disabled={state.uploadingImage || isUpdating}
                className={`flex items-center gap-2 cursor-pointer ${state.isEditing ? primaryActionButtonClassName : lightButtonClassName}`}
              >
                {state.isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                {state.isEditing
                  ? isUpdating
                    ? "Saving..."
                    : "Save Changes"
                  : "Edit Profile"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex cursor-pointer items-center gap-2 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {state.isEditing
              ? "Editing mode is enabled. Update the fields you want, then click Save Changes."
              : "Click Edit Profile to unlock the form and make changes."}
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

          <GymLogoUpload
            logo={state.logo}
            isEditing={state.isEditing}
            uploadingImage={state.uploadingImage}
            fileInputRef={fileInputRef}
            onFileCropped={handleImageUpload}
          />

          <GymProfileFormFields
            fields={state}
            disabled={isFormLocked}
            onFieldChange={setField}
            onActiveChange={(e) => {
              dispatch({
                type: "set_field",
                field: "isActive",
                value: e.target.checked,
              });
              dispatch({ type: "set_editing", value: true });
            }}
          />
        </div>
      </div>
    </div>
  );
}
