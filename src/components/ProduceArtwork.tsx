import React from "react";

interface ProduceArtworkProps {
  visualKey: string;
  className?: string;
}

const bgPalettes: Record<string, string> = {
  tomato: "from-rose-50 via-red-50 to-amber-50",
  potato: "from-amber-50 via-orange-50 to-yellow-50",
  brinjal: "from-purple-50 via-fuchsia-50 to-emerald-50",
  gourd: "from-emerald-50 via-lime-50 to-teal-50",
  spinach: "from-rose-50 via-emerald-50 to-green-100",
  chilli: "from-lime-50 via-emerald-50 to-yellow-50",
  onion: "from-rose-50 via-purple-50 to-orange-50",
  garlic: "from-stone-50 via-amber-50 to-cream-50",
  okra: "from-green-50 via-lime-50 to-emerald-50",
  "bitter-gourd": "from-lime-50 via-green-50 to-teal-50",
  cauliflower: "from-emerald-50 via-stone-50 to-lime-50",
  cucumber: "from-teal-50 via-emerald-50 to-lime-50",
  coriander: "from-emerald-50 via-green-50 to-lime-50",
  mango: "from-amber-50 via-yellow-50 to-orange-100",
  banana: "from-yellow-50 via-amber-50 to-lime-50",
  guava: "from-lime-50 via-emerald-50 to-rose-50",
  papaya: "from-orange-50 via-amber-50 to-lime-50",
  fish: "from-sky-50 via-cyan-50 to-slate-100",
  chicken: "from-orange-50 via-amber-50 to-rose-50",
  egg: "from-amber-50 via-stone-50 to-orange-50",
  turmeric: "from-yellow-50 via-amber-100 to-orange-50",
  "mustard-oil": "from-amber-50 via-yellow-100 to-orange-50",
  lentils: "from-orange-50 via-red-50 to-amber-50",
  "ready-mix": "from-emerald-50 via-amber-50 to-lime-50",
};

export function ProduceArtwork({ visualKey, className = "h-full w-full" }: ProduceArtworkProps) {
  const gradient = bgPalettes[visualKey] ?? "from-emerald-50 via-lime-50 to-amber-50";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      {/* Soft organic backdrop halo */}
      <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-white/60 blur-2xl" />
      <svg
        viewBox="0 0 160 140"
        className="relative z-10 h-[78%] w-[78%] drop-shadow-[0_10px_14px_rgba(20,83,45,0.12)] transition-transform duration-300 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {renderMotif(visualKey)}
      </svg>
    </div>
  );
}

