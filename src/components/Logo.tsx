import React from "react";

interface LogoProps {
  className?: string;
  light?: boolean;
  compactOnMobile?: boolean;
}

export function SobjiLogo({
  className = "",
  light = false,
  compactOnMobile = false,
}: LogoProps) {
  return (
    <div
      className={`inline-flex items-center ${
        compactOnMobile ? "gap-2 sm:gap-2.5" : "gap-2.5"
      } select-none ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        aria-hidden="true"
        className={`${
          compactOnMobile ? "h-8 w-8 sm:h-10 sm:w-10" : "h-10 w-10"
        } shrink-0 drop-shadow-[0_1px_2px_rgba(15,123,63,0.18)]`}
      >
        <defs>
          <linearGradient id="sobjiLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#095228" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="28" fill="url(#sobjiLogoBg)" />
        <path
          d="M58 53 C44 50 35 40 35 27 C47 27 56 37 58 53 Z"
          fill="#bef264"
        />
        <path
          d="M62 53 C64 35 76 22 91 22 C91 39 78 51 62 53 Z"
          fill="#ffffff"
        />
        <circle cx="44" cy="46" r="10.5" fill="#0e6b34" />
        <circle cx="44" cy="46" r="8" fill="#fb923c" />
        <rect x="24" y="54" width="72" height="9" rx="4.5" fill="#ffffff" />
        <path
          d="M30 66 L90 66 L83.5 87.5 C82.5 92 78.5 94.5 74 94.5 L46 94.5 C41.5 94.5 37.5 92 36.5 87.5 Z"
          fill="#ffffff"
        />
        <rect x="45" y="73" width="5.5" height="14" rx="2.75" fill="#0c6430" />
        <rect x="57.25" y="73" width="5.5" height="14" rx="2.75" fill="#0c6430" />
        <rect x="69.5" y="73" width="5.5" height="14" rx="2.75" fill="#0c6430" />
      </svg>

      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span
            className={`${
              compactOnMobile ? "text-[19px] sm:text-[22px]" : "text-[22px]"
            } font-bold tracking-[-0.035em] ${
              light ? "text-white" : "text-[#111827]"
            }`}
          >
            sobji
          </span>
          <span
            className={`${
              compactOnMobile ? "text-[13px] sm:text-[15px]" : "text-[15px]"
            } font-semibold tracking-tight ${
              light ? "text-emerald-300" : "text-[#0f7b3f]"
            }`}
          >
            .com
          </span>
        </div>
        <span
          className={`${
            compactOnMobile ? "hidden sm:block" : "block"
          } mt-0.5 text-[10px] font-semibold uppercase tracking-[0.11em] ${
            light ? "text-emerald-200/80" : "text-gray-500"
          }`}
        >
          Fresh Farm Bazar
        </span>
      </div>
    </div>
  );
}
