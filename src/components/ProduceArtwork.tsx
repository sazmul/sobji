import React from "react";
import Image from "next/image";

interface ProduceArtworkProps {
  visualKey: string;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  priority?: boolean;
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
  okra: "/images/products/okra.jpg",
  cauliflower: "/images/products/cauliflower.jpg",
  cucumber: "/images/products/cucumber.jpg",
  pumpkin: "/images/products/pumpkin.jpg",
  "pui-shak": "/images/products/pui-shak.jpg",
  potol: "/images/products/potol.jpg",
  coconut: "/images/products/green-coconut.jpg",
  guava: "/images/products/guava.jpg",
  papaya: "/images/products/papaya.jpg",
  prawns: "/images/products/chingri.jpg",
  ilish: "/images/products/ilish-fish.jpg",
  ginger: "/images/products/ginger.jpg",
};

export function ProduceArtwork({
  visualKey,
  imageUrl,
  alt = "Fresh farm produce",
  className = "h-full w-full",
  priority = false,
}: ProduceArtworkProps) {
  const src = imageUrl || fallbackImageByKey[visualKey] || "/images/hero-basket.jpg";

  return (
    <div className={`relative overflow-hidden bg-[#f5f3ee] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
    </div>
  );
}
