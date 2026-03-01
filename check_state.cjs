const fs = require("fs");
const src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
// find service state
const idx = src.indexOf("useState");
let pos = 0;
while(true) {
  pos = src.indexOf("useState", pos + 1);
  if (pos === -1) break;
  const chunk = src.substring(pos - 10, pos + 100);
  if (chunk.toLowerCase().includes("service") || chunk.includes("null") || chunk.includes("\"\"")) {
    console.log(JSON.stringify(chunk));
    console.log("---");
  }
}
