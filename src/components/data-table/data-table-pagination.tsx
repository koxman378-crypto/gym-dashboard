"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { DataTablePaginationProps } from "@/src/types/table";

export function DataTablePagination({
  meta,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  tone = "default",
}: DataTablePaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const isLightTone = tone === "light";

  return (
    <div className="flex items-center justify-between px-2">
      <div
        className={cn(
          "flex-1 text-sm text-muted-foreground",
          isLightTone && "text-muted-foreground",
        )}
      >
        Showing {total > 0 ? startItem : 0} to {endItem} of {total} results
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p
            className={cn(
              "text-sm font-medium",
              isLightTone && "text-foreground",
            )}
          >
            Rows per page
          </p>
          <Select
            value={`${limit}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
            disabled={isLoading}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-[70px]",
                isLightTone &&
                  "border-border bg-background text-foreground hover:border-ring focus:border-ring focus:ring-ring/20",
              )}
            >
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent
              side="top"
              className={cn(
                isLightTone &&
                  "border-border bg-background text-foreground shadow-xl ring-ring/20",
              )}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className={cn(
                    isLightTone &&
                      "text-foreground focus:bg-muted hover:bg-muted",
                  )}
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          className={cn(
            "flex w-[100px] items-center justify-center text-sm font-medium",
            isLightTone && "text-foreground",
          )}
        >
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className={cn(
              "hidden h-8 w-8 p-0 lg:flex",
              isLightTone &&
                "border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => onPageChange(Math.max(1, page - 5))}
            disabled={page === 1 || isLoading}
          >
            <span className="sr-only">Go back 5 pages</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className={cn(
              "h-8 w-8 p-0",
              isLightTone &&
                "border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className={cn(
              "h-8 w-8 p-0",
              isLightTone &&
                "border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className={cn(
              "hidden h-8 w-8 p-0 lg:flex",
              isLightTone &&
                "border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={() => onPageChange(Math.min(totalPages, page + 5))}
            disabled={page === totalPages || isLoading}
          >
            <span className="sr-only">Go forward 5 pages</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
