"use client";

import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface ProfileFormFieldsProps {
  name: string;
  nickname: string;
  email: string;
  role: string;
  onNicknameChange: (value: string) => void;
}

export function ProfileFormFields({
  name,
  nickname,
  email,
  role,
  onNicknameChange,
}: ProfileFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700">Name</Label>
        <Input
          value={name}
          disabled
          className="mt-1 border-gray-200 bg-gray-50 text-gray-700"
        />
        <p className="mt-1 text-xs text-gray-500">Name cannot be changed</p>
      </div>

      <div>
        <Label
          htmlFor="nickname"
          className="text-sm font-medium text-gray-700"
        >
          Nickname (Optional)
        </Label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder="Enter your nickname"
          className="mt-1 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500">
          This is how others will see you in the app
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">Email</Label>
        <Input
          value={email}
          disabled
          className="mt-1 border-gray-200 bg-gray-50 text-gray-700"
        />
        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">Role</Label>
        <Input
          value={role}
          disabled
          className="mt-1 border-gray-200 bg-gray-50 text-gray-700 capitalize"
        />
      </div>
    </div>
  );
}
