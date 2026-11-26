import React from "react";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export function SobjiLogo({ className = "", light = false }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          light ? "bg-white text-[#16803c]" : "bg-[#16803c] text-white"
        }`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M14 22C14 14.5 18.5 9 23.5 8.5C23 14.5 19.2 19 14 19.5"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M14 22C14 15.5 10 11 5.5 10.5C6 15.5 9.5 19 14 19.5"
            fill="currentColor"
            fillOpacity="0.6"
          />
          <path
            d="M14 23V12.5"
            stroke={light ? "#16803c" : "#ffffff"}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span
            className={`text-xl font-extrabold tracking-tight ${
              light ? "text-white" : "text-[#16803c]"
            }`}
          >
            sobji
          </span>
          <span
            className={`text-sm font-bold ${
              light ? "text-emerald-200" : "text-[#18231c]"
            }`}
          >
            .com
          </span>
        </div>
        <span
          className={`text-[10px] font-medium ${
            light ? "text-emerald-100/80" : "text-[#5f6f64]"
          }`}
        >
          সবজি • Straight From Farm
        </span>
      </div>
    </div>
  );
}
