// Run from the customer repo root:  node apply-customer-subscriptions.cjs
// Copy first:  SubscriptionPlans.tsx + CustomerSubscriptions.tsx -> components/customer/
//              SubscribePage.tsx                                  -> repo root (this script moves it)
// Creates: app/(public)/subscribe/page.tsx, app/(protected)/dashboard/subscriptions/page.tsx
// Patches: Navbar (public link) and CustomerLayout (dashboard link). Safe to re-run.
const fs = require("fs");
const path = require("path");

function load(p) {
  const raw = fs.readFileSync(p, "utf8");
  return { crlf: raw.includes("\r\n"), text: raw.replace(/\r\n/g, "\n") };
}
function save(p, f) {
  fs.writeFileSync(p, f.crlf ? f.text.replace(/\n/g, "\r\n") : f.text);
}
function need(p) {
  if (!fs.existsSync(p)) throw new Error("Missing file: " + p);
}

need(path.join("components", "customer", "SubscriptionPlans.tsx"));
need(path.join("components", "customer", "CustomerSubscriptions.tsx"));

// 1) public page
const pubDir = path.join("app", "(public)", "subscribe");
const pubPage = path.join(pubDir, "page.tsx");
if (fs.existsSync(pubPage)) {
  console.log("public subscribe page already exists");
} else {
  need("SubscribePage.tsx");
  fs.mkdirSync(pubDir, { recursive: true });
  fs.copyFileSync("SubscribePage.tsx", pubPage);
  console.log("created", pubPage);
}

// 2) dashboard page
const dashDir = path.join("app", "(protected)", "dashboard", "subscriptions");
const dashPage = path.join(dashDir, "page.tsx");
if (fs.existsSync(dashPage)) {
  console.log("dashboard subscriptions page already exists");
} else {
  fs.mkdirSync(dashDir, { recursive: true });
  fs.writeFileSync(
    dashPage,
    "'use client';\n\nimport CustomerLayout from '@/components/customer/CustomerLayout';\nimport CustomerSubscriptions from '@/components/customer/CustomerSubscriptions';\n\nexport default function SubscriptionsPage() {\n  return (\n    <CustomerLayout>\n      <CustomerSubscriptions />\n    </CustomerLayout>\n  );\n}\n"
  );
  console.log("created", dashPage);
}

// 3) public navbar link
const navFile = path.join("components", "Navbar.tsx");
const n = load(navFile);
if (n.text.includes('"/subscribe"')) {
  console.log("Navbar already patched");
} else {
  const anchor = '    { href: "/track", label: "Track Order" },';
  if (!n.text.includes(anchor)) throw new Error("Navbar: navLinks anchor not found");
  n.text = n.text.replace(anchor, anchor + '\n    { href: "/subscribe", label: "Subscriptions" },');
  save(navFile, n);
  console.log("Navbar: Subscriptions link added");
}

// 4) dashboard sidebar link
const layoutFile = path.join("components", "customer", "CustomerLayout.tsx");
const l = load(layoutFile);
if (l.text.includes("/dashboard/subscriptions")) {
  console.log("CustomerLayout already patched");
} else {
  const navAnchor = "  { href: '/dashboard/loyalty', label: 'Loyalty Points', icon: Award },";
  const iconAnchor = "  Award,\n} from 'lucide-react';";
  if (!l.text.includes(navAnchor)) throw new Error("CustomerLayout: nav item anchor not found");
  if (!l.text.includes(iconAnchor)) throw new Error("CustomerLayout: lucide import anchor not found");
  l.text = l.text.replace(iconAnchor, "  Award,\n  Repeat,\n} from 'lucide-react';");
  l.text = l.text.replace(navAnchor, navAnchor + "\n  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: Repeat },");
  save(layoutFile, l);
  console.log("CustomerLayout: Subscriptions link added");
}
console.log("Done. Add NEXT_PUBLIC_PAYSTACK_KEY to the customer app env if it isn't there yet.");
