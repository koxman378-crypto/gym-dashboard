"use client";

import { useReducer, useRef, useEffect, UIEvent } from "react";

// ─── State ────────────────────────────────────────────────────────────────────

export type AnimatedListState<T> = {
  selectedIndex: number;
  keyboardNav: boolean;
  topGradientOpacity: number;
  bottomGradientOpacity: number;
  pendingDelete: T | null;
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export type AnimatedListAction<T> =
  | { type: "navigateDown"; payload: number } // payload = items.length
  | { type: "navigateUp" }
  | { type: "clearKeyboardNav" }
  | { type: "selectIndex"; payload: number }
  | { type: "setTopGradient"; payload: number }
  | { type: "setBottomGradient"; payload: number }
  | { type: "setPendingDelete"; payload: T | null };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function animatedListReducer<T>(
  state: AnimatedListState<T>,
  action: AnimatedListAction<T>,
): AnimatedListState<T> {
  switch (action.type) {
    case "navigateDown":
      return {
        ...state,
        keyboardNav: true,
        selectedIndex: Math.min(state.selectedIndex + 1, action.payload - 1),
      };
    case "navigateUp":
      return {
        ...state,
        keyboardNav: true,
        selectedIndex: Math.max(state.selectedIndex - 1, 0),
      };
    case "clearKeyboardNav":
      return { ...state, keyboardNav: false };
    case "selectIndex":
      return { ...state, selectedIndex: action.payload };
    case "setTopGradient":
      return { ...state, topGradientOpacity: action.payload };
    case "setBottomGradient":
      return { ...state, bottomGradientOpacity: action.payload };
    case "setPendingDelete":
      return { ...state, pendingDelete: action.payload };
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnimatedListState<T>(itemsLength: number) {
  const listRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(
    (s: AnimatedListState<T>, a: AnimatedListAction<T>) =>
      animatedListReducer<T>(s, a),
    {
      selectedIndex: -1,
      keyboardNav: false,
      topGradientOpacity: 0,
      bottomGradientOpacity: 1,
      pendingDelete: null as T | null,
    },
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        dispatch({ type: "navigateDown", payload: itemsLength });
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        dispatch({ type: "navigateUp" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemsLength]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!state.keyboardNav || state.selectedIndex < 0 || !listRef.current)
      return;
    const container = listRef.current;
    const el = container.querySelector(
      `[data-index="${state.selectedIndex}"]`,
    ) as HTMLElement | null;
    if (el) {
      const extra = 50;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      const cTop = container.scrollTop;
      const cH = container.clientHeight;
      if (top < cTop + extra)
        container.scrollTo({ top: top - extra, behavior: "smooth" });
      else if (bottom > cTop + cH - extra)
        container.scrollTo({ top: bottom - cH + extra, behavior: "smooth" });
    }
    const t = window.setTimeout(
      () => dispatch({ type: "clearKeyboardNav" }),
      0,
    );
    return () => window.clearTimeout(t);
  }, [state.selectedIndex, state.keyboardNav]);

  // Scroll gradient handler — attach to the scrollable div's onScroll
  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    dispatch({
      type: "setTopGradient",
      payload: Math.min(scrollTop / 50, 1),
    });
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    dispatch({
      type: "setBottomGradient",
      payload:
        scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    });
  }

  return { listRef, state, dispatch, handleScroll };
}
