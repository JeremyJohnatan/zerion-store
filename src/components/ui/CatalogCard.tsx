import React from 'react';
import Link from 'next/link';

interface CatalogCardProps {
  gameName: string;
  category: string;
  title: string;
  price: number;
  imageUrl?: string;
  href: string;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({
  gameName,
  category,
  title,
  price,
  imageUrl,
  href,
}) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div className="group relative w-full flex flex-col bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Image Area */}
      <div className="h-52 w-full relative overflow-hidden shrink-0 border-b-2 border-black bg-zinc-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-zinc-400 text-sm tracking-widest uppercase">
              No Image
            </span>
          </div>
        )}

        {/* Category Badge — Japan Brutalist pill */}
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-[#c8ff00] text-black border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
          {gameName}
        </p>
        <h3 className="text-lg font-black leading-snug text-black uppercase line-clamp-2">
          {title}
        </h3>

        {/* Price & CTA */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t-2 border-dashed border-zinc-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Mulai
            </span>
            <span className="text-xl font-black text-black tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <Link
            href={href}
            className="flex items-center justify-center px-5 h-10 bg-black text-white border-2 border-black rounded-sm font-extrabold uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#a1a1aa] transition-all duration-150 hover:bg-[#c8ff00] hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
          >
            Order →
          </Link>
        </div>
      </div>
    </div>
  );
};
