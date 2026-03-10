"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Settings2,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { TableLoaderOverlay } from "@/src/components/loading";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableProps } from "@/src/types/table";
import { cn } from "@/src/lib/utils";

/** Clickable sortable header — use inside column `header` definitions */
export function SortableHeader({
  column,
  label,
}: {
  column: any;
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ChevronDown className="ml-2 h-4 w-4" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}

// Generic DataTable component
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  isSoftLoading = false,
  pagination,
  onRowClick,
  enableRowSelection = false,
  onRowSelectionChange,
  emptyMessage = "No results.",
  getRowId,
  filterColumn,
  filterPlaceholder,
  showColumnVisibility = false,
  toolbar,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const memoizedColumns = React.useMemo(() => columns, [columns]);

  const table = useReactTable({
    data,
    columns: memoizedColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      if (onRowSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => {
            const row = table.getRow(key);
            return row?.original;
          })
          .filter(Boolean) as TData[];
        onRowSelectionChange(selectedRows);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    manualPagination: true, // Server-side pagination
  });

  const hasToolbar = filterColumn || showColumnVisibility || toolbar;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: filter input + column visibility + custom slot */}
      {hasToolbar && (
        <div className="flex items-center gap-2">
          {filterColumn && (
            <Input
              placeholder={filterPlaceholder ?? `Filter…`}
              value={
                (table.getColumn(filterColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(e) =>
                table.getColumn(filterColumn)?.setFilterValue(e.target.value)
              }
              className="max-w-sm"
            />
          )}

          {/* Custom toolbar controls passed by the parent */}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}

          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border">
        <TableLoaderOverlay show={isSoftLoading} />
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Server-side pagination */}
      {pagination && (
        <DataTablePagination
          meta={pagination.meta}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          isLoading={pagination.isLoading}
        />
      )}
    </div>
  );
}
