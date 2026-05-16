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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarFooter,
} from "@/src/components/sidebar/page";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
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
  CalendarOff,
  Gift,
  ReceiptText,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { OwnerBranchSelect } from "@/src/components/layout/OwnerBranchSelect";

type NavItem = {
  tKey: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
  badge?: "notifications" | "payments";
  children?: NavItem[]; // For nested items
  hidden?: boolean;
};

type NavGroup = {
  groupKey: string;
  items: NavItem[];
};

// Grouped navigation for Owner role
const ownerNavGroups: NavGroup[] = [
  {
    groupKey: "nav.groupUsersSubscriptions",
    items: [
      {
        tKey: "nav.users",
        href: "/users",
        icon: Users,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.subscriptions",
        href: "/subscriptions",
        icon: Calendar,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.attendanceHistory",
        href: "/attendance",
        icon: Clock,
        roles: [Role.OWNER],
      },
    ],
  },
  {
    groupKey: "nav.groupFinancial",
    items: [
      {
        tKey: "nav.paymentRequests",
        href: "/payment-requests",
        icon: Wallet,
        roles: [Role.OWNER],
        badge: "payments",
      },
      {
        tKey: "nav.expenses",
        href: "/expenses",
        icon: ReceiptText,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.gymPrices",
        href: "/custom-fees/gym-prices",
        icon: DollarSign,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.otherServices",
        href: "/custom-fees/other-services",
        icon: Package,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.trainerFees",
        href: "/custom-fees/trainer-fees",
        icon: UserCheck,
        roles: [Role.OWNER],
      },
    ],
  },
  {
    groupKey: "nav.groupSettings",
    items: [
      {
        tKey: "nav.gymProfile",
        href: "/profile",
        icon: Building2,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.expiryPresets",
        href: "/expiry-presets",
        icon: Timer,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.offDays",
        href: "/off-days",
        icon: CalendarOff,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.faqs",
        href: "/faqs",
        icon: MessageCircleQuestion,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.birthdayWish",
        href: "/birthday-wish",
        icon: Gift,
        roles: [Role.OWNER],
      },
      {
        tKey: "nav.notifications",
        href: "/notifications",
        icon: Bell,
        roles: [Role.OWNER],
        badge: "notifications",
      },
    ],
  },
];

// Flat navigation for Cashier and other roles
const cashierNavItems: NavItem[] = [
  {
    tKey: "nav.users",
    href: "/users",
    icon: Users,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.subscriptions",
    href: "/subscriptions",
    icon: Calendar,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.paymentRequests",
    href: "/payment-requests",
    icon: Wallet,
    roles: [Role.CASHIER],
    badge: "payments",
  },
  {
    tKey: "nav.expiryPresets",
    href: "/expiry-presets",
    icon: Timer,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.gymPrices",
    href: "/custom-fees/gym-prices",
    icon: DollarSign,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.otherServices",
    href: "/custom-fees/other-services",
    icon: Package,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.trainerFees",
    href: "/custom-fees/trainer-fees",
    icon: UserCheck,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.expenses",
    href: "/expenses",
    icon: ReceiptText,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.attendanceHistory",
    href: "/attendance",
    icon: Clock,
    roles: [Role.CASHIER],
  },
  {
    tKey: "nav.notifications",
    href: "/notifications",
    icon: Bell,
    roles: [Role.CASHIER],
    badge: "notifications",
  },
];

