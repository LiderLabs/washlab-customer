const fs = require("fs");
const src = fs.readFileSync("app/(public)/pricing/page.tsx", "utf8");
console.log(src);
