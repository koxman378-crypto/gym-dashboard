import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";

export type { SortingState, ColumnFiltersState, VisibilityState };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
  tone?: "default" | "light";
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  isSoftLoading?: boolean;
  pagination?: {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    isLoading?: boolean;
  };
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  emptyMessage?: string;
  getRowId?: (row: TData) => string;
  // Filtering
  filterColumn?: string;
  filterPlaceholder?: string;
  // Column visibility toggle
  showColumnVisibility?: boolean;
  // Toolbar slot for extra controls (search inputs, buttons, etc.)
  toolbar?: React.ReactNode;
  tableWrapperClassName?: string;
  tableContainerClassName?: string;
  tableHeaderClassName?: string;
  paginationTone?: "default" | "light";
}
