"use client";

import { useEffect, useReducer } from "react";
import { motion } from "motion/react";
import {
  Gift,
  Clock,
  Cake,
  Send,
  CheckCircle2,
  Sparkles,
  Bot,
  Zap,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useAppSelector } from "@/src/store/hooks";
import {
  useGetBirthdayWishQuery,
  useUpsertBirthdayWishMutation,
  useGetTodayBirthdaysQuery,
  useManualSendBirthdayWishMutation,
  type BirthdayUser,
} from "@/src/store/services/birthdayWishApi";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { PageLoadingState } from "@/src/components/ui/page-loading-state";
import { toast } from "sonner";
import { ManualSendDialog } from "@/src/components/birthday/ManualSendDialog";

interface BirthdayWishState {
  message: string;
  initialized: boolean;
  selectedUser: BirthdayUser | null;
  isDialogOpen: boolean;
}

type BirthdayWishAction =
  | { type: "setMessage"; payload: string }
  | { type: "initializeMessage"; payload: string }
  | { type: "openDialog"; payload: BirthdayUser }
  | { type: "closeDialog" };

function birthdayWishReducer(
  state: BirthdayWishState,
  action: BirthdayWishAction,
): BirthdayWishState {
  switch (action.type) {
    case "setMessage":
      return { ...state, message: action.payload };
    case "initializeMessage":
      return { ...state, initialized: true, message: action.payload };
    case "openDialog":
      return { ...state, selectedUser: action.payload, isDialogOpen: true };
    case "closeDialog":
      return { ...state, selectedUser: null, isDialogOpen: false };
    default:
      return state;
  }
}

