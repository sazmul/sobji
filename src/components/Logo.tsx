import React from "react";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export function SobjiLogo({ className = "", light = false }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M16 27C16 17.5 21.5 10.5 28 9.5C27.5 17 22.5 22.5 16 23.5"
          fill={light ? "#86efac" : "#1b8e3d"}
        />
        <path
          d="M16 27C16 18.5 11 13 5 12C5.5 18.5 10 23 16 24"
          fill={light ? "#4ade80" : "#5cb85c"}
        />
        <path
          d="M16 28V15"
          stroke={light ? "#ffffff" : "#0f5123"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span
            className={`text-[22px] font-extrabold tracking-tight ${
              light ? "text-white" : "text-[#1b8e3d]"
            }`}
          >
            sobji
          </span>
          <span
            className={`text-sm font-bold ${
              light ? "text-emerald-200" : "text-[#222222]"
            }`}
          >
            .com
          </span>
        </div>
        <span
          className={`text-[10px] font-medium ${
            light ? "text-neutral-300" : "text-[#666666]"
          }`}
        >
          সবজি • Fresh From Farm
        </span>
      </div>
    </div>
  );
}
