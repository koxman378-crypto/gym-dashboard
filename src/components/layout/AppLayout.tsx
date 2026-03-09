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
  CreditCard,
  Calendar,
  LogOut,
  User,
  Clock,
  TrendingUp,
  DollarSign,
  Package,
  FileText,
  UserCheck,
  Settings,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useAppSelector } from "@/src/store/hooks";
import { useLogoutMutation } from "@/src/store/services/authApi";
import { useRouter } from "next/navigation";
import { Role } from "@/src/types/type";
import { ThemeToggle } from "@/src/components/theme/ThemeToggle";
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
    roles: [Role.OWNER, Role.CASHIER, Role.TRAINER],
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

  // Auth pages that shouldn't show the sidebar
  const authPages = ["/login", "/register", "/forgot-password", "/auth"];
  const isAuthPage = authPages.some((page) => pathname?.startsWith(page));

  // Redirect to login if not authenticated (using useEffect to avoid render issues)
  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isAuthPage, router]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
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

  // Show loading or nothing while redirecting unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  // For authenticated pages, show sidebar layout
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar
          collapsible="icon"
          className="border-r border-slate-200 bg-white"
        >
          <SidebarHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3 px-3 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                <span className="text-sm font-bold text-white">
                  GM
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 group-data-[collapsible=icon]:hidden">
                Gym Manager
              </h2>
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
                      className="px-3 py-2.5 hover:bg-slate-100 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
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
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-slate-200 mt-auto">
            {user && (
              <div className="px-2 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 mb-2 w-full hover:bg-slate-100 transition-colors">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                          <User className="h-4 w-4 text-slate-700" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                        <p className="font-medium truncate text-slate-900">
                          {user.nickname || user.name}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
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
                        <p className="text-xs leading-none text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
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
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
            <h1 className="text-xl font-semibold text-slate-900">
              Dashboard
            </h1>
            {/* <div className="ml-auto">
              <ThemeToggle />
            </div> */}
          </header>
          <main className="flex-1 bg-slate-50">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

