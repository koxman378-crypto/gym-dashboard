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
        <Label className="text-sm font-medium text-slate-300">Name</Label>
        <Input value={name} disabled className="mt-1 bg-[#0F172B]" />
        <p className="text-xs text-slate-400 mt-1">Name cannot be changed</p>
      </div>

      <div>
        <Label
          htmlFor="nickname"
          className="text-sm font-medium text-slate-300"
        >
          Nickname (Optional)
        </Label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder="Enter your nickname"
          className="mt-1"
        />
        <p className="text-xs text-slate-400 mt-1">
          This is how others will see you in the app
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium text-slate-300">Email</Label>
        <Input value={email} disabled className="mt-1 bg-[#0F172B]" />
        <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
      </div>

      <div>
        <Label className="text-sm font-medium text-slate-300">Role</Label>
        <Input value={role} disabled className="mt-1 bg-[#0F172B] capitalize" />
      </div>
    </div>
  );
}
