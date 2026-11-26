import React from "react";

interface ProduceArtworkProps {
  visualKey: string;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}

const fallbackImageByKey: Record<string, string> = {
  tomato: "/images/products/tomato.jpg",
  potato: "/images/products/potato.jpg",
  brinjal: "/images/products/brinjal.jpg",
  gourd: "/images/products/gourd.jpg",
  spinach: "/images/products/palong-shak.jpg",
  chilli: "/images/products/kacha-morich.jpg",
  onion: "/images/products/onion.jpg",
  garlic: "/images/products/garlic.jpg",
  coriander: "/images/products/dhonepata.jpg",
  mango: "/images/products/mango.jpg",
  banana: "/images/products/banana.jpg",
  fish: "/images/products/rui-fish.jpg",
  chicken: "/images/products/sonali-chicken.jpg",
  egg: "/images/products/brown-eggs.jpg",
  turmeric: "/images/products/turmeric.jpg",
  "mustard-oil": "/images/products/mustard-oil.jpg",
  lentils: "/images/products/moshur-dal.jpg",
  "ready-mix": "/images/products/mix-bhaji.jpg",
};

export function ProduceArtwork({
  visualKey,
  imageUrl,
  alt = "Fresh farm produce",
  className = "h-full w-full",
}: ProduceArtworkProps) {
  const src = imageUrl || fallbackImageByKey[visualKey] || "/images/hero-basket.jpg";

  return (
    <div className={`relative overflow-hidden bg-[#f5f3ee] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
    </div>
  );
}
