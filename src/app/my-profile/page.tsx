"use client";

import * as React from "react";
import { useAppSelector } from "@/src/store/hooks";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGeneratePresignedUrlMutation,
} from "@/src/store/services/usersApi";
import { useLogoutMutation } from "@/src/store/services/authApi";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { LogOut, Save, X } from "lucide-react";
import { setUser } from "@/src/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { ProfileAvatarUpload } from "@/src/components/my-profile/ProfileAvatarUpload";
import { ProfileFormFields } from "@/src/components/my-profile/ProfileFormFields";
import { LanguageToggle } from "@/src/components/language/LanguageToggle";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { data: profileData, isLoading: profileLoading } =
    useGetMyProfileQuery();

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateMyProfileMutation();
  const [generatePresignedUrl] = useGeneratePresignedUrlMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [nickname, setNickname] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (profileData) {
      setNickname(profileData.nickname || "");
      setAvatar(profileData.avatar || "");
    }
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
      setUploadError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const response = await generatePresignedUrl({
        fileName: file.name,
        contentType: file.type,
      }).unwrap();

      if (!response.uploadUrl) {
        throw new Error("Backend didn't return upload URL");
      }

      if (!response.publicUrl) {
        throw new Error(
          "Backend didn't return public URL. Check S3Service configuration.",
        );
      }

      const { uploadUrl, publicUrl } = response;

      const uploadResponse = await fetch(uploadUrl, {
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

      setAvatar(publicUrl);
      setIsEditing(true);
      setSuccessMessage(
        "Image uploaded! Click 'Save Changes' to update your profile.",
      );
    } catch (error: any) {
      if (error?.status === 404) {
        setUploadError(
          "Upload endpoint not found. Please restart the backend server.",
        );
      } else if (error?.data?.message) {
        setUploadError(`Upload failed: ${error.data.message}`);
      } else if (error?.message) {
        setUploadError(`Upload failed: ${error.message}`);
      } else {
        setUploadError("Failed to upload image. Please try again.");
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    try {
      setUploadError(null);

      const updateData: {
        name?: string;
        nickname?: string;
        phone?: string;
        address?: string;
        avatar?: string;
      } = {};

      if (nickname && nickname.trim()) {
        updateData.nickname = nickname.trim();
      }

      if (avatar) {
        updateData.avatar = avatar;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSuccessMessage("No changes to save");
        setTimeout(() => setSuccessMessage(null), 2000);
        return;
      }

      const updatedUser = await updateProfile(updateData).unwrap();

      dispatch(
        setUser({
          id: updatedUser._id,
          _id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          nickname: updatedUser.nickname || undefined,
          role: updatedUser.role,
          avatar: updatedUser.avatar || undefined,
          isActive: updatedUser.isActive,
        }),
      );

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      if (error?.data?.message) {
        const errorMsg = Array.isArray(error.data.message)
          ? error.data.message.join(", ")
          : error.data.message;
        setUploadError(`Update failed: ${errorMsg}`);
      } else {
        setUploadError("Failed to update profile. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setNickname(profileData.nickname || "");
      setAvatar(profileData.avatar || "");
    }
    setIsEditing(false);
    setUploadError(null);
    setSuccessMessage(null);
  };

  if (profileLoading) {
    return <PageLoadingState />;
  }

  const currentUser = profileData || authUser;

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-6 text-foreground">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-[#F5F5F5] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {t("myProfile.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("myProfile.subtitle")}
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 text-red-600 shadow-sm hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? t("myProfile.loggingOut") : t("myProfile.logout")}
            </Button>
          </div>
        </div>

        {/* Preferences card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Language
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-foreground">Language</span>
            <LanguageToggle />
          </div>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {successMessage && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm text-emerald-700">{successMessage}</p>
            </div>
          )}

          {uploadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}

          <ProfileAvatarUpload
            avatar={avatar}
            uploadingImage={uploadingImage}
            fileInputRef={fileInputRef}
            onFileChange={handleImageUpload}
          />

          <ProfileFormFields
            name={currentUser?.name || ""}
            nickname={nickname}
            email={currentUser?.email || ""}
            role={currentUser?.role || ""}
            onNicknameChange={(val) => {
              setNickname(val);
              setIsEditing(true);
            }}
          />

          {isEditing && (
            <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6">
              <Button
                onClick={handleSave}
                disabled={isUpdating || uploadingImage}
                className="flex items-center gap-2 rounded-full bg-gray-900 text-white shadow-sm hover:bg-gray-800"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? t("myProfile.saving") : t("myProfile.saveChanges")}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating || uploadingImage}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                {t("myProfile.cancel")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
