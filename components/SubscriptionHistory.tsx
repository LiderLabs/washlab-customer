'use client';
import { useState } from 'react';
import { useQuery, useConvexAuth } from 'convex/react';
import { api } from '@liderlabs/washlab-backend/api';
import { Loader2, ChevronDown } from 'lucide-react';

const dt = (ms?: number) =>
  ms ? new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const day = (ms?: number) =>
  ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const money = (n: number) => `₵${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const STATUS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  exhausted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

/** "My packages": every subscription the signed-in customer bought, with a usage log. Renders nothing if signed out or none. */
export function SubscriptionHistory() {
  const { isAuthenticated } = useConvexAuth();
  const subs: any[] | undefined = useQuery(
    (api as any).subscriptions.getMySubscriptionHistory,
    isAuthenticated ? {} : 'skip'
  );
  const [open, setOpen] = useState<string | null>(null);

  if (!isAuthenticated) return null;
  if (subs === undefined) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (subs.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">My packages</h2>
      {subs.map((s) => {
        const pct = s.loadsTotal ? Math.round((s.loadsRemaining / s.loadsTotal) * 100) : 0;
        const isOpen = open === s._id;
        return (
          <div key={s._id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{s.planName}</p>
                <p className="text-xs text-muted-foreground font-mono">{s.code}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS[s.status] ?? 'bg-muted text-muted-foreground'}`}>{s.status}</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span><b className="text-foreground">{s.loadsRemaining}</b> <span className="text-muted-foreground">of {s.loadsTotal} washes left</span></span>
                <span className="text-muted-foreground">{pct}%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Bought</dt><dd className="text-right">{dt(s.purchasedAt)}</dd>
              <dt className="text-muted-foreground">Amount</dt><dd className="text-right">{money(s.planPrice)}</dd>
              <dt className="text-muted-foreground">Valid until</dt><dd className="text-right">{day(s.expiresAt)}</dd>
            </dl>

            <button onClick={() => setOpen(isOpen ? null : s._id)} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {isOpen ? 'Hide usage log' : `Usage log (${s.usages.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
                {s.usages.length === 0 && <li className="p-3 text-sm text-muted-foreground">Not used yet.</li>}
                {s.usages.map((u: any) => (
                  <li key={u._id} className="p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-foreground">Order {u.orderNumber ?? '—'}</span>
                      <span className="text-muted-foreground text-xs">{dt(u.usedAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {u.loadsUsed} wash{u.loadsUsed === 1 ? '' : 'es'} used · {u.loadsRemainingAfter} left
                      {u.branchName ? ` · ${u.branchName}` : ''}
                      {u.extraWash ? ` · +${u.extraWash} extra wash` : ''}
                      {u.extraDry ? ` · +${u.extraDry} extra dry` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default SubscriptionHistory;
