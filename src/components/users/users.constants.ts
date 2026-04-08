import { Role } from "@/src/types/type";

export const lightSurfaceClassName =
  "border border-black/15 bg-white shadow-sm text-slate-900";
export const lightInputClassName =
  "border-black/20 bg-white text-slate-900 placeholder:text-slate-500 hover:border-black/40 focus-visible:border-slate-900 focus-visible:ring-black/10";
export const lightSelectTriggerClassName =
  "border-black/20 bg-white text-slate-900 hover:border-black/40 focus:border-slate-900 focus:ring-black/10";
export const lightSelectContentClassName =
  "border-black/20 bg-white text-slate-900 shadow-xl ring-black/10";
export const lightSelectItemClassName =
  "text-slate-900 focus:bg-slate-100 hover:bg-slate-100";
export const lightDialogContentClassName =
  "max-w-2xl max-h-[90vh] overflow-y-auto border border-black/15 bg-white text-slate-900 shadow-2xl ring-black/10";
export const lightDialogFooterClassName = "border-black/10 bg-slate-50";
export const lightButtonClassName =
  "border-black/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900";

export const getRoleTextClass = (role: Role): string => {
  switch (role) {
    case Role.OWNER:
      return "text-red-600";
    case Role.CASHIER:
      return "text-blue-600";
    case Role.TRAINER:
      return "text-purple-600";
    default:
      return "text-slate-600";
  }
};
