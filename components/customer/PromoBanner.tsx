'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSubscriptionFlyer } from '@/components/SubscriptionFlyerSlide';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const SLIDE_MS = 4000;
const KEY = 'wl-promo-banner-dismissed';

/** Compact promo banner for signed-in customers. Uses the same promo images the admin manages. */
export default function PromoBanner({ className = '' }: { className?: string }) {
  const images = useSubscriptionFlyer(); // null = none uploaded (or still loading)
  const [i, setI] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY) === '1') setDismissed(true); } catch {}
  }, []);

  const n = images?.length ?? 0;
  useEffect(() => {
    if (n < 2 || dismissed) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, n, dismissed]);

  if (!images || n === 0 || dismissed) return null;
  const img = images[i % n];

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(KEY, '1'); } catch {}
  };

  return (
    <div className={'relative flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 pr-10 ' + className}>
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-muted">
        {images.map((m, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={m.id}
            src={m.url}
            alt=""
            draggable={false}
            className={'absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ' + (k === i % n ? 'opacity-100' : 'opacity-0')}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Promo</p>
        <p className="font-extrabold text-foreground leading-tight">{img.title || 'Wash more, pay less'}</p>
        <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Student laundry packages. Pick your campus and subscribe.</p>
        <Button asChild size="sm" className="mt-2 font-bold">
          <Link href="/subscribe">View packages</Link>
        </Button>
      </div>
      <button
        type="button"
        aria-label="Dismiss promo"
        onClick={dismiss}
        className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:bg-muted"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
