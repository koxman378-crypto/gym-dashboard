"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  Filter,
  Layers3,
  Plus,
  ReceiptText,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useLanguage } from "@/src/components/language/LanguageContext";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { OwnerBranchSelect } from "@/src/components/layout/OwnerBranchSelect";
import { useAppSelector } from "@/src/store/hooks";
import {
  useCreateExpenseMutation,
  useGetExpenseSummaryQuery,
  useGetExpensesQuery,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
} from "@/src/store/services/expensesApi";
import {
  useGetAllStaffQuery,
} from "@/src/store/services/usersApi";
import { DataTablePagination } from "@/src/components/data-table/data-table-pagination";

type StatusFilter = "all" | ExpenseStatus;
type CategoryFilter = "all" | ExpenseCategory;
type MonthFilter = "all" | `${number}`;

type ExpenseMonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  expenses: Expense[];
  total: number;
  count: number;
};

type ExpenseFormState = {
  title: string;
  amount: string;
  category: ExpenseCategory;
  note: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; labelKey: string }> = [
  { value: "all", labelKey: "expenses.allExpenses" },
  { value: "pending", labelKey: "expenses.pending" },
  { value: "approved", labelKey: "expenses.approved" },
  { value: "rejected", labelKey: "expenses.rejected" },
];

const CATEGORY_OPTIONS: Array<{ value: CategoryFilter; labelKey: string }> = [
  { value: "all", labelKey: "expenses.category" },
  { value: "maintenance", labelKey: "expenses.cat_maintenance" },
  { value: "utilities", labelKey: "expenses.cat_utilities" },
  { value: "equipment", labelKey: "expenses.cat_equipment" },
  { value: "salary", labelKey: "expenses.cat_salary" },
  { value: "rent", labelKey: "expenses.cat_rent" },
  { value: "other", labelKey: "expenses.cat_other" },
];

const MONTH_FILTER_OPTIONS: Array<{ value: MonthFilter; label: string }> = [
  { value: "all", label: "All months" },
  ...MONTH_NAMES.map((month, index) => ({
    value: String(index + 1) as MonthFilter,
    label: month,
  })),
];

const DEFAULT_EXPENSES_PAGE_SIZE = 12;

