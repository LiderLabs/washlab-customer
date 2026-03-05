const fs = require("fs");
const src = fs.readFileSync("app/layout.tsx", "utf8");
console.log(src.substring(0, 800));