const navItems: NavItem[] = [
  {
    tKey: "nav.users",
    href: "/users",
    icon: Users,
    roles: [Role.OWNER, Role.CASHIER, Role.TRAINER],
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
    badge: "payments",
  },
  {
    tKey: "nav.expiryPresets",
    href: "/expiry-presets",
    icon: Timer,
    roles: [Role.OWNER, Role.CASHIER],
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
    tKey: "nav.expenses",
    href: "/expenses",
    icon: ReceiptText,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    tKey: "nav.attendanceHistory",
    href: "/attendance",
    icon: Clock,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    tKey: "nav.offDays",
    href: "/off-days",
    icon: CalendarOff,
    roles: [Role.OWNER],
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
    tKey: "nav.birthdayWish",
    href: "/birthday-wish",
    icon: Gift,
    roles: [Role.OWNER],
  },
  {
    tKey: "nav.notifications",
    href: "/notifications",
    icon: Bell,
    roles: [Role.OWNER, Role.CASHIER],
    badge: "notifications",
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

function normalizeExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

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
  const ownerLinksHref =
    gymProfile?.facebook ||
    gymProfile?.instagram ||
    gymProfile?.tiktok ||
    gymProfile?.googleMapsUrl ||
    null;
  const ownerContactAction = gymProfile?.email
    ? `mailto:${gymProfile.email}`
    : gymProfile?.phone
      ? `tel:${gymProfile.phone}`
      : null;
  const openExternalTarget = (url: string | null) => {
    if (!url) {
      router.push("/profile");
      return;
    }

    if (/^(mailto:|tel:)/i.test(url)) {
      window.location.href = url;
      return;
    }

    window.open(normalizeExternalUrl(url), "_blank", "noopener,noreferrer");
  };

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
                    <OwnerBranchSelect
                      branches={branches}
                      selectedGymId={selectedGymId}
                      onChange={setSelectedGymId}
                      variant="compact"
                      className="px-1 pb-1"
                    />
                  </div>
                )}
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu className="px-2 py-2 gap-0.5">
                {user?.role === Role.TRAINER ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname?.startsWith("/subscriptions")}
                      tooltip={t("nav.mySubscriptions")}
                      className="hover:bg-[hsl(215,25%,20%)] hover:text-white data-[active=true]:bg-[hsl(215,25%,20%)] data-[active=true]:text-white"
                    >
                      <Link href={subscriptionsMenuHref}>
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {t("nav.mySubscriptions")}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : user?.role === Role.OWNER ? (
                  // Collapsible grouped navigation for Owner
                  ownerNavGroups.map((group) => (
                    <Collapsible
                      key={group.groupKey}
                      defaultOpen
                      className="group/collapsible mb-3"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={t(group.groupKey)}
                            className="hover:bg-transparent hover:text-foreground font-semibold cursor-pointer"
                          >
                            <span className="group-data-[collapsible=icon]:hidden text-xs uppercase tracking-wide text-muted-foreground">
                              {t(group.groupKey)}
                            </span>
                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="max-h-75 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                            {group.items
                              .filter((item) => !item.hidden)
                              .map((item) => (
                                <SidebarMenuSubItem key={item.href + item.tKey}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={
                                      item.href === "/subscriptions"
                                        ? pathname?.startsWith("/subscriptions")
                                        : pathname === item.href
                                    }
                                    tooltip={t(item.tKey)}
                                    className="hover:bg-[hsl(215,25%,27%)] hover:text-white data-[active=true]:bg-[hsl(215,25%,27%)] data-[active=true]:text-white transition-colors"
                                  >
                                    <Link href={item.href}>
                                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                                      <span className="text-xs">
                                        {t(item.tKey)}
                                      </span>
                                      {item.badge === "notifications" &&
                                        unreadNotiCount > 0 && (
                                          <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                            {unreadNotiCount > 99
                                              ? "99+"
                                              : unreadNotiCount}
                                          </span>
                                        )}
                                      {item.badge === "payments" &&
                                        pendingPaymentCount > 0 && (
                                          <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                                            {pendingPaymentCount > 99
                                              ? "99+"
                                              : pendingPaymentCount}
                                          </span>
                                        )}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))
                ) : user?.role === Role.CASHIER ? (
                  // Flat navigation for Cashier
                  cashierNavItems
                    .filter((item) => !item.hidden)
                    .map((item) => (
                      <SidebarMenuItem key={item.href + item.tKey}>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            item.href === "/subscriptions"
                              ? pathname?.startsWith("/subscriptions")
                              : pathname === item.href
                          }
                          tooltip={t(item.tKey)}
                          className="hover:bg-[hsl(215,25%,20%)] hover:text-white data-[active=true]:bg-[hsl(215,25%,20%)] data-[active=true]:text-white"
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {t(item.tKey)}
                            </span>
                            {item.badge === "notifications" &&
                              unreadNotiCount > 0 && (
                                <span className="group-data-[collapsible=icon]:hidden ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                  {unreadNotiCount > 99
                                    ? "99+"
                                    : unreadNotiCount}
                                </span>
                              )}
                            {item.badge === "payments" &&
                              pendingPaymentCount > 0 && (
                                <span className="group-data-[collapsible=icon]:hidden ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                                  {pendingPaymentCount > 99
                                    ? "99+"
                                    : pendingPaymentCount}
                                </span>
                              )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                ) : (
                  navItems
                    .filter((item) => item.roles.includes(user?.role as Role))
                    .filter((item) => !item.hidden)
                    .map((item) => (
                      <SidebarMenuItem key={item.href + item.tKey}>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            item.href === "/subscriptions"
                              ? pathname?.startsWith("/subscriptions")
                              : pathname === item.href
                          }
                          tooltip={t(item.tKey)}
                          className="hover:bg-[hsl(215,25%,20%)] hover:text-white data-[active=true]:bg-[hsl(215,25%,20%)] data-[active=true]:text-white"
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {t(item.tKey)}
                            </span>
                            {item.badge === "notifications" &&
                              unreadNotiCount > 0 && (
                                <span className="group-data-[collapsible=icon]:hidden ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                  {unreadNotiCount > 99
                                    ? "99+"
                                    : unreadNotiCount}
                                </span>
                              )}
                            {item.badge === "payments" &&
                              pendingPaymentCount > 0 && (
                                <span className="group-data-[collapsible=icon]:hidden ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                                  {pendingPaymentCount > 99
                                    ? "99+"
                                    : pendingPaymentCount}
                                </span>
                              )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
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
