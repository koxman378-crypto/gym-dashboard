"use client";

import type { ElementType } from "react";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Filter,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useLanguage } from "@/src/components/language/LanguageContext";
import { useOwnerBranchFilter } from "@/src/components/layout/OwnerBranchFilterContext";
import { useAppSelector } from "@/src/store/hooks";
import {
  useGetExpensesMonthlyHistoryQuery,
  useGetExpensesQuery,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type MonthlyExpense,
} from "@/src/store/services/expensesApi";
type StatusFilter = "all" | ExpenseStatus;

type ExpenseMonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  expenses: Expense[];
  total: number;
  count: number;
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

function sumApprovedHistory(history: MonthlyExpense[]) {
  return history.reduce((sum, item) => sum + (item.total ?? 0), 0);
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
    chip: "bg-amber-100 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {expense.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {category}
            </span>
            <span>{submittedBy}</span>
            <span>•</span>
            <span>{formatDate(expense.createdAt)}</span>
          </div>
        </div>
        <div
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.chip}`}
        >
          <span
            className={`mr-1 inline-block h-2 w-2 rounded-full ${tone.dot}`}
          />
          {status}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("expenses.amount")}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {formatMoney(expense.amount)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-xs text-slate-500">
          <span>
            {t("expenses.proofImages")}: {expense.proofImages?.length ?? 0}
          </span>
          <span>
            {t("expenses.submittedBy")}: {expense.submittedByName}
          </span>
        </div>
      </div>

      {expense.note ? (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {expense.note}
        </div>
      ) : null}
    </div>
  );
}

export default function ExpensesPage() {
  const { t, lang } = useLanguage();
  const { isOwner, selectedGymId } = useOwnerBranchFilter();
  const user = useAppSelector((state) => state.auth.user);
  const [year, setYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const gymId = isOwner
    ? (selectedGymId ?? undefined)
    : (user?.gymId ?? undefined);

  const {
    data: expensesResponse,
    isLoading: expensesLoading,
    isFetching: expensesFetching,
    error: expensesError,
  } = useGetExpensesQuery({
    gymId,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: 1,
    limit: 100,
  });

  const {
    data: monthlyHistory = [],
    isLoading: historyLoading,
    isFetching: historyFetching,
  } = useGetExpensesMonthlyHistoryQuery({ gymId, year }, { skip: !isOwner });

  const expenses = expensesResponse?.data ?? [];
  const groupedExpenses = useMemo(
    () => groupExpensesByMonth(expenses, lang),
    [expenses, lang],
  );

  const visibleGroups = useMemo(() => {
    if (!selectedMonth) return groupedExpenses;
    return groupedExpenses.filter((group) => group.key === selectedMonth);
  }, [groupedExpenses, selectedMonth]);

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

  const historyTotal = useMemo(
    () => sumApprovedHistory(monthlyHistory),
    [monthlyHistory],
  );
  const recentMonth = monthlyHistory[0] ?? null;

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, []);

  const groupLabel = selectedMonth
    ? (visibleGroups[0]?.label ?? t("expenses.monthlyHistory"))
    : t("expenses.monthlyHistory");

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section
          className={
            isOwner
              ? "overflow-hidden rounded-4xl border border-zinc-200 bg-white shadow-sm"
              : "hidden"
          }
        >
          <div className="grid gap-6 bg-gradient-to-br from-zinc-50 to-white p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-700">
                <ReceiptText className="h-4 w-4" />
                {t("expenses.title")}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                  {t("expenses.subtitle")}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Track expense requests, review monthly totals, and jump
                  between months without losing the bigger picture.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
                  onClick={() => setYear((current) => current - 1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("expenses.year")} {year - 1}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                  onClick={() => setYear(new Date().getFullYear())}
                >
                  <CalendarDays className="h-4 w-4" />
                  {t("expenses.year")} {year}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
                  onClick={() => setYear((current) => current + 1)}
                >
                  {t("expenses.year")} {year + 1}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <HeroStat
                icon={Wallet}
                label={t("expenses.monthlyTotal")}
                value={formatMoney(historyTotal)}
                note={
                  recentMonth
                    ? `${getMonthName(recentMonth)} • ${recentMonth.count} ${t("expenses.expenses_count")}`
                    : "No monthly data yet"
                }
              />
              <HeroStat
                icon={TrendingUp}
                label={t("expenses.totalThisMonth")}
                value={formatMoney(summary.total)}
                note={`${summary.count} records • ${summary.pendingCount} pending`}
              />
            </div>
          </div>
        </section>

        <section className={isOwner ? "grid gap-4 md:grid-cols-4" : "hidden"}>
          <InfoCard
            label={t("expenses.totalThisMonth")}
            value={formatMoney(summary.total)}
            icon={CircleDollarSign}
          />
          <InfoCard
            label={t("expenses.approved")}
            value={formatMoney(summary.approved)}
            icon={Wallet}
          />
          <InfoCard
            label={t("expenses.pending")}
            value={String(summary.pendingCount)}
            icon={Filter}
          />
          <InfoCard
            label={t("expenses.rejected")}
            value={String(summary.rejectedCount)}
            icon={ReceiptText}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr]">
          <div
            className={
              isOwner
                ? "rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm"
                : "rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm"
            }
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  {t("expenses.monthlyHistory")}
                </h2>
                <p className="text-sm text-zinc-600">{groupLabel}</p>
              </div>

              <div
                className={
                  isOwner ? "flex flex-wrap items-center gap-2" : "hidden"
                }
              >
                <select
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 outline-none transition focus:border-zinc-400"
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

                <button
                  type="button"
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                  onClick={() => setSelectedMonth(null)}
                >
                  {selectedMonth ? "Show all months" : t("expenses.filterAll")}
                </button>
              </div>
            </div>

            <div
              className={
                isOwner
                  ? "mb-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3"
                  : "hidden"
              }
            >
              {historyLoading || historyFetching ? (
                <LoadingCard text={t("expenses.monthlyHistory")} />
              ) : monthlyHistory.length > 0 ? (
                monthlyHistory.map((item) => {
                  const key = `${item.year}-${String(item.month).padStart(2, "0")}`;
                  const active = selectedMonth === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedMonth(key)}
                      className={[
                        "group rounded-2xl border p-4 text-left transition-all",
                        active
                          ? "ring-2 ring-zinc-300"
                          : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/70 dark:border-slate-800 dark:bg-slate-900/70",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            {t("expenses.monthlyTotal")}
                          </p>
                          <h3 className="mt-2 text-base font-bold text-zinc-900">
                            {getMonthName(item)}
                          </h3>
                        </div>
                        <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                          {item.count}
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            {t("expenses.totalThisMonth")}
                          </p>
                          <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                            {formatMoney(item.total)}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t("expenses.viewExpenses")}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <EmptyState
                  title={t("expenses.noExpenses")}
                  description={t("expenses.noExpenses")}
                />
              )}
            </div>

            {visibleGroups.length > 0 ? (
              <div className="space-y-5">
                {visibleGroups.map((group) => {
                  const groupTotal = group.expenses.reduce(
                    (sum, item) => sum + (item.amount ?? 0),
                    0,
                  );
                  return (
                    <section
                      key={group.key}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            {t("expenses.monthlyHistory")}
                          </p>
                          <h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                            {group.label}
                          </h3>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-2 text-right shadow-sm dark:bg-slate-950/70">
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            {t("expenses.monthlyTotal")}
                          </p>
                          <p className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">
                            {formatMoney(groupTotal)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
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
                  selectedMonth
                    ? "No expenses exist for the selected month."
                    : "No expenses found for the selected filters."
                }
              />
            )}
          </div>

          {isOwner ? (
            <aside className="space-y-4">
              <div
                className={
                  isOwner
                    ? "rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm"
                    : "rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm"
                }
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">
                      {t("expenses.year")} {year}
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {isOwner && selectedGymId
                        ? `Branch: ${selectedGymId}`
                        : "Current gym context"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {yearOptions.map((item) => {
                    const active = item === year;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setYear(item)}
                        className={[
                          "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                          active
                            ? "bg-zinc-200 text-zinc-900"
                            : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={
                  isOwner
                    ? "rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm"
                    : "rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm"
                }
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">
                      Snapshot
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {expensesFetching
                        ? "Refreshing…"
                        : `Loaded ${summary.count} expenses`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <MiniMetric
                    label="Total spent"
                    value={formatMoney(summary.total)}
                  />
                  <MiniMetric
                    label="Approved"
                    value={formatMoney(summary.approved)}
                  />
                  <MiniMetric
                    label="Pending count"
                    value={String(summary.pendingCount)}
                  />
                  <MiniMetric
                    label="Rejected count"
                    value={String(summary.rejectedCount)}
                  />
                </div>
              </div>
            </aside>
          ) : null}
        </section>

        {expensesError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            Unable to load expenses right now.
          </div>
        ) : null}

        {expensesLoading ? <LoadingCard text={t("expenses.loading")} /> : null}
      </div>
    </div>
  );
}

function getMonthName(item: MonthlyExpense) {
  return MONTH_NAMES[item.month - 1]
    ? `${MONTH_NAMES[item.month - 1]} ${item.year}`
    : `${item.month}/${item.year}`;
}

function HeroStat({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: ElementType;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-zinc-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
          <Icon className="h-5 w-5 text-zinc-700" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-5 text-zinc-600">{note}</p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-zinc-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-base font-bold text-zinc-900">{value}</p>
    </div>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 shadow-sm">
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
    <div className="rounded-[1.75rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <p className="text-lg font-bold text-zinc-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}
