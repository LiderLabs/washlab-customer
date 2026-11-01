'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';

export interface PromoImage {
  id: string;
  url: string;
  title?: string;
}

/** Active promo images in the admin's order, or null while loading / when there are none. */
export function useSubscriptionFlyer(): PromoImage[] | null {
  const images: PromoImage[] | undefined = useQuery((api as any).subscriptions.getPromoImages);
  return images && images.length > 0 ? images : null;
}

const SLIDE_MS = 4000;

/**
 * Fills the phone screen: promo images (fitted, never cropped, over a blurred copy of
 * themselves) with a pulsing Buy now button. Several images auto-advance, swipe and have dots.
 * `active` = this slide is the one showing in the phone; the carousel restarts at image 1.
 */
export function SubscriptionFlyerSlide({ flyer, active = true }: { flyer: PromoImage[]; active?: boolean }) {
  const n = flyer.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => { if (active) setI(0); }, [active]);
  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    if (!active || paused || n < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, n, paused, active]);

  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <div
      className="h-full flex flex-col"
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (startX.current !== null) {
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }
        startX.current = null;
        setTimeout(() => setPaused(false), 8000);
      }}
    >
      <style>{`
        @keyframes wl-pop {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 hsl(var(--primary) / 0.55); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
        }
        .wl-pop { animation: wl-pop 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .wl-pop { animation: none; } }
      `}</style>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {flyer.map((img, k) => (
          <div key={img.id} className={`absolute inset-0 transition-opacity duration-500 ${k === i ? 'opacity-100' : 'opacity-0'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.title ?? 'WashLab subscription offer'} draggable={false} className="relative w-full h-full object-contain" />
          </div>
        ))}
        {n > 1 && (
          <div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1.5">
            {flyer.map((_, k) => (
              <button
                key={k}
                aria-label={`Image ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-primary' : 'w-1.5 bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pt-3 pb-6 bg-background">
        <Link
          href="/subscribe"
          className="wl-pop block w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold text-center"
        >
          Buy now
        </Link>
      </div>
    </div>
  );
}
