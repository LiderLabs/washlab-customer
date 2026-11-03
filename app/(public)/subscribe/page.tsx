'use client';

import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import SubscriptionPlans from '@/components/customer/SubscriptionPlans';
import { SubscriptionHistory } from '@/components/SubscriptionHistory';
import { useSubscriptionFlyer, type PromoImage } from '@/components/SubscriptionFlyerSlide';

const SLIDE_MS = 5000;

/** Promo images shown whole (not cropped), auto-advancing with dots and swipe. Shown until a campus is picked. */
function PromoCarousel({ images }: { images: PromoImage[] }) {
  const n = images.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, n, paused]);

  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <div className="max-w-md mx-auto lg:mx-0">
      <div
        className="relative rounded-3xl overflow-hidden border border-border shadow-lg bg-card"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
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
        {images.map((img, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={img.url}
            alt={img.title ?? 'WashLab subscription packages'}
            draggable={false}
            className={`w-full h-auto block transition-opacity duration-500 ${
              k === i ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          />
        ))}
        {n > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {images.map((_, k) => (
              <button
                key={k}
                aria-label={`Image ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-primary' : 'w-2 bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscribePage() {
  const images = useSubscriptionFlyer(); // null = none uploaded (or still loading)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 md:pt-44 pb-16 max-w-5xl space-y-12">
        <SubscriptionPlans
          id="plans"
          heading="Wash more, pay less"
          promo={images ? <PromoCarousel images={images} /> : undefined}
        />

        {/* signed-in customers: their packages, purchase times, washes left and usage log */}
        <SubscriptionHistory />
      </main>
    </div>
  );
}
