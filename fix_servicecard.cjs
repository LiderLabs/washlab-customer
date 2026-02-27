const fs = require("fs");

const newCard = `"use client"

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

const SERVICE_IMAGES: Record<string, string> = {
  wash_and_dry: '/laundry-hero-1.jpg',
  wash_only: '/stacked-clothes.jpg',
  dry_only: '/laundry-hero-2.jpg',
};

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
  price?: string;
  code?: string;
}

export const ServiceCard = ({
  icon: Icon,
  title,
  description,
  isSelected,
  onClick,
  price,
  code,
}: ServiceCardProps) => {
  const image = code ? SERVICE_IMAGES[code] : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative rounded-2xl border-2 transition-all duration-300 text-left w-full overflow-hidden',
        'hover:shadow-lg hover:-translate-y-1',
        isSelected
          ? 'border-primary shadow-glow'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      {image ? (
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center m-6 mb-0 transition-all duration-300',
          isSelected
            ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}>
          <Icon className="w-7 h-7" />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>

        {price && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-primary font-semibold">{price}</span>
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
`;

fs.writeFileSync("components/ServiceCard.tsx", newCard, "utf8");
console.log("Done");
