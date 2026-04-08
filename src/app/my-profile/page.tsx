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

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
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
    return (
      <div className="min-h-screen bg-[#0F172B] flex items-center justify-center">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  const currentUser = profileData || authUser;

  return (
    <div className="min-h-screen bg-[#0F172B]">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Profile Settings
            </h2>
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

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
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
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
              <Button
                onClick={handleSave}
                disabled={isUpdating || uploadingImage}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating || uploadingImage}
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