export default function BirthdayWishPage() {
  const { t } = useLanguage();
  const { user } = useAppSelector((state) => state.auth);
  const gymId: string | undefined = (user as any)?.gymId || undefined;

  const { data: wish, isLoading: wishLoading } = useGetBirthdayWishQuery(gymId);
  const [upsert, { isLoading: isSaving }] = useUpsertBirthdayWishMutation();
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch,
  } = useGetTodayBirthdaysQuery(gymId);
  const [manualSend] = useManualSendBirthdayWishMutation();

  const [state, dispatch] = useReducer(birthdayWishReducer, {
    message: "",
    initialized: false,
    selectedUser: null,
    isDialogOpen: false,
  });
  const { message, initialized, selectedUser, isDialogOpen } = state;

  // Initialize textarea once data arrives
  useEffect(() => {
    if (!initialized && !wishLoading) {
      dispatch({ type: "initializeMessage", payload: wish?.message ?? "" });
    }
  }, [initialized, wishLoading, wish?.message]);

  const handleSave = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    try {
      await upsert({ ...(gymId ? { gymId } : {}), message: trimmed }).unwrap();
      toast.success(t("birthdayWish.saved"));
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save birthday wish.");
    }
  };

  const handleOpenDialog = (user: BirthdayUser) => {
    dispatch({ type: "openDialog", payload: user });
  };

  const handleManualSend = async (
    userId: string,
    message: string,
    imageUrl?: string,
  ) => {
    try {
      await manualSend({ userId, message, imageUrl }).unwrap();
      toast.success("Birthday wish sent successfully!");
      dispatch({ type: "closeDialog" });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send birthday wish");
    }
  };

  if (wishLoading || usersLoading) return <PageLoadingState />;

  const pendingUsers = users.filter((u) => u.sendStatus === "pending");
  const sentUsers = users.filter((u) => u.sendStatus !== "pending");

  return (
    <div
      className="min-h-screen p-6 space-y-8"
      style={{ backgroundColor: "#FCFCFC" }}
    >
      {/* ========== SECTION 1: AUTO MESSAGE CONFIGURATION ========== */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100">
            <Bot className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800">
              {t("birthdayWish.title")}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {t("birthdayWish.subtitle")}
            </p>
          </div>
        </div>

        {/* Auto Message Editor */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <label className="block text-base font-semibold text-zinc-700">
              Automatic Birthday Message
            </label>
          </div>
          <p className="text-sm text-zinc-500">
            This message will be sent automatically at 8:00 AM to all users with
            birthdays today (unless you send a custom message manually).
          </p>
          <Textarea
            rows={4}
            value={message}
            onChange={(e) =>
              dispatch({ type: "setMessage", payload: e.target.value })
            }
            placeholder={t("birthdayWish.messagePlaceholder")}
            className="resize-none text-zinc-800 border-zinc-300 focus:border-orange-400 focus:ring-orange-400"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !message.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
            >
              {isSaving
                ? t("birthdayWish.saving")
                : t("birthdayWish.saveMessage")}
            </Button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-3 mt-4">
          <h2 className="text-base font-semibold text-zinc-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-400" />
            {t("birthdayWish.history")}
          </h2>

          {!wish || wish.history.length === 0 ? (
            <p className="text-sm text-zinc-400">
              {t("birthdayWish.noHistory")}
            </p>
          ) : (
            <ul className="space-y-3">
              {[...wish.history]
                .reverse()
                .slice(0, 5)
                .map((entry, idx) => (
                  <li
                    key={idx}
                    className="border border-zinc-100 rounded-lg p-3 bg-zinc-50 space-y-1"
                  >
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                      {entry.message}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(entry.updatedAt).toLocaleString()}{" "}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* ========== SECTION 2: TODAY'S BIRTHDAY USERS ========== */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-pink-100">
              <Cake className="h-7 w-7 text-pink-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                🎂 Today's Birthdays
              </h2>
              <p className="mt-1 text-muted-foreground">
                {users.length === 0
                  ? "No birthdays today"
                  : `${users.length} ${users.length === 1 ? "person has" : "people have"} birthdays today`}
              </p>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="p-6 rounded-full bg-gray-100 mb-4">
              <Cake className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Birthdays Today
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Check back tomorrow to see if anyone has a birthday!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Users */}
            {pendingUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Pending Manual Send ({pendingUsers.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingUsers.map((user, index) => (
                    <BirthdayUserCard
                      key={user._id}
                      user={user}
                      index={index}
                      onSend={() => handleOpenDialog(user)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sent Users */}
            {sentUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Already Sent ({sentUsers.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sentUsers.map((user, index) => (
                    <BirthdayUserCard
                      key={user._id}
                      user={user}
                      index={index}
                      isSent
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Send Dialog */}
      {selectedUser && (
        <ManualSendDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (open) return;
            dispatch({ type: "closeDialog" });
          }}
          user={selectedUser}
          defaultMessage={wish?.message || ""}
          onSend={handleManualSend}
        />
      )}
    </div>
  );
}

// ========== BIRTHDAY USER CARD COMPONENT ==========
interface BirthdayUserCardProps {
  user: BirthdayUser;
  index: number;
  isSent?: boolean;
  onSend?: () => void;
}

function BirthdayUserCard({
  user,
  index,
  isSent,
  onSend,
}: BirthdayUserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Sparkle effect */}
      <motion.div
        className="absolute top-0 right-0 p-2"
        animate={{
          rotate: [0, 15, -15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <Sparkles className="h-5 w-5 text-yellow-400" />
      </motion.div>

      {/* Avatar */}
      <div className="flex items-start gap-4">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover border-2 border-pink-200"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl border-2 border-pink-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <Cake className="h-4 w-4 text-pink-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg truncate">
            {user.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {new Date(user.birthday).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </p>

          {isSent && user.sendDetails && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.sendStatus === "manual"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {user.sendStatus === "manual" ? "✨ Manual" : "🤖 Auto"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {!isSent && onSend && (
        <Button
          onClick={onSend}
          className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Custom Wish
        </Button>
      )}

      {isSent && user.sendDetails && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {user.sendDetails.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(user.sendDetails.sentAt).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
