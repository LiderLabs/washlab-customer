const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
// Find where price is displayed to customer
const idx = src.indexOf("estimatedPrice");
let pos = idx;
let found = [];
while (true) {
  pos = src.indexOf("estimatedPrice", pos + 1);
  if (pos === -1) break;
  found.push(JSON.stringify(src.substring(pos - 30, pos + 100)));
}
console.log(found.join("\n---\n"));
