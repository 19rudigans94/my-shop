"use client";

import Image from "next/image";
import { Share2, Check } from "lucide-react";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs/index.jsx";

export default function ProductHero({
  title,
  mainImageSrc,
  blurDataURL,
  breadcrumbs = [],
  badges,
  price,
  onShare,
  copied,
}) {
  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[65vh]">
      <div className="absolute inset-0">
        <Image
          src={mainImageSrc || "/images/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          {...(blurDataURL ? { placeholder: "blur", blurDataURL } : {})}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/40 to-transparent" />

      {breadcrumbs.length > 0 && (
        <div className="absolute top-4 left-0 right-0 px-4 md:px-8">
          <div className="container mx-auto">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
        <div className="container mx-auto">
          {badges && <div className="flex flex-wrap items-center gap-2 mb-3">{badges}</div>}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-3">
            {price != null && price > 0 && (
              <span className="text-2xl md:text-3xl font-bold text-amber-400">
                {Number(price).toLocaleString("ru-RU")} ₸
              </span>
            )}
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs transition-colors backdrop-blur-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Скопировано" : "Поделиться"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
