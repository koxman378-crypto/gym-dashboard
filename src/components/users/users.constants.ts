import { Role } from "@/src/types/type";

export const lightSurfaceClassName =
  "border border-zinc-200 bg-white shadow-sm text-card-foreground";
export const lightInputClassName =
  "border-zinc-200 bg-white text-foreground placeholder:text-muted-foreground shadow-none hover:border-zinc-300 focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-black/5";
export const lightSelectTriggerClassName =
  "border-zinc-200 bg-white text-foreground shadow-none hover:border-zinc-300 focus:border-zinc-300 focus:ring-2 focus:ring-black/5";
export const lightSelectContentClassName =
  "bg-white border border-gray-200 shadow-none ring-0";
export const lightSelectItemClassName = "text-foreground hover:bg-zinc-100";
export const lightDialogContentClassName =
  "max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-200 bg-white text-card-foreground shadow-xl";
export const lightDialogFooterClassName = "border-zinc-200 bg-white";
export const lightButtonClassName =
  "border border-zinc-200 bg-white text-foreground shadow-sm hover:bg-zinc-50 hover:text-foreground";
export const lightBadgeClassName =
  "rounded-lg border border-zinc-200 bg-white shadow-none";

export const getRoleTextClass = (role: Role): string => {
  switch (role) {
    case Role.OWNER:
      return "text-zinc-900";
    case Role.CASHIER:
      return "text-zinc-700";
    case Role.TRAINER:
      return "text-zinc-600";
    default:
      return "text-muted-foreground";
  }
};
