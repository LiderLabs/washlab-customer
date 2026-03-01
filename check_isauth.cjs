const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find where isAuthenticated is already declared
let pos = 0, i = 0;
while ((pos = src.indexOf("isAuthenticated", pos)) !== -1) {
  i++;
  console.log(`occurrence ${i} at ${pos}:`, JSON.stringify(src.substring(pos - 30, pos + 60)));
  pos += 1;
  if (i > 6) break;
}