function renderMotif(key: string) {
  switch (key) {
    case "tomato":
      return (
        <>
          <ellipse cx="80" cy="116" rx="46" ry="8" fill="#14532D" fillOpacity="0.1" />
          <circle cx="62" cy="80" r="30" fill="url(#tomA)" />
          <circle cx="102" cy="74" r="32" fill="url(#tomB)" />
          <ellipse cx="52" cy="68" rx="8" ry="5" transform="rotate(-25 52 68)" fill="#FFF" fillOpacity="0.35" />
          <ellipse cx="90" cy="60" rx="9" ry="5" transform="rotate(-25 90 60)" fill="#FFF" fillOpacity="0.35" />
          <path d="M58 50C54 44 46 44 44 49C50 51 54 52 58 50Z" fill="#15803D" />
          <path d="M62 51C62 42 66 38 69 40C68 46 66 49 62 51Z" fill="#16A34A" />
          <path d="M98 44C93 37 84 38 82 43C89 45 94 46 98 44Z" fill="#15803D" />
          <path d="M103 44C106 36 114 36 117 41C111 44 107 45 103 44Z" fill="#16A34A" />
          <defs>
            <radialGradient id="tomA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(52 66) rotate(45) scale(45)">
              <stop stopColor="#FF6B57" />
              <stop offset="1" stopColor="#C81E1E" />
            </radialGradient>
            <radialGradient id="tomB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(92 58) rotate(45) scale(48)">
              <stop stopColor="#FB7185" />
              <stop offset="1" stopColor="#DC2626" />
            </radialGradient>
          </defs>
        </>
      );
    case "potato":
      return (
        <>
          <ellipse cx="80" cy="116" rx="48" ry="8" fill="#78350F" fillOpacity="0.12" />
          <ellipse cx="64" cy="84" rx="34" ry="24" transform="rotate(-12 64 84)" fill="#D9A05B" />
          <ellipse cx="102" cy="70" rx="32" ry="23" transform="rotate(14 102 70)" fill="#E3B374" />
          <ellipse cx="82" cy="94" rx="28" ry="20" fill="#C98A46" />
          <circle cx="52" cy="80" r="2.2" fill="#92400E" fillOpacity="0.45" />
          <circle cx="72" cy="90" r="1.8" fill="#92400E" fillOpacity="0.45" />
          <circle cx="108" cy="66" r="2" fill="#92400E" fillOpacity="0.45" />
          <ellipse cx="96" cy="58" rx="10" ry="4" transform="rotate(10 96 58)" fill="#FFF" fillOpacity="0.25" />
        </>
      );
    case "brinjal":
      return (
        <>
          <ellipse cx="80" cy="118" rx="44" ry="8" fill="#3B0764" fillOpacity="0.12" />
          <path d="M56 42C72 34 94 46 102 72C109 94 98 112 78 112C58 112 46 92 48 68C49 54 50 45 56 42Z" fill="url(#brin)" />
          <path d="M98 54C112 50 124 62 122 82C120 100 106 112 92 108C78 104 78 86 84 68C88 58 92 56 98 54Z" fill="#581C87" />
          <path d="M52 44C54 34 64 28 74 34C69 41 64 46 58 48L52 44Z" fill="#15803D" />
          <path d="M62 32L66 20" stroke="#166534" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="64" cy="70" rx="6" ry="18" transform="rotate(-12 64 70)" fill="#FFF" fillOpacity="0.22" />
          <defs>
            <linearGradient id="brin" x1="50" y1="40" x2="96" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9333EA" />
              <stop offset="1" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
        </>
      );
    case "gourd":
      return (
        <>
          <ellipse cx="80" cy="118" rx="46" ry="8" fill="#14532D" fillOpacity="0.12" />
          <path d="M78 24C86 24 91 34 92 50C93 64 106 72 106 90C106 106 94 114 78 114C62 114 50 106 50 90C50 72 63 64 64 50C65 34 70 24 78 24Z" fill="url(#lau)" />
          <path d="M78 24V16" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="66" cy="86" rx="6" ry="15" fill="#FFF" fillOpacity="0.28" />
          <defs>
            <linearGradient id="lau" x1="55" y1="24" x2="105" y2="114" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A3E635" />
              <stop offset="1" stopColor="#4D7C0F" />
            </linearGradient>
          </defs>
        </>
      );
    case "spinach":
      return (
        <>
          <ellipse cx="80" cy="118" rx="44" ry="8" fill="#14532D" fillOpacity="0.12" />
          <path d="M78 110C68 86 42 74 42 52C42 36 56 26 68 38C76 46 78 68 78 110Z" fill="#BE123C" />
          <path d="M82 110C92 86 118 74 118 52C118 36 104 26 92 38C84 46 82 68 82 110Z" fill="#15803D" />
          <path d="M80 112C76 80 62 56 68 34C73 18 87 18 92 34C98 56 84 80 80 112Z" fill="#E11D48" />
          <path d="M80 112V36" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M62 96H98" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "chilli":
      return (
        <>
          <ellipse cx="80" cy="116" rx="44" ry="8" fill="#14532D" fillOpacity="0.1" />
          <path d="M44 46C58 46 72 64 78 92C80 102 72 108 66 102C54 88 42 68 40 54C39 48 41 46 44 46Z" fill="#16A34A" />
          <path d="M84 36C100 38 112 58 116 88C118 98 108 104 102 96C92 80 82 60 80 44C79 38 81 36 84 36Z" fill="#22C55E" />
          <path d="M64 56C78 52 94 70 98 98C100 108 90 112 84 104C74 88 64 72 60 62C59 58 61 57 64 56Z" fill="#15803D" />
          <path d="M42 46L36 36M82 36L78 24" stroke="#14532D" strokeWidth="3.5" strokeLinecap="round" />
        </>
      );
    case "onion":
      return (
        <>
          <ellipse cx="80" cy="116" rx="46" ry="8" fill="#881337" fillOpacity="0.12" />
          <path d="M64 36C66 44 86 54 88 78C90 98 76 110 60 110C44 110 34 96 36 78C38 56 58 44 60 36H64Z" fill="#9D174D" />
          <path d="M100 32C102 42 124 52 126 76C128 96 114 110 96 110C78 110 68 96 70 76C72 52 94 42 96 32H100Z" fill="#BE185D" />
          <path d="M86 58C80 72 80 94 88 106" stroke="#FBCFE8" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M108 58C114 72 114 94 106 106" stroke="#FBCFE8" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case "garlic":
      return (
        <>
          <ellipse cx="80" cy="116" rx="44" ry="8" fill="#78716C" fillOpacity="0.15" />
          <path d="M80 28C84 44 112 56 112 84C112 102 98 110 80 110C62 110 48 102 48 84C48 56 76 44 80 28Z" fill="#FAF5EE" stroke="#E7E0D3" strokeWidth="2" />
          <path d="M80 34C74 56 64 74 66 108M80 34C86 56 96 74 94 108" stroke="#DDD4C3" strokeWidth="2" />
        </>
      );
    case "fish":
      return (
        <>
          <ellipse cx="80" cy="114" rx="52" ry="8" fill="#0369A1" fillOpacity="0.12" />
          <path d="M26 72C46 42 96 38 124 64L142 46V98L124 80C96 106 46 102 26 72Z" fill="url(#fishGrad)" />
          <circle cx="48" cy="66" r="4.5" fill="#0F172A" />
          <circle cx="47" cy="65" r="1.5" fill="#FFF" />
          <path d="M72 52C82 64 82 80 72 92M90 50C100 64 100 80 90 94" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="fishGrad" x1="26" y1="50" x2="140" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#CBD5E1" />
              <stop offset="0.5" stopColor="#94A3B8" />
              <stop offset="1" stopColor="#64748B" />
            </linearGradient>
          </defs>
        </>
      );
    case "chicken":
      return (
        <>
          <ellipse cx="80" cy="116" rx="46" ry="8" fill="#9A3412" fillOpacity="0.12" />
          <path d="M46 68C46 48 68 38 88 44C108 50 116 74 102 94C90 110 64 110 52 94C46 86 46 78 46 68Z" fill="#FDBA74" />
          <path d="M100 72L124 84C130 87 128 96 120 94L96 84" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="3" />
          <ellipse cx="68" cy="64" rx="10" ry="6" transform="rotate(-20 68 64)" fill="#FFF" fillOpacity="0.35" />
        </>
      );
    case "egg":
      return (
        <>
          <ellipse cx="80" cy="116" rx="44" ry="8" fill="#78350F" fillOpacity="0.12" />
          <path d="M58 40C72 40 82 64 82 84C82 100 72 110 58 110C44 110 34 100 34 84C34 64 44 40 58 40Z" fill="#FDE68A" />
          <path d="M100 44C114 44 124 68 124 88C124 102 114 112 100 112C86 112 76 102 76 88C76 68 86 44 100 44Z" fill="#F59E0B" />
          <ellipse cx="50" cy="66" rx="5" ry="12" transform="rotate(-10 50 66)" fill="#FFF" fillOpacity="0.45" />
        </>
      );
    case "mango":
      return (
        <>
          <ellipse cx="80" cy="118" rx="44" ry="8" fill="#92400E" fillOpacity="0.12" />
          <path d="M84 30C106 30 120 52 112 80C104 104 82 114 66 108C50 102 46 82 54 60C60 44 70 30 84 30Z" fill="url(#mango)" />
          <path d="M84 30C84 22 92 18 102 22C96 28 90 30 84 30Z" fill="#15803D" />
          <defs>
            <linearGradient id="mango" x1="56" y1="30" x2="108" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FACC15" />
              <stop offset="0.6" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
          </defs>
        </>
      );
    case "banana":
      return (
        <>
          <ellipse cx="80" cy="116" rx="48" ry="8" fill="#713F12" fillOpacity="0.12" />
          <path d="M40 82C56 104 98 102 122 68C126 62 122 54 116 58C96 82 64 84 46 72C40 68 36 76 40 82Z" fill="#FACC15" />
          <path d="M46 66C62 88 104 86 126 52C128 46 124 40 118 44C98 68 68 70 50 58C44 54 42 62 46 66Z" fill="#FDE047" />
          <path d="M120 44L126 36" stroke="#713F12" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "turmeric":
    case "mustard-oil":
    case "lentils":
      return (
        <>
          <ellipse cx="80" cy="116" rx="46" ry="8" fill="#78350F" fillOpacity="0.12" />
          <path d="M36 74H124C122 98 104 112 80 112C56 112 38 98 36 74Z" fill="#78350F" />
          <ellipse cx="80" cy="74" rx="44" ry="12" fill={key === "lentils" ? "#EA580C" : key === "mustard-oil" ? "#EAB308" : "#F59E0B"} />
          <path d="M56 72C64 56 96 56 104 72" fill={key === "lentils" ? "#F97316" : "#FBBF24"} />
        </>
      );
    default:
      return (
        <>
          <ellipse cx="80" cy="116" rx="46" ry="8" fill="#14532D" fillOpacity="0.12" />
          <circle cx="80" cy="74" r="36" fill="url(#defGreen)" />
          <path d="M80 38C80 26 94 20 102 26C98 34 90 38 80 38Z" fill="#15803D" />
          <path d="M80 38C74 28 62 24 56 30C62 36 70 39 80 38Z" fill="#22C55E" />
          <ellipse cx="66" cy="60" rx="8" ry="5" transform="rotate(-25 66 60)" fill="#FFF" fillOpacity="0.3" />
          <defs>
            <radialGradient id="defGreen" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(68 60) rotate(45) scale(52)">
              <stop stopColor="#4ADE80" />
              <stop offset="1" stopColor="#15803D" />
            </radialGradient>
          </defs>
        </>
      );
  }
}
