const fs = require("fs");
let src = fs.readFileSync("app/layout.tsx", "utf8");
const idx = src.indexOf("<body");
console.log(JSON.stringify(src.substring(idx, idx + 300)));