const CATEGORY_KEYS: Record<ExpenseCategory, string> = {
  maintenance: "expenses.cat_maintenance",
  utilities: "expenses.cat_utilities",
  equipment: "expenses.cat_equipment",
  salary: "expenses.cat_salary",
  rent: "expenses.cat_rent",
  other: "expenses.cat_other",
};

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Number(value).toLocaleString()} MMK`;
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getMonthKey(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthLabel(year: number, month: number, lang: string) {
  const monthName = MONTH_NAMES[month - 1] ?? `Month ${month}`;
  if (lang === "mm") {
    return new Date(year, month - 1, 1).toLocaleDateString("my-MM", {
      year: "numeric",
      month: "long",
    });
  }
  return `${monthName} ${year}`;
}

function getPeriodBounds(year: number, monthFilter: MonthFilter) {
  if (monthFilter === "all") {
    return {
      from: new Date(year, 0, 1, 0, 0, 0, 0).toISOString(),
      to: new Date(year, 11, 31, 23, 59, 59, 999).toISOString(),
    };
  }

  const month = Number(monthFilter);
  return {
    from: new Date(year, month - 1, 1, 0, 0, 0, 0).toISOString(),
    to: new Date(year, month, 0, 23, 59, 59, 999).toISOString(),
  };
}

function getPeriodLabel(year: number, monthFilter: MonthFilter, lang: string) {
  if (monthFilter === "all") {
    return lang === "mm" ? `${year} ခုနှစ်` : `All months in ${year}`;
  }

  return getMonthLabel(year, Number(monthFilter), lang);
}

function groupExpensesByMonth(
  expenses: Expense[],
  lang: string,
): ExpenseMonthGroup[] {
  const groups = new Map<string, ExpenseMonthGroup>();

  for (const expense of expenses) {
    const monthKey =
      getMonthKey(expense.createdAt) ?? getMonthKey(expense.updatedAt);
    if (!monthKey) continue;
    const [yearText, monthText] = monthKey.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const existing = groups.get(monthKey);

    if (existing) {
      existing.expenses.push(expense);
      existing.total += expense.amount ?? 0;
      existing.count += 1;
      continue;
    }

    groups.set(monthKey, {
      key: monthKey,
      year,
      month,
      label: getMonthLabel(year, month, lang),
      expenses: [expense],
      total: expense.amount ?? 0,
      count: 1,
    });
  }

  return Array.from(groups.values()).sort((a, b) => {
    const left = new Date(a.year, a.month - 1, 1).getTime();
    const right = new Date(b.year, b.month - 1, 1).getTime();
    return right - left;
  });
}

function getCategoryLabel(
  category: ExpenseCategory,
  t: (path: string) => string,
) {
  return t(CATEGORY_KEYS[category] ?? "expenses.cat_other");
}

function getStatusLabel(status: string, t: (path: string) => string) {
  if (status === "pending") return t("expenses.pending");
  if (status === "approved") return t("expenses.approved");
  if (status === "rejected") return t("expenses.rejected");
  return status;
}

function getStatusTone(status: string) {
  if (status === "approved") {
    return {
      chip: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      dot: "bg-emerald-500",
    };
  }
  if (status === "rejected") {
    return {
      chip: "bg-rose-100 text-rose-700 ring-rose-200",
      dot: "bg-rose-500",
    };
  }
  return {
    chip: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    dot: "bg-zinc-400",
  };
}

function ExpenseCard({
  expense,
  t,
}: {
  expense: Expense;
  t: (path: string) => string;
}) {
  const category = getCategoryLabel(expense.category, t);
  const status = getStatusLabel(expense.status, t);
  const tone = getStatusTone(expense.status);
  const submittedBy =
    typeof expense.submittedBy === "string"
      ? expense.submittedBy
      : (expense.submittedBy?.name ?? expense.submittedByName ?? "Unknown");

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-gray-100 bg-white shadow-sm shadow-gray-100/70 transition-all hover:border-gray-200 hover:shadow-md">
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                {category}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tone.chip}`}
              >
                <span
                  className={`mr-1 inline-block h-2 w-2 rounded-full ${tone.dot}`}
                />
                {status}
              </span>
            </div>

            <h3 className="mt-3 truncate text-base font-bold text-gray-950">
              {expense.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
              <span>{submittedBy}</span>
              <span className="text-gray-300">•</span>
              <span>{formatDate(expense.createdAt)}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t("expenses.amount")}
            </p>
            <p className="mt-1 text-lg font-black text-gray-950">
              {formatMoney(expense.amount)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Proof files
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {expense.proofImages?.length ?? 0}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Submitted by
            </p>
            <p className="mt-1 truncate text-sm font-bold text-gray-900">
              {expense.submittedByName}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f7f2] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Updated
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {formatDate(expense.updatedAt)}
            </p>
          </div>
        </div>

        {expense.note ? (
          <div className="rounded-2xl border border-gray-100 bg-[#fcfcf9] p-3 text-sm leading-6 text-gray-600">
            {expense.note}
          </div>
        ) : null}

        {expense.category === "salary" && expense.salaryItems?.length ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3 text-xs font-medium text-sky-700">
            Salary batch for {expense.salaryItems.length} staff member
            {expense.salaryItems.length > 1 ? "s" : ""}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function ExpensesPage() {
  const { t, lang } = useLanguage();
  const { isOwner, selectedGymId, branches, setSelectedGymId } = useOwnerBranchFilter();
  const user = useAppSelector((state) => state.auth.user);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_EXPENSES_PAGE_SIZE);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonthFilter, setSelectedMonthFilter] =
    useState<MonthFilter>("all");
  const [formState, setFormState] = useState<ExpenseFormState>({
    title: "",
    amount: "",
    category: "maintenance",
    note: "",
  });

  const gymId = isOwner
    ? (selectedGymId ?? user?.gymId ?? undefined)
    : (user?.gymId ?? undefined);
  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => currentYear - index),
    [currentYear],
  );
  const rangeBounds = useMemo(
    () => getPeriodBounds(selectedYear, selectedMonthFilter),
    [selectedYear, selectedMonthFilter],
  );
  const canCreateExpense = user?.role === "owner" || user?.role === "cashier";

  const {
    data: expensesResponse,
    isLoading: expensesLoading,
    isFetching: expensesFetching,
    error: expensesError,
  } = useGetExpensesQuery(
    {
      gymId,
      status: statusFilter === "all" ? undefined : statusFilter,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      submittedBy: isOwner ? undefined : user?._id,
      from: rangeBounds.from,
      to: rangeBounds.to,
      page,
      limit: pageSize,
    },
    { skip: !user },
  );

  const { data: summaryResponse, isLoading: financeLoading } =
    useGetExpenseSummaryQuery(
      { gymId, from: rangeBounds.from, to: rangeBounds.to },
      { skip: !isOwner },
    );

  const { data: staff = [] } = useGetAllStaffQuery(
    { gymId },
    { skip: !canCreateExpense || !gymId },
  );

  const [createExpense, { isLoading: isCreatingExpense }] =
    useCreateExpenseMutation();

  const expenses = expensesResponse?.data ?? [];
  const groupedExpenses = useMemo(
    () => groupExpensesByMonth(expenses, lang),
    [expenses, lang],
  );

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const approved = expenses
      .filter((item) => item.status === "approved")
      .reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const pendingCount = expenses.filter(
      (item) => item.status === "pending",
    ).length;
    const rejectedCount = expenses.filter(
      (item) => item.status === "rejected",
    ).length;

    return {
      total,
      approved,
      pendingCount,
      rejectedCount,
      count: expenses.length,
    };
  }, [expenses]);

  const salaryTotal = useMemo(
    () =>
      staff.reduce((sum, member) => {
        const salary = Number(member.salaryAmount ?? 0);
        return sum + (Number.isFinite(salary) ? salary : 0);
      }, 0),
    [staff],
  );

  const financeSummary = summaryResponse ?? {
    totalIncome: 0,
    totalExpenses: 0,
    net: 0,
  };

  const netTone: "success" | "danger" | "warning" =
    financeSummary.net > 0
      ? "success"
      : financeSummary.net < 0
        ? "danger"
        : "warning";

  const groupLabel = getPeriodLabel(selectedYear, selectedMonthFilter, lang);
  const totalExpensesCount = expensesResponse?.total ?? 0;
  const totalPages = expensesResponse?.totalPages ?? 1;
  const historyRangeStart = totalExpensesCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const historyRangeEnd = Math.min(page * pageSize, totalExpensesCount);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, categoryFilter, selectedYear, selectedMonthFilter, gymId]);

  useEffect(() => {
    const totalPages = expensesResponse?.totalPages ?? 1;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [expensesResponse?.totalPages, page]);

  const handleExpenseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = formState.title.trim();
    if (!title) {
      window.alert("Please enter an expense title.");
      return;
    }

    const amount =
      formState.category === "salary" ? salaryTotal : Number(formState.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Please enter a valid amount.");
      return;
    }

    if (formState.category === "salary" && salaryTotal <= 0) {
      window.alert("No active staff salary was found for this branch.");
      return;
    }

    try {
      await createExpense({
        title,
        amount,
        category: formState.category,
        note: formState.note.trim() || undefined,
        gymId,
      }).unwrap();

      setFormState({
        title: "",
        amount: "",
        category: "maintenance",
        note: "",
      });
    } catch (error: any) {
      window.alert(
        error?.data?.message || error?.message || "Failed to create expense.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-sm shadow-gray-100/70">
          <div
            className={`grid gap-6 bg-[#f5f5f5] p-6 lg:p-8 ${
              isOwner ? "lg:grid-cols-[1.35fr_0.95fr]" : "lg:grid-cols-1"
            }`}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-gray-700">
                <ReceiptText className="h-4 w-4" />
                {t("expenses.title")}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  {isOwner
                    ? "Branch expense finance"
                    : "My expense requests"}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                  {isOwner
                    ? "Filter by month and year, then review income, expenses, and profit or loss for that exact period."
                    : "Submit your branch expense requests and review only your own submissions."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-gray-300"
                  value={selectedMonthFilter}
                  onChange={(event) =>
                    setSelectedMonthFilter(event.target.value as MonthFilter)
                  }
                >
                  {MONTH_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-gray-300"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                {isOwner && branches.length > 0 ? (
                  <OwnerBranchSelect
                    branches={branches}
                    selectedGymId={selectedGymId}
                    onChange={setSelectedGymId}
                    variant="compact"
                    allLabel="All Branches"
                  />
                ) : null}
              </div>
            </div>

            {isOwner ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <HeroStat
                  icon={Wallet}
                  label="Income"
                  value={formatMoney(financeSummary.totalIncome)}
                  note={groupLabel}
                  tone="success"
                />
                <HeroStat
                  icon={CircleDollarSign}
                  label="Expenses"
                  value={formatMoney(financeSummary.totalExpenses)}
                  note={`${summary.count} records • ${summary.pendingCount} pending`}
                  tone="danger"
                />
                <HeroStat
                  icon={TrendingUp}
                  label="Profit / Loss"
                  value={formatMoney(financeSummary.net)}
                  note={
                    financeSummary.net > 0
                      ? "Net profit for selected period"
                      : financeSummary.net < 0
                        ? "Net loss for selected period"
                        : "Break-even for selected period"
                  }
                  tone={netTone}
                />
              </div>
            ) : null}
          </div>
        </section>

        {canCreateExpense ? (
          <section className="rounded-[1.9rem] border border-zinc-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f5f5] text-gray-700">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Create expense request
                </h2>
                <p className="text-sm text-gray-600">
                  Salary requests will auto-summarize active staff salaries in
                  this branch.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleExpenseSubmit}
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              <div className="space-y-2 xl:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  className="w-full rounded-2xl border border-gray-100 bg-[#f5f5f5] px-4 py-3.5 text-sm outline-none transition focus:border-gray-300"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Electricity bill, repair, salary batch..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  className="w-full rounded-2xl border border-gray-100 bg-[#f5f5f5] px-4 py-3.5 text-sm outline-none transition focus:border-gray-300"
                  value={formState.category}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      category: event.target.value as ExpenseCategory,
                    }))
                  }
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="equipment">Equipment</option>
                  <option value="salary">Salary</option>
                  <option value="rent">Rent</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Amount (MMK)
                </label>
                {formState.category === "salary" ? (
                    <div className="rounded-2xl border border-gray-100 bg-[#f5f5f5] px-4 py-3.5 text-sm text-gray-700">
                      {formatMoney(salaryTotal)} from {staff.length} active staff
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-2xl border border-gray-100 bg-[#f5f5f5] px-4 py-3.5 text-sm outline-none transition focus:border-gray-300"
                      value={formState.amount}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="50000"
                  />
                )}
              </div>

              <div className="space-y-2 xl:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Note
                </label>
                <input
                  className="w-full rounded-2xl border border-gray-100 bg-[#f5f5f5] px-4 py-3.5 text-sm outline-none transition focus:border-gray-300"
                  value={formState.note}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Optional note"
                />
              </div>

              <div className="flex items-end xl:col-span-1">
                <button
                  type="submit"
                  disabled={isCreatingExpense}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingExpense ? "Submitting..." : "Submit expense"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {isOwner ? (
          <section className="grid gap-4 md:grid-cols-4">
            <InfoCard
              label="Profit / Loss"
              value={formatMoney(financeSummary.net)}
              icon={TrendingUp}
              tone={netTone}
            />
            <InfoCard
              label={t("expenses.totalThisMonth")}
              value={formatMoney(summary.approved)}
              icon={CircleDollarSign}
              tone="success"
            />
            <InfoCard
              label={t("expenses.pending")}
              value={String(summary.pendingCount)}
              icon={Filter}
              tone="warning"
            />
            <InfoCard
              label={t("expenses.rejected")}
              value={String(summary.rejectedCount)}
              icon={ReceiptText}
              tone="danger"
            />
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[1.9rem] border border-gray-100 bg-white shadow-sm shadow-gray-100/70">
          <div className="border-b border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(254,240,138,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(167,243,208,0.28),transparent_30%),#fcfcf9] p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700 shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  History Board
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                  {isOwner ? t("expenses.monthlyHistory") : "Request history"}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                  {isOwner
                    ? "Track expense activity by month with a cleaner timeline and pagination for long histories."
                    : "Review your submitted expense requests in a paginated timeline with clearer status and amount details."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MiniMetric
                  label="Visible"
                  value={`${historyRangeStart}-${historyRangeEnd}`}
                  caption={`of ${totalExpensesCount} records`}
                  tone="default"
                />
                <MiniMetric
                  label="Page"
                  value={`${page} / ${totalPages}`}
                  caption={groupLabel}
                  tone="accent"
                />
                <MiniMetric
                  label="Status"
                  value={t(STATUS_OPTIONS.find((option) => option.value === statusFilter)?.labelKey ?? "expenses.allExpenses")}
                  caption={
                    categoryFilter === "all"
                      ? expensesFetching
                        ? "Refreshing"
                        : "Live results"
                      : t(CATEGORY_OPTIONS.find((option) => option.value === categoryFilter)?.labelKey ?? "expenses.category")
                  }
                  tone="soft"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <select
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-300"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
              <select
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-300"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as CategoryFilter)
                }
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isOwner ? (
            <div className="border-b border-gray-100 bg-white px-5 py-5 sm:px-6">
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {groupedExpenses.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-gray-100 bg-[#f8f8f3] p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                          {t("expenses.monthlyTotal")}
                        </p>
                        <h3 className="mt-2 text-base font-bold text-gray-900">
                          {item.label}
                        </h3>
                      </div>
                      <span className="rounded-full border border-gray-100 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {item.count}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">
                          {t("expenses.totalThisMonth")}
                        </p>
                        <p className="mt-1 text-xl font-black text-gray-950">
                          {formatMoney(item.total)}
                        </p>
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        {t("expenses.viewExpenses")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="p-5 sm:p-6">
            {groupedExpenses.length > 0 ? (
              <div className="space-y-6">
                {groupedExpenses.map((group) => {
                  const groupTotal = group.expenses.reduce(
                    (sum, item) => sum + (item.amount ?? 0),
                    0,
                  );

                  return (
                    <section
                      key={group.key}
                      className="overflow-hidden rounded-[1.7rem] border border-gray-100 bg-[#fafaf6]"
                    >
                      <div className="border-b border-gray-100 bg-white/80 px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f5f0] text-gray-700">
                              <Layers3 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                                {t("expenses.monthlyHistory")}
                              </p>
                              <h3 className="mt-1 text-xl font-bold text-gray-950">
                                {group.label}
                              </h3>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <MiniMetric
                              label="Records"
                              value={String(group.count)}
                              caption="Entries"
                              tone="soft"
                            />
                            {isOwner ? (
                              <MiniMetric
                                label={t("expenses.monthlyTotal")}
                                value={formatMoney(groupTotal)}
                                caption="Visible in this page"
                                tone="accent"
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
                        {group.expenses.map((expense) => (
                          <ExpenseCard
                            key={expense._id}
                            expense={expense}
                            t={t}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title={t("expenses.noExpenses")}
                description={
                  "No expenses found for the selected month/year filters."
                }
              />
            )}

            {totalPages > 1 ? (
              <div className="mt-6 border-t border-zinc-200 bg-white p-4">
                <DataTablePagination
                  meta={{
                    page: expensesResponse?.page ?? page,
                    limit: expensesResponse?.limit ?? pageSize,
                    total: expensesResponse?.total ?? 0,
                    totalPages,
                  }}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  tone="light"
                />
              </div>
            ) : null}
          </div>
        </section>

        {expensesError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            Unable to load expenses right now.
          </div>
        ) : null}

        {expensesLoading || financeLoading ? (
          <LoadingCard text={t("expenses.loading")} />
        ) : null}
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  note,
  tone = "default",
}: {
  icon: ElementType;
  label: string;
  value: string;
  note: string;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const iconTone =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "danger"
        ? "bg-rose-100 text-rose-700"
        : tone === "warning"
          ? "bg-amber-100 text-amber-700"
          : "bg-[#f5f5f5] text-gray-700";
  const valueTone =
    tone === "success"
      ? "text-emerald-700"
      : tone === "danger"
        ? "text-rose-700"
        : tone === "warning"
          ? "text-amber-700"
          : "text-gray-900";

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100/70">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
            {label}
          </p>
          <div className="mt-2">
            <p
              className={`break-all text-base leading-tight font-black xl:text-lg ${valueTone}`}
            >
              {value.replace(" MMK", "")}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
              MMK
            </p>
          </div>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconTone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-600 sm:text-sm">{note}</p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: ElementType;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const iconTone =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "danger"
        ? "bg-rose-100 text-rose-700"
        : tone === "warning"
          ? "bg-amber-100 text-amber-700"
          : "bg-[#f5f5f5] text-gray-700";
  const valueTone =
    tone === "success"
      ? "text-emerald-700"
      : tone === "danger"
        ? "text-rose-700"
        : tone === "warning"
          ? "text-amber-700"
          : "text-gray-900";

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-100/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-black ${valueTone}`}>{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconTone}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: "default" | "accent" | "soft";
}) {
  const toneClass =
    tone === "accent"
      ? "border-emerald-100 bg-emerald-50"
      : tone === "soft"
        ? "border-amber-100 bg-amber-50"
        : "border-gray-100 bg-white/90";

  return (
    <div className={`min-w-35 rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-base font-bold text-gray-900">{value}</p>
      {caption ? (
        <p className="mt-1 text-xs text-gray-500">{caption}</p>
      ) : null}
    </div>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm shadow-gray-100/70">
      {text}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-gray-200 bg-[#f5f5f5] p-8 text-center">
      <p className="text-lg font-bold text-gray-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}
