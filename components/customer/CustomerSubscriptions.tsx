'use client';

import { useEffect, useState } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Loader2, Repeat, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import SubscriptionPlans from './SubscriptionPlans';
import { OwnedVoucher } from '@/components/VoucherCard';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-amber-100 text-amber-700',
  exhausted: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function CustomerSubscriptions() {
  const { isAuthenticated } = useConvexAuth();
  const mine: any[] | undefined = useQuery((api as any).subscriptions.getMySubscriptions, isAuthenticated ? {} : 'skip');
  const otps: any[] = useQuery((api as any).subscriptions.getMyPendingOtps, isAuthenticated ? {} : 'skip') ?? [];

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const liveOtps = otps.filter((o) => o.expiresAt > now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Your laundry packages, remaining washes and verification codes</p>
      </div>

      {liveOtps.map((o) => {
        const secs = Math.max(0, Math.floor((o.expiresAt - now) / 1000));
        return (
          <Card key={o.subscriptionId} className="border-primary/40 bg-primary/5">
            <CardContent className="p-5 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                <ShieldCheck className="w-4 h-4" /> Verification code for {o.planName}
              </div>
              <p className="text-4xl font-mono font-extrabold tracking-[0.4em] pl-[0.4em]">{o.code}</p>
              <p className="text-sm text-muted-foreground">
                Read this out to the attendant only. Expires in {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}.
              </p>
            </CardContent>
          </Card>
        );
      })}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">My subscriptions</h2>
        {mine === undefined ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : mine.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <Repeat className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">You don&apos;t have a subscription yet. Pick a package below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mine.map((s: any) => {
              return (
                <div key={s._id} className="space-y-2">
                  <OwnedVoucher sub={s} />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => { navigator.clipboard?.writeText(s.code); toast.success('Code copied!'); }}
                  >
                    <Copy className="w-3 h-3" /> Copy code {s.code}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SubscriptionPlans heading="Buy a package" />
    </div>
  );
}
