// Run from the customer repo root:  node apply-phone-slideshow.cjs
// Copy SubscriptionFlyerSlide.tsx into components/ first.
// Adds the subscription flyer (with Buy now) as the first slide of the landing-page phone.
// It only appears once a flyer is uploaded in admin. Safe to re-run.
const fs = require("fs");
const path = require("path");

const slideComp = path.join("components", "SubscriptionFlyerSlide.tsx");
if (!fs.existsSync(slideComp)) throw new Error("Copy SubscriptionFlyerSlide.tsx into components/ first.");

const file = path.join("components", "PhoneSlideshow.tsx");
const raw = fs.readFileSync(file, "utf8");
const crlf = raw.includes("\r\n");
let t = raw.replace(/\r\n/g, "\n");

if (t.includes("SubscriptionFlyerSlide")) {
  console.log("PhoneSlideshow already patched");
  process.exit(0);
}

function must(cond, msg) {
  if (!cond) throw new Error("PhoneSlideshow: " + msg);
}

// 1) import
const lucide = /^import \{[^}]*\} from 'lucide-react';$/m;
must(lucide.test(t), "lucide import not found");
t = t.replace(lucide, (m) => m + "\nimport { SubscriptionFlyerSlide, useSubscriptionFlyer } from '@/components/SubscriptionFlyerSlide';");

// 2) Slide interface
must(t.includes("  bgClass: string;\n}"), "Slide interface not found");
t = t.replace("  bgClass: string;\n}", "  bgClass: string;\n  /** flyer-style slide: starts right under the notch instead of the usual padding */\n  flush?: boolean;\n  /** how long to stay on this slide (ms), default 3000 */\n  hold?: number;\n}");

// 3) component state + autoplay
const startMarker = "export const PhoneSlideshow = () => {";
const idx = t.indexOf(startMarker);
must(idx !== -1, "PhoneSlideshow component not found");
let head = t.slice(0, idx);
let tail = t.slice(idx);

const stateRe = /export const PhoneSlideshow = \(\) => \{\n  const \[currentSlide, setCurrentSlide\] = useState\(0\);\n\n  useEffect\(\(\) => \{\n    const interval = setInterval\(\(\) => \{\n      setCurrentSlide\(\(prev\) => \(prev \+ 1\) % slides\.length\);\n    \}, 3000\);\n    return \(\) => clearInterval\(interval\);\n  \}, \[\]\);\n/;
must(stateRe.test(tail), "autoplay block not found (file may have changed)");
tail = tail.replace(
  stateRe,
  `export const PhoneSlideshow = () => {
  const flyer = useSubscriptionFlyer();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // Subscription flyer goes first (only once an admin has uploaded one)
  const allSlides: Slide[] = flyer
    ? [
        {
          title: 'Subscribe & Save',
          bgClass: 'from-primary/20 to-primary/5',
          flush: true,
          hold: 7000,
          content: <SubscriptionFlyerSlide flyer={flyer} />,
        },
        ...slides,
      ]
    : slides;
  const safeIndex = Math.min(currentSlide, allSlides.length - 1);

  useEffect(() => {
    if (paused) return;
    const delay = allSlides[safeIndex]?.hold ?? 3000;
    const timer = setTimeout(() => setCurrentSlide((safeIndex + 1) % allSlides.length), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, safeIndex, allSlides.length]);
`
);

// 4) pause on hover / touch so Buy now can actually be tapped
const wrapRe = /<div className="relative">(\s*)\{\/\* Phone Frame \*\/\}/;
must(wrapRe.test(tail), "phone wrapper not found");
tail = tail.replace(
  wrapRe,
  (m, ws) =>
    `<div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => {
        setPaused(true);
        setTimeout(() => setPaused(false), 10000);
      }}
    >${ws}{/* Phone Frame */}`
);

// 5) render from allSlides + safeIndex
tail = tail.replace(/slides\[currentSlide\]/g, "allSlides[safeIndex]");
tail = tail.replace(/\{slides\.map\(/g, "{allSlides.map(");
tail = tail.replace(/index === currentSlide/g, "index === safeIndex");
tail = tail.replace(/index < currentSlide/g, "index < safeIndex");

// 6) flyer slide starts under the notch, others keep pt-10
const ptOld = "absolute inset-0 pt-10 transition-all duration-500 ${";
must(tail.includes(ptOld), "slide container class not found");
tail = tail.replace(ptOld, "absolute inset-0 ${slide.flush ? 'pt-6' : 'pt-10'} transition-all duration-500 ${");

fs.writeFileSync(file, crlf ? (head + tail).replace(/\n/g, "\r\n") : head + tail);
console.log("PhoneSlideshow patched");
