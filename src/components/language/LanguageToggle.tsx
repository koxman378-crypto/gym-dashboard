"use client";

import Image from "next/image";
import { useLanguage } from "./LanguageContext";

interface LanguageToggleProps {
  compact?: boolean;
}

export function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const options = [
    {
      value: "en",
      label: "English",
      img: "/en-1.png",
    },
    {
      value: "mm",
      label: "Myanmar",
      img: "/my.png",
    },
  ] as const;

  const buttonSizeClass = compact ? "h-8 w-8" : "h-9 w-9";
  const imageSize = compact ? 35 : 28;

  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label="Toggle language"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLang(option.value)}
          aria-pressed={lang === option.value}
          title={option.label}
          className="p-0 ml-1 cursor-pointer opacity-70 hover:opacity-100 active:opacity-100 focus:opacity-100 bg-transparent border-none outline-none"
          style={{ boxShadow: "none", border: "none", background: "none" }}
        >
          <Image
            src={option.img}
            alt={option.label}
            width={imageSize}
            height={imageSize}
            className="object-cover"
            priority={false}
          />
        </button>
      ))}
    </div>
  );
}
