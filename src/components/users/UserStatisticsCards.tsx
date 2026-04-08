import { Role } from "@/src/types/type";
import { lightSurfaceClassName } from "./users.constants";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  customers: number;
  staff: number;
}

interface UserStatisticsCardsProps {
  stats: Stats;
  isLoading: boolean;
  currentUserRole: Role | undefined;
}

export function UserStatisticsCards({
  stats,
  isLoading,
  currentUserRole,
}: UserStatisticsCardsProps) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Active Users", value: stats.activeUsers },
    { label: "Customers", value: stats.customers },
    {
      label: currentUserRole === Role.CASHIER ? "Trainers" : "Staff",
      value: stats.staff,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className={`rounded-2xl p-6 transition-shadow hover:shadow-md ${lightSurfaceClassName}`}
        >
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {isLoading ? "--" : value}
          </p>
        </div>
      ))}
    </div>
  );
}
