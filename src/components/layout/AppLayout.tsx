"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from "@/src/components/sidebar/page";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import Link from "next/link";
import {
  Users,
  Calendar,
  LogOut,
  User,
  Clock,
  TrendingUp,
  DollarSign,
  Package,
  UserCheck,
  Settings,
  Building2,
  MessageCircleQuestion,
  Timer,
  Bell,
  Wallet,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useAppSelector } from "@/src/store/hooks";
import { useLogoutMutation } from "@/src/store/services/authApi";
import { useGetGymProfileQuery } from "@/src/store/services/gymProfileApi";
import { useRouter } from "next/navigation";
import { Role } from "@/src/types/type";
import { useLanguage } from "@/src/components/language/LanguageContext";
import { LanguageToggle } from "@/src/components/language/LanguageToggle";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";
import { useGetUnreadCountQuery } from "@/src/store/services/notificationsApi";
import { useGetPendingCountQuery } from "@/src/store/services/paymentRequestsApi";
import { OwnerBranchFilterProvider } from "@/src/components/layout/OwnerBranchFilterContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

const menuItems = [
  {
    tKey: "nav.users",
    href: "/users",
    icon: Users,
    roles: [Role.OWNER, Role.CASHIER, Role.TRAINER],
  },
  {
    tKey: "nav.gymProfile",
    href: "/profile",
    icon: Building2,
    roles: [Role.OWNER],
  },
  {
    tKey: "nav.faqs",
    href: "/faqs",
    icon: MessageCircleQuestion,
    roles: [Role.OWNER],
  },
  {
    tKey: "nav.expiryPresets",
    href: "/expiry-presets",
    icon: Timer,
    roles: [Role.OWNER],
  },
  {
    tKey: "nav.gymPrices",
    href: "/custom-fees/gym-prices",
    icon: DollarSign,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    tKey: "nav.otherServices",
    href: "/custom-fees/other-services",
    icon: Package,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    tKey: "nav.trainerFees",
    href: "/custom-fees/trainer-fees",
    icon: UserCheck,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    tKey: "nav.subscriptions",
    href: "/subscriptions",
    icon: Calendar,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    tKey: "nav.paymentRequests",
    href: "/payment-requests",
    icon: Wallet,
    roles: [Role.OWNER, Role.CASHIER],
  },

  {
    tKey: "nav.notifications",
    href: "/notifications",
    icon: Bell,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    tKey: "nav.attendance",
    href: "/attendance",
    icon: Clock,
    roles: [Role.CUSTOMER],
  },
  {
    tKey: "nav.measurements",
    href: "/measurements",
    icon: TrendingUp,
    roles: [Role.CUSTOMER],
  },
];

