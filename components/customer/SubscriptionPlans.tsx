'use client';

import { useEffect, useRef, useState } from 'react';
import { useAction, useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { useCurrentCustomer } from '@/hooks/use-current-customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { ReactNode } from 'react';
import { Check, CheckCircle2, Copy, Loader2, Repeat, ShieldCheck } from 'lucide-react';

const PAYSTACK_SRC = 'https://js.paystack.co/v1/inline.js';

function loadPaystack(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if ((window as any).PaystackPop) return resolve();
    const existing = document.querySelector(`script[src="${PAYSTACK_SRC}"]`) as HTMLScriptElement | null;
    const onLoad = () => ((window as any).PaystackPop ? resolve() : reject(new Error('Payment library failed to load')));
    if (existing) {
      existing.addEventListener('load', onLoad);
      existing.addEventListener('error', () => reject(new Error('Payment library failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = PAYSTACK_SRC;
    s.async = true;
    s.onload = onLoad;
    s.onerror = () => reject(new Error('Payment library failed to load'));
    document.body.appendChild(s);
  });
}

const money = (n: number) => `GHS ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

type Stage = 'form' | 'creating' | 'paying' | 'confirming' | 'done' | 'error';

export default function SubscriptionPlans({ id, heading = 'Choose your package', promo }: { id?: string; heading?: string; promo?: ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const { convexUser } = useCurrentCustomer() as any;
  const isMember = isAuthenticated && !!convexUser;

  const branches: any[] = (useQuery((api as any).branches.getActive, {}) ?? []) as any[];
  const [branchId, setBranchId] = useState('');
  const plans: any[] | undefined = useQuery(
    (api as any).subscriptions.listAvailablePlans,
    branchId ? { branchId: branchId as any } : {}
  );

  const memberInitiate = useMutation((api as any).subscriptions.initiatePurchase);
  const guestInitiate = useMutation((api as any).subscriptions.guestInitiatePurchase);
  const memberVerify = useAction((api as any).subscriptions.verifyPurchase);
  const guestVerify = useAction((api as any).subscriptions.verifyGuestPurchase);

  const [plan, setPlan] = useState<any>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const confirmedRef = useRef(false);
  const doneRef = useRef(false);

  const status: any = useQuery(
    (api as any).subscriptions.getPurchaseStatus,
    reference ? { reference } : 'skip'
  );

  // activation can come from the webhook OR our verify call; both flip this query
  useEffect(() => {
    if (status?.status === 'active') {
      doneRef.current = true;
      setStage('done');
    }
  }, [status?.status]);

  const close = () => {
    if (stage === 'creating' || stage === 'paying' || stage === 'confirming') return;
    setPlan(null);
    setStage('form');
    setReference(null);
    confirmedRef.current = false;
    doneRef.current = false;
    setCopied(false);
  };

  const confirmPayment = async (ref: string) => {
    setStage('confirming');
    const verify = isMember ? memberVerify : guestVerify;
    for (let i = 0; i < 8 && !doneRef.current; i++) {
      try {
        const res: any = await verify({ reference: ref });
        if (res?.status === 'active') {
          doneRef.current = true;
          setStage('done');
          return;
        }
      } catch (e: any) {
        console.warn('verify attempt failed', e?.message);
      }
      await new Promise((r) => setTimeout(r, 2500));
    }
    if (!doneRef.current) setStage('error');
  };

  const buy = async () => {
    if (!plan) return;
    if (!isMember) {
      if (name.trim().length < 2) return toast.error('Please enter your name');
      if (phone.replace(/\D/g, '').length < 9) return toast.error('Please enter a valid phone number');
    }
    if (plan.applicableBranches?.length && !branchId) {
      return toast.error('Please select your campus first');
    }
    const key = process.env.NEXT_PUBLIC_PAYSTACK_KEY;
    if (!key) return toast.error('Payments are not configured yet. Please try again later.');

    setStage('creating');
    try {
      const init: any = isMember
        ? await memberInitiate({ planId: plan._id, purchaseBranchId: (branchId || undefined) as any })
        : await guestInitiate({
            planId: plan._id,
            customerName: name.trim(),
            phoneNumber: phone.trim(),
            email: email.trim() || undefined,
            purchaseBranchId: (branchId || undefined) as any,
          });
      setReference(init.reference);
      await loadPaystack();

      const phoneDigits = (isMember ? convexUser?.phoneNumber ?? '' : phone).replace(/\D/g, '');
      const payEmail = init.email || (isMember ? convexUser?.email : '') || `customer+${phoneDigits}@washlab.com`;

      confirmedRef.current = false;
      setStage('paying');
      const handler = (window as any).PaystackPop.setup({
        key,
        email: payEmail,
        amount: init.amountKobo,
        currency: 'GHS',
        ref: init.reference,
        channels: ['card', 'mobile_money'],
        callback: function () {
          confirmedRef.current = true;
          confirmPayment(init.reference);
        },
        onClose: function () {
          if (confirmedRef.current) return;
          // The window can close because the network dropped AFTER the customer approved on their phone.
          // Never claim "not charged". Check once; the webhook / recovery job will also activate it.
          setStage('form');
          const ref = init.reference;
          (isMember ? memberVerify : guestVerify)({ reference: ref })
            .then((res: any) => {
              if (res?.status === 'active') {
                doneRef.current = true;
                setStage('done');
              } else {
                toast.info('Payment window closed. If you already approved the payment, your subscription will appear automatically.');
              }
            })
            .catch(() => {
              toast.info('Payment window closed. If you already approved the payment, your subscription will appear automatically.');
            });
        },
      });
      handler.openIframe();
    } catch (e: any) {
      toast.error(e?.message || 'Could not start payment');
      setStage('form');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const couponsRef = useRef<HTMLDivElement>(null);
  const campusName = branches.find((b: any) => b._id === branchId)?.name as string | undefined;
  const perWash = (p: any) => (p.loadsIncluded > 0 ? p.price / p.loadsIncluded : p.price);
  const pickCampus = (value: string) => {
    setBranchId(value);
    if (value && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => couponsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  };

  return (
    <div id={id} className="scroll-mt-24">
      <style>{'@keyframes wl-pop{0%,100%{transform:scale(1);box-shadow:0 0 0 0 hsl(var(--primary) / 0.5)}50%{transform:scale(1.04);box-shadow:0 0 0 10px hsl(var(--primary) / 0)}}.wl-pop{animation:wl-pop 1.8s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.wl-pop{animation:none}}'}</style>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* LEFT: campus selection */}
        <div className="space-y-6 lg:sticky lg:top-44">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{heading}</h2>
            <p className="text-sm text-muted-foreground mt-2">Each wash is a full load: washing and drying included.</p>
          </div>
          <div>
            <Label htmlFor="wl-campus" className="text-base">Your campus</Label>
            <select
              id="wl-campus"
              value={branchId}
              onChange={(e) => pickCampus(e.target.value)}
              className="mt-2 w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-base focus:outline-none focus:border-primary"
            >
              <option value="">Select campus...</option>
              {branches.map((b: any) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              {branchId ? 'Showing packages for ' + (campusName ?? 'your campus') + '.' : 'Pick your campus to see the packages available there.'}
            </p>
          </div>
        </div>

        {/* RIGHT: promo images until a campus is chosen, then the coupons */}
        <div ref={couponsRef} className="scroll-mt-24 min-w-0">
          {!branchId ? (
            promo ?? (
              <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
                <Repeat className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select your campus to see the packages.</p>
              </div>
            )
          ) : plans === undefined ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Repeat className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No packages available for {campusName ?? 'this campus'} yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {plans.map((p: any) => (
                <div key={p._id} className="wl-coupon relative flex rounded-2xl border-2 border-dashed border-primary/40 bg-card shadow-sm">
                  <div className="bg-primary text-primary-foreground rounded-l-[14px] flex flex-col items-center justify-center px-3 py-5 w-28 sm:w-36 shrink-0 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-widest opacity-80">GHS</span>
                    <span className="text-3xl sm:text-4xl font-extrabold leading-none mt-1">
                      {Number(p.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] mt-2 opacity-80">{money(perWash(p))} / wash</span>
                  </div>
                  <div className="relative w-0 border-l-2 border-dashed border-primary/40">
                    <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background" />
                    <span className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-background" />
                  </div>
                  <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col">
                    <h3 className="font-extrabold text-lg text-foreground leading-tight">{p.name}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">{p.loadsIncluded} full washes</span>
                      <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">Valid {p.validityDays} days</span>
                      <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">Wash + dry</span>
                    </div>
                    <Button className="wl-pop mt-4 w-full h-11 font-bold" onClick={() => { setPlan(p); setStage('form'); }}>
                      Buy now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!plan} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          {stage === 'done' && status ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
              <div>
                <DialogTitle className="text-xl">You&apos;re subscribed!</DialogTitle>
                <DialogDescription className="mt-1">
                  {status.planName} · {status.loadsTotal} full washes
                </DialogDescription>
              </div>
              <div className="rounded-2xl bg-primary/10 p-4">
                <p className="text-xs text-muted-foreground mb-1">Your subscription code</p>
                <p className="text-3xl font-mono font-extrabold tracking-wider text-primary">{status.code}</p>
                <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => copyCode(status.code)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy code'}
                </Button>
              </div>
              <div className="text-left text-sm text-muted-foreground space-y-2 rounded-xl bg-muted/50 p-3">
                <p className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  Save this code. At the laundromat, give the attendant your code or phone number. You&apos;ll be sent a
                  verification code to read out. Never share it with anyone else.
                </p>
              </div>
              {!isMember && (
                <p className="text-xs text-muted-foreground">
                  Tip: sign up with this phone number to see your subscription and remaining washes in your account.
                </p>
              )}
              <Button className="w-full" onClick={() => { doneRef.current = true; close(); }}>Done</Button>
            </div>
          ) : stage === 'confirming' ? (
            <div className="text-center space-y-3 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <DialogTitle>Confirming your payment…</DialogTitle>
              <DialogDescription>Please don&apos;t close this window.</DialogDescription>
            </div>
          ) : stage === 'error' ? (
            <div className="text-center space-y-3 py-6">
              <DialogTitle>We&apos;re still confirming your payment</DialogTitle>
              <DialogDescription>
                If you were charged, your subscription activates automatically, even if your connection dropped. This
                screen updates by itself. If it doesn&apos;t appear within 10 minutes, contact support with this reference:
              </DialogDescription>
              <p className="font-mono text-xs break-all bg-muted rounded-lg p-2">{reference}</p>
              <Button variant="outline" onClick={() => { doneRef.current = false; if (reference) confirmPayment(reference); }}>
                Check again
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{plan?.name}</DialogTitle>
                <DialogDescription>
                  {plan && `${money(plan.price)} · ${plan.loadsIncluded} full washes · valid ${plan.validityDays} days`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {isMember ? (
                  <div className="rounded-xl bg-muted/50 p-3 text-sm">
                    Buying as <span className="font-semibold">{convexUser?.name}</span>
                    {convexUser?.phoneNumber ? <> · {convexUser.phoneNumber}</> : null}
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Full name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone number</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="024 123 4567" className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use the number the attendant can verify. The WhatsApp code is sent to it.
                      </p>
                    </div>
                    <div>
                      <Label>Email (optional)</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="For your payment receipt" className="mt-1" />
                    </div>
                  </>
                )}

                <Button className="w-full h-12" onClick={buy} disabled={stage === 'creating' || stage === 'paying'}>
                  {stage === 'creating' || stage === 'paying' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {stage === 'paying' ? 'Waiting for payment…' : `Pay ${plan ? money(plan.price) : ''}`}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">Secure payment by Paystack · Card or Mobile Money</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
