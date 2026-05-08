"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import type { BirthdayUser } from "@/src/store/services/birthdayWishApi";

interface ManualSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: BirthdayUser;
  defaultMessage: string;
  onSend: (userId: string, message: string, imageUrl?: string) => Promise<void>;
}

export function ManualSendDialog({
  open,
  onOpenChange,
  user,
  defaultMessage,
  onSend,
}: ManualSendDialogProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [imageUrl, setImageUrl] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSend(user._id, message.trim(), imageUrl || undefined);
      setMessage(defaultMessage);
      setImageUrl("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-gray-200 bg-background text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            🎂 Send Birthday Wish
          </DialogTitle>
          <DialogDescription>
            Send a custom birthday message to{" "}
            <span className="font-semibold text-foreground">{user.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a heartfelt birthday message..."
              rows={5}
              className="resize-none border-gray-300 focus:border-pink-400 focus:ring-pink-400"
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent as a notification to the user
            </p>
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">
              Image URL (Optional)
              <span className="text-xs text-muted-foreground ml-2">
                Add a special birthday image
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/birthday-image.jpg"
                className="flex-1 border-gray-300 focus:border-pink-400 focus:ring-pink-400"
              />
              {imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setImageUrl("")}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {imageUrl && (
              <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={() => setImageUrl("")}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className="border border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold"
          >
            {isSending ? "Sending..." : "Send Birthday Wish 🎉"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
