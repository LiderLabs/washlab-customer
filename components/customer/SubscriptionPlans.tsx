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

export default function SubscriptionPlans({ id, heading = 'Choose your package' }: { id?: string; heading?: string }) {
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
          if (!confirmedRef.current) {
            setStage('form');
            toast.info('Payment window closed. You have not been charged.');
          }
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

  return (
    <div id={id} className="space-y-5 scroll-mt-24">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
        <p className="text-sm text-muted-foreground mt-1">Each wash is a full load: washing and drying included.</p>
      </div>

      <div className="max-w-xs">
        <Label>Your campus</Label>
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">Select campus…</option>
          {branches.map((b: any) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {plans === undefined ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Repeat className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No packages available for this campus yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((p: any) => (
            <div key={p._id} className="rounded-2xl border-2 border-border bg-card p-5 flex flex-col">
              <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
              {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
              <p className="text-3xl font-extrabold text-primary mt-3">{money(p.price)}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-foreground flex-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {p.loadsIncluded} full washes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Washing and drying included</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Valid for {p.validityDays} days</li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-4" /> {money(p.price / p.loadsIncluded)} per wash
                </li>
              </ul>
              <Button className="mt-4 w-full h-11" onClick={() => { setPlan(p); setStage('form'); }}>
                Buy now
              </Button>
            </div>
          ))}
        </div>
      )}

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
                If you were charged, your subscription will activate shortly. Keep this reference and contact support
                if it doesn&apos;t appear within a few minutes:
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
