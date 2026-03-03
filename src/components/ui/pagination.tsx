import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/src/components/layout/paginationControll";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
};

function range(from: number, to: number) {
  const r: number[] = [];
  for (let i = from; i <= to; i++) r.push(i);
  return r;
}

export default function PaginationUI({
  page,
  totalPages,
  onPageChange,
}: Props) {
  const current = Math.max(1, Math.min(page, totalPages || 1));

  // Show up to 5 page numbers (including first and last). Use ellipses when skipping.
  const maxVisible = 5;
  const pages: (number | "...")[] = [];

  if (totalPages <= maxVisible) {
    // small number of pages — show them all
    for (const p of range(1, totalPages)) pages.push(p);
  } else {
    const middleCount = maxVisible - 2; // reserve for first and last
    let start = current - Math.floor(middleCount / 2);
    let end = start + middleCount - 1;

    if (start < 2) {
      start = 2;
      end = start + middleCount - 1;
    }
    if (end > totalPages - 1) {
      end = totalPages - 1;
      start = end - (middleCount - 1);
    }

    pages.push(1);
    if (start > 2) pages.push("...");
    for (const p of range(start, end)) pages.push(p);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  function goto(p: number) {
    if (p < 1 || p > totalPages || p === current) return;
    onPageChange(p);
  }

  const currentIndex = pages.findIndex((x) => x === current);

  return (
    <Pagination aria-label="Pagination" className="w-full">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              goto(current - 1);
            }}
            aria-disabled={current <= 1}
          />
        </PaginationItem>

        {pages.map((p, idx) => (
          <PaginationItem key={String(p) + idx}>
            {p === "..." ? (
              <PaginationEllipsis
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  // If ellipsis is left of current, jump back by 5 pages; otherwise jump forward by 5
                  const isLeft =
                    currentIndex >= 0 ? idx < currentIndex : idx === 1;
                  const target = isLeft
                    ? Math.max(1, current - 5)
                    : Math.min(totalPages, current + 5);
                  goto(target);
                }}
                className="cursor-pointer"
              />
            ) : (
              <PaginationLink
                href="#"
                isActive={p === current}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  goto(p as number);
                }}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              goto(current + 1);
            }}
            aria-disabled={current >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
