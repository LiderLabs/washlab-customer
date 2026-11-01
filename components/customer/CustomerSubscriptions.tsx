'use client';

import { useEffect, useState } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Loader2, Repeat, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import SubscriptionPlans from './SubscriptionPlans';

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
              const pct = s.loadsTotal ? Math.round((s.loadsRemaining / s.loadsTotal) * 100) : 0;
              return (
                <Card key={s._id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{s.planName}</p>
                        <button
                          className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded"
                          onClick={() => { navigator.clipboard?.writeText(s.code); toast.success('Code copied!'); }}
                        >
                          {s.code} <Copy className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Washes left</span>
                        <span className="text-sm"><span className="text-2xl font-bold">{s.loadsRemaining}</span> / {s.loadsTotal}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {s.expiresAt && (
                      <p className="text-xs text-muted-foreground">
                        {s.status === 'expired' ? 'Expired' : 'Valid until'} {format(new Date(s.expiresAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <SubscriptionPlans heading="Buy a package" />
    </div>
  );
}
