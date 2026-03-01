const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find useQuery calls
const matches = [...src.matchAll(/useQuery\([^)]+\)/g)];
matches.forEach((m, i) => console.log(i, JSON.stringify(m[0])));

// Find useConvexAuth
const idx = src.indexOf("useConvexAuth");
console.log("useConvexAuth:", JSON.stringify(src.substring(idx, idx + 100)));
