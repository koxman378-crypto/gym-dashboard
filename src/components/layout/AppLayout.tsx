"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useAppSelector } from "@/src/store/hooks";
import { useLogoutMutation } from "@/src/store/services/authApi";
import { useGetGymProfileQuery } from "@/src/store/services/gymProfileApi";
import { useRouter } from "next/navigation";
import { Role } from "@/src/types/type";
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
    title: "Users",
    href: "/users",
    icon: Users,
    roles: [Role.OWNER, Role.TRAINER],
  },
  {
    title: "Gym Profile",
    href: "/profile",
    icon: Building2,
    roles: [Role.OWNER],
  },
  {
    title: "FAQs",
    href: "/faqs",
    icon: MessageCircleQuestion,
    roles: [Role.OWNER],
  },
  {
    title: "Expiry Presets",
    href: "/expiry-presets",
    icon: Timer,
    roles: [Role.OWNER],
  },
  {
    title: "Gym Prices",
    href: "/custom-fees/gym-prices",
    icon: DollarSign,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    title: "Other Services",
    href: "/custom-fees/other-services",
    icon: Package,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    title: "Trainer Fees",
    href: "/custom-fees/trainer-fees",
    icon: UserCheck,
    roles: [Role.OWNER, Role.CASHIER],
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: Calendar,
    roles: [Role.OWNER, Role.CASHIER],
  },

  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: [Role.CUSTOMER],
  },
  {
    title: "Measurements",
    href: "/measurements",
    icon: TrendingUp,
    roles: [Role.CUSTOMER],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  // All hooks must be called before any conditional returns
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data: gymProfile } = useGetGymProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

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
    user?.role === Role.OWNER ? "Gym Profile" : "Profile Settings";

  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isAuthPage, router]);

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

  // For authenticated pages, show sidebar layout
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar
          collapsible="icon"
          className="border-r border-border bg-background"
        >
          <SidebarHeader className="border-b border-border">
            <div className="flex items-center gap-2 px-2 py-3">
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
                      tooltip={item.title}
                      className="px-3 py-2.5 hover:bg-[hsl(215,25%,20%)] hover:text-white data-[active=true]:bg-[hsl(215,25%,20%)] data-[active=true]:text-white"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden font-medium">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {user?.role === Role.TRAINER && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname?.startsWith("/subscriptions")}
                    tooltip="My Subscriptions"
                    className="px-3 py-2.5 hover:bg-sidebar-accent hover:text-white data-[active=true]:bg-[hsl(215,25%,20%)] data-[active=true]:text-white"
                  >
                    <Link
                      href={subscriptionsMenuHref}
                      className="flex items-center gap-3"
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden font-medium">
                        My Subscriptions
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
                  <DropdownMenuContent align="end" className="w-56">
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
                      <Link href={footerProfileHref} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{footerProfileLabel}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-gray-100 px-6 shadow-sm backdrop-blur">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </header>
          <main className="flex-1 bg-background">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
