"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import translations, { type Lang } from "@/src/lib/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (path) => path,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("gym-lang");
    if (stored === "en" || stored === "mm") {
      setLangState(stored);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("gym-lang", newLang);
  };

  // traverses nested dot-path like "gymPrices.title"
  const t = (path: string): string => {
    const keys = path.split(".");
    let node: any = translations;
    for (const key of keys) {
      if (node == null || typeof node !== "object" || !(key in node))
        return path;
      node = node[key];
    }
    if (node && typeof node === "object" && lang in node) {
      return node[lang] as string;
    }
    return path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