const OWNER_BRANCH_STORAGE_KEY = "owner-branch-filter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  // All hooks must be called before any conditional returns
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data: gymProfile } = useGetGymProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: notiCountData } = useGetUnreadCountQuery(undefined, {
    skip:
      !isAuthenticated ||
      (user?.role !== Role.OWNER && user?.role !== Role.CASHIER),
    pollingInterval: 5 * 60 * 1000,
  });
  const unreadNotiCount = notiCountData?.count ?? 0;
  const { data: pendingCountData } = useGetPendingCountQuery(undefined, {
    skip:
      !isAuthenticated ||
      (user?.role !== Role.OWNER && user?.role !== Role.CASHIER),
    pollingInterval: 5 * 60 * 1000,
  });
  const pendingPaymentCount = pendingCountData?.count ?? 0;
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const isOwner = user?.role === Role.OWNER;
  const branches = gymProfile?.multiGyms ?? [];

  // Auth pages that shouldn't show the sidebar
  const authPages = ["/login", "/register", "/forgot-password", "/auth"];
  const isAuthPage = authPages.some((page) => pathname?.startsWith(page));
  const trainerSubscriptionHref =
    user?.role === Role.TRAINER && user?._id
      ? `/subscriptions/trainer/${user._id}`
      : null;
  const footerProfileHref =
    user?.role === Role.OWNER ? "/profile" : "/my-profile";
  const footerProfileLabel =
    user?.role === Role.OWNER ? t("nav.gymProfile") : t("myProfile.title");

  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isAuthPage, router]);

  useEffect(() => {
    if (!isOwner) {
      setSelectedGymId(null);
      return;
    }

    const savedGymId = window.sessionStorage.getItem(OWNER_BRANCH_STORAGE_KEY);
    setSelectedGymId(savedGymId || null);
  }, [isOwner]);

  useEffect(() => {
    if (!isOwner) {
      return;
    }

    if (
      selectedGymId &&
      !branches.some((branch) => branch._id === selectedGymId)
    ) {
      setSelectedGymId(null);
    }
  }, [branches, isOwner, selectedGymId]);

  useEffect(() => {
    if (!isOwner) {
      window.sessionStorage.removeItem(OWNER_BRANCH_STORAGE_KEY);
      return;
    }

    if (selectedGymId) {
      window.sessionStorage.setItem(OWNER_BRANCH_STORAGE_KEY, selectedGymId);
    } else {
      window.sessionStorage.removeItem(OWNER_BRANCH_STORAGE_KEY);
    }
  }, [isOwner, selectedGymId]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      // Continue with redirect even if API fails
    } finally {
      // Always redirect to login
      router.push("/auth/login");
    }
  };

  // For auth pages, just render children (no sidebar)
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show nothing while redirecting unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  const subscriptionsMenuHref =
    user?.role === Role.TRAINER
      ? (trainerSubscriptionHref ?? "/subscriptions")
      : "/subscriptions";
  const selectedBranch = branches.find(
    (branch) => branch._id === selectedGymId,
  );

  // For authenticated pages, show sidebar layout
  return (
    <OwnerBranchFilterProvider
      value={{
        isOwner,
        branches,
        selectedGymId,
        setSelectedGymId,
      }}
    >
      <TooltipProvider>
        <SidebarProvider>
          <Sidebar
            collapsible="icon"
            className="border-r border-border bg-background"
          >
            <SidebarHeader className="border-b border-border">
              <div className="px-2 py-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground group-data-[collapsible=icon]:hidden truncate">
                    {gymProfile?.name || "Gym Manager"}
                  </h2>
                  {gymProfile?.logo ? (
                    <img
                      src={gymProfile.logo}
                      alt={gymProfile.name || "Gym"}
                      className="h-10 w-10 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-600">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                {isOwner && branches.length > 0 && (
                  <div className="mt-3 group-data-[collapsible=icon]:hidden">
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      Viewing Branch
                    </p>
                    <Select
                      value={selectedGymId ?? "all"}
                      onValueChange={(value) =>
                        setSelectedGymId(value === "all" ? null : value)
                      }
                    >
                    <SelectTrigger className="h-9 w-[11rem] cursor-pointer border border-gray-200 bg-white text-sm shadow-sm transition-colors hover:bg-gray-50 focus:ring-0 focus-visible:ring-0">
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent className="border border-gray-200 bg-white shadow-lg">
                        <SelectItem
                          value="all"
                          className="cursor-pointer focus:bg-gray-100"
                        >
                          All Branches
                        </SelectItem>
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch._id}
                            value={String(branch._id)}
                            className="cursor-pointer focus:bg-gray-100"
                          >
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </SidebarHeader>
            <SidebarContent className="px-3 py-4">
              <SidebarMenu>
                {menuItems
                  .filter(
                    (item) =>
                      !item.roles || item.roles.includes(user?.role as Role),
                  )
                  .map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={t(item.tKey)}
                        className="px-3 py-2.5 hover:bg-[hsl(215,25%,20%)] hover:text-white data-[active=true]:bg-[hsl(215,25%,20%)] data-[active=true]:text-white"
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="group-data-[collapsible=icon]:hidden font-medium flex-1">
                            {t(item.tKey)}
                          </span>
                          {item.href === "/notifications" &&
                            unreadNotiCount > 0 && (
                              <span className="group-data-[collapsible=icon]:hidden ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                {unreadNotiCount > 99 ? "99+" : unreadNotiCount}
                              </span>
                            )}
                          {item.href === "/payment-requests" &&
                            pendingPaymentCount > 0 && (
                              <span className="group-data-[collapsible=icon]:hidden ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                                {pendingPaymentCount > 99 ? "99+" : pendingPaymentCount}
                              </span>
                            )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                {user?.role === Role.TRAINER && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname?.startsWith("/subscriptions")}
                      tooltip={t("nav.mySubscriptions")}
                      className="px-3 py-2.5 hover:bg-sidebar-accent hover:text-white data-[active=true]:bg-[hsl(215,25%,20%)] data-[active=true]:text-white"
                    >
                      <Link
                        href={subscriptionsMenuHref}
                        className="flex items-center gap-3"
                      >
                        <Calendar className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden font-medium">
                          {t("nav.mySubscriptions")}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t border-border mt-auto">
              {user && (
                <div className="px-2 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted mb-2 w-full hover:bg-accent transition-colors">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                          <p className="font-medium truncate text-foreground">
                            {user.nickname || user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side="top"
                      className="z-200 w-56 mb-1 backdrop-blur-md"
                    >
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.nickname || user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my-profile" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t("nav.settings")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 cursor-pointer focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t("nav.logout")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-6 shadow-sm backdrop-blur">
              <h1 className="flex-1 text-xl font-semibold text-foreground">
                {t("nav.dashboard")}
              </h1>
              <LanguageToggle compact />
              {(user?.role === Role.OWNER || user?.role === Role.CASHIER) && (
                <NotificationBell />
              )}
            </header>
            <main className="flex-1 bg-background">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </OwnerBranchFilterProvider>
  );
}
