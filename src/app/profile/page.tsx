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
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { User, Camera, LogOut, Save, X } from "lucide-react";
import { setUser } from "@/src/store/slices/authSlice";
import { useDispatch } from "react-redux";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { data: profileData, isLoading: profileLoading } = useGetMyProfileQuery();
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [generatePresignedUrl] = useGeneratePresignedUrlMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [nickname, setNickname] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize form with profile data
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      // Step 1: Get presigned URL from backend
      const response = await generatePresignedUrl({
        fileName: file.name,
        contentType: file.type,
      }).unwrap();


      // Validate response
      if (!response.uploadUrl) {
        throw new Error("Backend didn't return upload URL");
      }

      if (!response.publicUrl) {
        throw new Error("Backend didn't return public URL. Check S3Service configuration.");
      }

      const { uploadUrl, publicUrl } = response;

      // Step 2: Upload directly to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });


      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`S3 upload failed with status: ${uploadResponse.status}. ${errorText}`);
      }


      // Step 3: Set the avatar URL (this will trigger edit mode)
      setAvatar(publicUrl);
      setIsEditing(true);
      setSuccessMessage("Image uploaded! Click 'Save Changes' to update your profile.");
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        if (isEditing) {
          setSuccessMessage(null);
        }
      }, 5000);

    } catch (error: any) {
      
      if (error?.status === 404) {
        setUploadError("Upload endpoint not found. Please restart the backend server.");
      } else if (error?.data?.message) {
        setUploadError(`Upload failed: ${error.data.message}`);
      } else if (error?.message) {
        setUploadError(`Upload failed: ${error.message}`);
      } else {
        setUploadError("Failed to upload image. Please try again.");
      }
    } finally {
      setUploadingImage(false);
      // Reset file input so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    try {
      setUploadError(null);
      
      // Build update payload - only send changed fields
      const updateData: { 
        name?: string; 
        nickname?: string; 
        phone?: string;
        address?: string;
        avatar?: string;
      } = {};
      
      // Only include nickname if it has a value
      if (nickname && nickname.trim()) {
        updateData.nickname = nickname.trim();
      }
      
      // Only include avatar if it has a value  
      if (avatar) {
        updateData.avatar = avatar;
      }

      // If no changes, just exit edit mode
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSuccessMessage("No changes to save");
        setTimeout(() => setSuccessMessage(null), 2000);
        return;
      }

      // Call the update API
      const updatedUser = await updateProfile(updateData).unwrap();

      // Update Redux state with new user data
      dispatch(setUser({
        id: updatedUser._id,
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        nickname: updatedUser.nickname || undefined,
        role: updatedUser.role,
        avatar: updatedUser.avatar || undefined,
        isActive: updatedUser.isActive,
      }));

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      
      // Handle error messages
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
    // Reset to original values
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
          {/* Header */}
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

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}

          {/* Avatar Section */}
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
                  onChange={handleImageUpload}
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
                  <p className="text-sm text-blue-600 mt-2">
                    Uploading image...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-300">
                Name
              </Label>
              <Input
                value={currentUser?.name || ""}
                disabled
                className="mt-1 bg-[#0F172B]"
              />
              <p className="text-xs text-slate-400 mt-1">
                Name cannot be changed
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Email
              </Label>
              <Input
                value={currentUser?.email || ""}
                disabled
                className="mt-1 bg-[#0F172B]"
              />
              <p className="text-xs text-slate-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-300">
                Role
              </Label>
              <Input
                value={currentUser?.role || ""}
                disabled
                className="mt-1 bg-[#0F172B] capitalize"
              />
            </div>

            <div>
              <Label htmlFor="nickname" className="text-sm font-medium text-slate-300">
                Nickname (Optional)
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Enter your nickname"
                className="mt-1"
              />
              <p className="text-xs text-slate-400 mt-1">
                This is how others will see you in the app
              </p>
            </div>
          </div>

          {/* Action Buttons */}
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

