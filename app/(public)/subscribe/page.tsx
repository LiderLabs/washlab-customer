'use client';

import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import SubscriptionPlans from '@/components/customer/SubscriptionPlans';
import { SubscriptionHistory } from '@/components/SubscriptionHistory';
import { useSubscriptionFlyer, type PromoImage } from '@/components/SubscriptionFlyerSlide';
import { Button } from '@/components/ui/button';
import { Repeat, ArrowDown } from 'lucide-react';

const SLIDE_MS = 5000;

/** Several promo images, shown whole (not cropped), auto-advancing with dots and swipe. */
function PromoCarousel({ images, onBuy }: { images: PromoImage[]; onBuy: () => void }) {
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
    <div className="max-w-md mx-auto space-y-4">
      <style>{`
        @keyframes wl-pop {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5); }
          50% { transform: scale(1.03); box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
        }
        .wl-pop { animation: wl-pop 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .wl-pop { animation: none; } }
      `}</style>
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
        {/* the current image sets the height; others fade over it */}
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
      <Button size="lg" className="wl-pop w-full h-14 text-base font-bold rounded-2xl gap-2" onClick={onBuy}>
        Buy now <ArrowDown className="w-5 h-5" />
      </Button>
    </div>
  );
}

export default function SubscribePage() {
  const images = useSubscriptionFlyer(); // null = none uploaded (or still loading)
  const plansRef = useRef<HTMLDivElement>(null);
  const [plansVisible, setPlansVisible] = useState(false);

  useEffect(() => {
    const el = plansRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setPlansVisible(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollToPlans = () => plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 md:pt-28 pb-28 md:pb-16 max-w-3xl space-y-8">
        {images ? (
          <PromoCarousel images={images} onBuy={scrollToPlans} />
        ) : (
          <div className="text-center space-y-3 py-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Repeat className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Wash more, pay less</h1>
            <p className="text-muted-foreground">Subscribe to a WashLab student laundry package.</p>
          </div>
        )}

        <div ref={plansRef}>
          <SubscriptionPlans id="plans" />
        </div>

        {/* signed-in customers: their packages, purchase times, washes left and usage log */}
        <SubscriptionHistory />
      </main>

      {/* mobile sticky Buy now */}
      {!plansVisible && images && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur border-t border-border">
          <Button size="lg" className="wl-pop w-full h-12 font-bold rounded-xl" onClick={scrollToPlans}>Buy now</Button>
        </div>
      )}
    </div>
  );
}
