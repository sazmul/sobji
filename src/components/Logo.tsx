import React from "react";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export function SobjiLogo({ className = "", light = false }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 shrink-0"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="8"
          fill={light ? "#ffffff" : "#143624"}
        />
        <path
          d="M16 23C16 15.5 20.5 10 25 9.5C24.5 15 20.8 19.5 16 20"
          fill={light ? "#143624" : "#d9e4d7"}
        />
        <path
          d="M16 23C16 16.5 12 12 7.5 11.5C8 16.5 11.5 20 16 20.5"
          fill={light ? "#2f6a4a" : "#8eb392"}
        />
        <path
          d="M16 24V14.5"
          stroke={light ? "#143624" : "#ffffff"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span
          className={`font-display text-2xl font-semibold tracking-tight ${
            light ? "text-white" : "text-[#112218]"
          }`}
        >
          sobji<span className={light ? "text-[#a7c4a5]" : "text-[#a14a18]"}>.com</span>
        </span>
        <span
          className={`text-[9.5px] font-medium uppercase tracking-[0.18em] ${
            light ? "text-stone-300/80" : "text-[#5b695f]"
          }`}
        >
          Dhaka Farm Bazar
        </span>
      </div>
    </div>
  );
}
