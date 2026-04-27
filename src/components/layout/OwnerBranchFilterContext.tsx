"use client";

import * as React from "react";
import type { MultiGymItem } from "@/src/types/type";

type OwnerBranchFilterContextValue = {
  isOwner: boolean;
  branches: MultiGymItem[];
  selectedGymId: string | null;
  setSelectedGymId: (gymId: string | null) => void;
};

const OwnerBranchFilterContext = React.createContext<
  OwnerBranchFilterContextValue | undefined
>(undefined);

export function OwnerBranchFilterProvider({
  value,
  children,
}: {
  value: OwnerBranchFilterContextValue;
  children: React.ReactNode;
}) {
  return (
    <OwnerBranchFilterContext.Provider value={value}>
      {children}
    </OwnerBranchFilterContext.Provider>
  );
}

export function useOwnerBranchFilter() {
  const context = React.useContext(OwnerBranchFilterContext);
  if (!context) {
    throw new Error(
      "useOwnerBranchFilter must be used inside OwnerBranchFilterProvider",
    );
  }
  return context;
}