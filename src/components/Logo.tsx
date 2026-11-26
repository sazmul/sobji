import React from "react";

interface LogoProps {
  className?: string;
  showBangla?: boolean;
  light?: boolean;
}

export function SobjiLogo({ className = "", showBangla = true, light = false }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14532d] via-[#166534] to-[#22c55e] shadow-sm ring-1 ring-black/5">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          aria-hidden="true"
        >
          {/* Woven basket base */}
          <path
            d="M7 18.5C7 17.6716 7.67157 17 8.5 17H27.5C28.3284 17 29 17.6716 29 18.5L26.8 26.8C26.44 28.15 25.22 29 23.82 29H12.18C10.78 29 9.56 28.15 9.2 26.8L7 18.5Z"
            fill="#FEF3C7"
            fillOpacity="0.95"
          />
          <path
            d="M11 21H25M12.5 25H23.5"
            stroke="#D97706"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Fresh leaf sprouting from basket */}
          <path
            d="M18 17C18 11.5 22.5 7.5 28 7.5C28 13 23.8 17 18 17Z"
            fill="#86EFAC"
          />
          <path
            d="M18 17C18 12.2 14.2 8.5 9.5 8.5C9.5 13.3 13.2 17 18 17Z"
            fill="#BBF7D0"
          />
          <path
            d="M18 17V10.5"
            stroke="#14532D"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#f59e0b] ring-2 ring-[#faf8f3]" />
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-xl font-extrabold tracking-tight ${
              light ? "text-white" : "text-[#111c16]"
            }`}
          >
            sobji
          </span>
          <span
            className={`text-sm font-bold ${
              light ? "text-[#86efac]" : "text-[#16a34a]"
            }`}
          >
            .com
          </span>
        </div>
        {showBangla && (
          <span
            className={`text-[10px] font-medium tracking-wide ${
              light ? "text-emerald-200/80" : "text-[#526559]"
            }`}
          >
            সবজি • Farm Fresh Bazar
          </span>
        )}
      </div>
    </div>
  );
}
