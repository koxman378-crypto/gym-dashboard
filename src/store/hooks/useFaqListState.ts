import { useReducer, UIEvent } from "react";

interface FaqListState {
  selectedIndex: number;
  keyboardNav: boolean;
  topGradientOpacity: number;
  bottomGradientOpacity: number;
}

type FaqListAction =
  | { type: "SET_SELECTED"; index: number }
  | { type: "SET_KEYBOARD_NAV"; value: boolean }
  | { type: "SCROLL"; topOpacity: number; bottomOpacity: number }
  | { type: "MOVE_UP"; maxIndex: number }
  | { type: "MOVE_DOWN"; maxIndex: number };

const initialState: FaqListState = {
  selectedIndex: -1,
  keyboardNav: false,
  topGradientOpacity: 0,
  bottomGradientOpacity: 1,
};

function faqListReducer(
  state: FaqListState,
  action: FaqListAction,
): FaqListState {
  switch (action.type) {
    case "SET_SELECTED":
      return { ...state, selectedIndex: action.index };
    case "SET_KEYBOARD_NAV":
      return { ...state, keyboardNav: action.value };
    case "SCROLL":
      return {
        ...state,
        topGradientOpacity: action.topOpacity,
        bottomGradientOpacity: action.bottomOpacity,
      };
    case "MOVE_DOWN":
      return {
        ...state,
        keyboardNav: true,
        selectedIndex: Math.min(state.selectedIndex + 1, action.maxIndex),
      };
    case "MOVE_UP":
      return {
        ...state,
        keyboardNav: true,
        selectedIndex: Math.max(state.selectedIndex - 1, 0),
      };
    default:
      return state;
  }
}

export function useFaqListState() {
  const [state, dispatch] = useReducer(faqListReducer, initialState);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    const topOpacity = Math.min(scrollTop / 50, 1);
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    const bottomOpacity =
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1);
    dispatch({ type: "SCROLL", topOpacity, bottomOpacity });
  };

  const setSelectedIndex = (index: number) =>
    dispatch({ type: "SET_SELECTED", index });

  const setKeyboardNav = (value: boolean) =>
    dispatch({ type: "SET_KEYBOARD_NAV", value });

  const moveDown = (maxIndex: number) =>
    dispatch({ type: "MOVE_DOWN", maxIndex });

  const moveUp = (maxIndex: number) =>
    dispatch({ type: "MOVE_UP", maxIndex });

  return {
    ...state,
    handleScroll,
    setSelectedIndex,
    setKeyboardNav,
    moveDown,
    moveUp,
  };
}
