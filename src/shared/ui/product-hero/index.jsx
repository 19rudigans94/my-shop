import Image from "next/image";

export default function ProductHero({ image, title, badges = [] }) {
  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover brightness-50"
          sizes="100vw"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-800/80 text-white rounded-full text-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
