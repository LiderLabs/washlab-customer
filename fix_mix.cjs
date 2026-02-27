const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  "whitesSeparate: hasWhites ? washSeparately : false,",
  "whitesSeparate: hasWhites ? washSeparately : false,\r\n        mixWithColors: hasWhites ? !washSeparately : false,"
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("mixWithColors"));
