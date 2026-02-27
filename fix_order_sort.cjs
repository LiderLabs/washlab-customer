const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  "{(dbServices as any[]).map(service => {",
  "{([...dbServices as any[]].sort((a, b) => {\n                    const order: Record<string, number> = { wash_and_dry: 0, wash_only: 1, dry_only: 2 };\n                    return (order[a.code] ?? 99) - (order[b.code] ?? 99);\n                  })).map(service => {"
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("wash_and_dry: 0"));
