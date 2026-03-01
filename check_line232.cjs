const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

const lines = src.split("\n");
console.log("Line 232:", JSON.stringify(lines[231]));
