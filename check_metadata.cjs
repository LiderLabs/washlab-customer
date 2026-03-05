const fs = require("fs");
const src = fs.readFileSync("app/layout.tsx", "utf8");
const idx = src.indexOf("export const metadata");
console.log(JSON.stringify(src.substring(idx, idx + 200)));
