'use client';

import { useMemo } from 'react';

/**
 * Shared voucher design (copy this same file into the customer, attendant and admin repos as
 * components/VoucherCard.tsx). Everyday (blue) is the default everywhere.
 * To add a template: add one entry to VOUCHER_TEMPLATES. Nothing else needs to change.
 */
export const VOUCHER_TEMPLATES = {
  everyday: { label: 'Everyday', panel: '#0b2de6', ink: '#0a0a0a', headline: '' },
  pink: { label: 'Pink October', panel: '#ff1fe8', ink: '#ff1fe8', headline: 'Pink October' },
  christmas: { label: 'Christmas', panel: '#1fd40a', ink: '#ff1111', headline: 'Christmas' },
  valentine: { label: 'Valentine', panel: '#ff0000', ink: '#0a0a0a', headline: 'Valentine' },
} as const;

export type VoucherTemplateKey = keyof typeof VOUCHER_TEMPLATES;

export function resolveTemplate(key?: string | null) {
  return (VOUCHER_TEMPLATES as Record<string, (typeof VOUCHER_TEMPLATES)[VoucherTemplateKey]>)[key ?? ''] ?? VOUCHER_TEMPLATES.everyday;
}

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
.wlv-w{container-type:inline-size;width:100%}
.wlv{position:relative;display:grid;grid-template-columns:55fr 45fr;aspect-ratio:880/372;background:#fff;border-radius:2cqw;overflow:hidden;font-family:'Bebas Neue','Anton',Impact,'Arial Narrow',sans-serif;font-weight:400;color:var(--wlv-ink);-webkit-font-smoothing:antialiased;box-shadow:0 0 0 1px rgba(0,0,0,.08)}
.wlv.wlv-off{filter:grayscale(.7);opacity:.7}
.wlv-l{padding:2.8cqw 3cqw 2.8cqw 7cqw;display:flex;flex-direction:column;justify-content:center;min-width:0}
.wlv-ti{line-height:.95;letter-spacing:.01em;text-transform:uppercase;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.wlv-su{font-size:4cqw;line-height:1;margin-top:1.6cqw;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wlv-pr{display:flex;align-items:center;gap:2.2cqw;margin-top:.4cqw}
.wlv-am{line-height:1.05;white-space:nowrap}
.wlv-st{display:flex;flex-direction:column;font-size:3.6cqw;line-height:1.15;text-transform:uppercase;white-space:nowrap}
.wlv-ft{font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;font-size:1.45cqw;letter-spacing:.18em;font-weight:700;margin-top:1.4cqw;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wlv-r{background:var(--wlv-panel);color:#fff;border-radius:0 5cqw 5cqw 0;padding:3.6cqw 3cqw 4cqw;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center}
.wlv-vt{font-size:4.1cqw;line-height:1.08;letter-spacing:.02em;text-transform:uppercase}
.wlv-bc{width:78%}
.wlv-bc svg{display:block;width:100%;height:auto}
.wlv-cd{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:1.9cqw;letter-spacing:.18em;margin-top:.7cqw}
.wlv-badge{position:absolute;left:2cqw;top:2cqw;background:#0a0a0a;color:#fff;font-size:3cqw;padding:.2cqw 1.6cqw;border-radius:1cqw;letter-spacing:.06em;text-transform:uppercase;z-index:2}
`;

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Barcode-style bars generated from a seed. Decorative: not a scannable Code 128. */
function Bars({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let s = hashSeed(seed || 'washlab') || 1;
    const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1000) / 1000; };
    const out: { x: number; w: number }[] = [];
    let x = 0, on = true;
    while (x < 296) {
      const w = 1 + Math.floor(rnd() * 4);
      if (on) out.push({ x, w: Math.min(w, 300 - x) });
      x += w;
      on = !on;
    }
    return out;
  }, [seed]);
  return (
    <svg viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={80} fill="#fff" />)}
    </svg>
  );
}

export type VoucherProps = {
  template?: string | null;
  title: string;
  subtitle?: string;
  bigText: string;
  sideLines?: [string, string];
  footer?: string;
  panelLines: string[];
  code?: string;
  seed?: string;
  badge?: string;
  dim?: boolean;
  className?: string;
};

export function VoucherCard(p: VoucherProps) {
  const t = resolveTemplate(p.template);
  const n = p.title.length;
  const titleSize = n <= 10 ? 8.6 : n <= 14 ? 6.6 : n <= 20 ? 5.4 : 4.4;
  const m = p.bigText.length;
  const bigSize = m <= 4 ? 14.5 : m <= 5 ? 12.5 : 10.5;
  return (
    <div className={'wlv-w ' + (p.className ?? '')}>
      <style>{FONT_CSS}</style>
      <div className={'wlv' + (p.dim ? ' wlv-off' : '')} style={{ ['--wlv-ink' as any]: t.ink, ['--wlv-panel' as any]: t.panel }}>
        {p.badge ? <span className="wlv-badge">{p.badge}</span> : null}
        <div className="wlv-l">
          <div className="wlv-ti" style={{ fontSize: titleSize + 'cqw' }}>{p.title}</div>
          {p.subtitle ? <div className="wlv-su">{p.subtitle}</div> : null}
          <div className="wlv-pr">
            <span className="wlv-am" style={{ fontSize: bigSize + 'cqw' }}>{p.bigText}</span>
            {p.sideLines ? (
              <span className="wlv-st"><b style={{ fontWeight: 400 }}>{p.sideLines[0]}</b><b style={{ fontWeight: 400 }}>{p.sideLines[1]}</b></span>
            ) : null}
          </div>
          {p.footer ? <div className="wlv-ft">{p.footer}</div> : null}
        </div>
        <div className="wlv-r">
          <div className="wlv-vt">{p.panelLines.map((l, i) => <div key={i}>{l}</div>)}</div>
          <div className="wlv-bc">
            <Bars seed={p.seed || p.code || p.title} />
            {p.code ? <div className="wlv-cd">{p.code}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- helpers

const fmtDate = (ts?: number) =>
  ts ? new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : '-';

const fmtMoney = (n: number) => '\u20B5' + Number(n).toLocaleString('en-GB', { maximumFractionDigits: 2 });

function serviceLines(types: string[] | undefined, loads: number): [string, string] {
  const has = (c: string) => (types ?? []).includes(c);
  const none = !types || types.length === 0;
  if (none || has('wash_and_dry')) return [loads + (loads === 1 ? ' WASH' : ' WASHES'), loads + (loads === 1 ? ' DRY' : ' DRIES')];
  if (has('wash_only') && !has('dry_only')) return [loads + (loads === 1 ? ' WASH' : ' WASHES'), 'WASH ONLY'];
  if (has('dry_only') && !has('wash_only')) return [loads + (loads === 1 ? ' DRY' : ' DRIES'), 'DRY ONLY'];
  return [loads + (loads === 1 ? ' LOAD' : ' LOADS'), ''];
}

/** headline shown big: the admin's headline, else the template's own name (e.g. Christmas), else the plan name */
export function voucherHeadline(plan: { name: string; headline?: string | null; template?: string | null }) {
  return (plan.headline && plan.headline.trim()) || resolveTemplate(plan.template).headline || plan.name;
}

/** A package before purchase (subscribe page, admin preview). */
export function PlanVoucher({ plan, className }: { plan: any; className?: string }) {
  const loads = Number(plan.loadsIncluded) || 0;
  return (
    <VoucherCard
      className={className}
      template={plan.template}
      title={voucherHeadline(plan)}
      subtitle="Wash more, pay less"
      bigText={fmtMoney(plan.price || 0)}
      sideLines={serviceLines(plan.applicableServiceTypes, loads)}
      footer="www.washlab.app"
      panelLines={['Valid for', (Number(plan.validityDays) || 0) + ' days']}
      seed={String(plan._id ?? plan.name)}
    />
  );
}

const STATUS_BADGE: Record<string, string> = {
  expired: 'Expired',
  exhausted: 'All washes used',
  cancelled: 'Cancelled',
  pending_payment: 'Pending',
};

/** A purchased package (customer's packages, attendant search). titleMode "customer" puts the customer name on top. */
export function OwnedVoucher({ sub, titleMode = 'plan', className }: { sub: any; titleMode?: 'plan' | 'customer'; className?: string }) {
  const inactive = sub.status && sub.status !== 'active';
  const used = sub.loadsUsed ?? Math.max(0, (sub.loadsTotal ?? 0) - (sub.loadsRemaining ?? 0));
  const title = titleMode === 'customer' ? (sub.customerName || 'Customer') : voucherHeadline({ name: sub.planName, headline: sub.headline, template: sub.template });
  const subtitle = titleMode === 'customer' ? sub.planName : 'Wash more, pay less';
  const footer = titleMode === 'customer'
    ? [sub.phoneNumber, used + ' used'].filter(Boolean).join('  |  ')
    : used + ' used';
  return (
    <VoucherCard
      className={className}
      template={sub.template}
      title={title}
      subtitle={subtitle}
      bigText={String(sub.loadsRemaining ?? 0)}
      sideLines={[(sub.loadsRemaining === 1 ? 'Wash left' : 'Washes left'), 'of ' + (sub.loadsTotal ?? 0) + ' total']}
      footer={footer}
      panelLines={[sub.status === 'expired' ? 'Expired on' : 'Valid until :', fmtDate(sub.expiresAt)]}
      code={sub.code}
      badge={inactive ? STATUS_BADGE[sub.status] ?? sub.status : undefined}
      dim={!!inactive}
    />
  );
}

export default VoucherCard;
