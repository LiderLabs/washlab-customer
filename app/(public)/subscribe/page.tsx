'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { Navbar } from '@/components/Navbar';
import SubscriptionPlans from '@/components/customer/SubscriptionPlans';
import { Button } from '@/components/ui/button';
import { Repeat, ArrowDown } from 'lucide-react';

export default function SubscribePage() {
  const flyer: any = useQuery((api as any).subscriptions.getFlyer);
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
        {flyer === undefined ? (
          <div className="aspect-[3/4] max-w-md mx-auto rounded-3xl bg-muted/40 animate-pulse" />
        ) : flyer ? (
          <div className="max-w-md mx-auto space-y-4">
            <div className="rounded-3xl overflow-hidden border border-border shadow-lg bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flyer.url} alt={flyer.title ?? 'WashLab subscription packages'} className="w-full h-auto block" />
            </div>
            <Button size="lg" className="w-full h-14 text-base font-bold rounded-2xl gap-2" onClick={scrollToPlans}>
              Buy now <ArrowDown className="w-5 h-5" />
            </Button>
          </div>
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
      </main>

      {/* mobile sticky Buy now */}
      {!plansVisible && flyer && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur border-t border-border">
          <Button size="lg" className="w-full h-12 font-bold rounded-xl" onClick={scrollToPlans}>Buy now</Button>
        </div>
      )}
    </div>
  );
}
