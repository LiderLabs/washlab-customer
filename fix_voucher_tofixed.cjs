const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  `\`Voucher applied! You save GHS \${((validateVoucher as any)?.discountAmount?.toFixed(2) ?? "0.00"}\`)`,
  `\`Voucher applied! You save GHS \${((validateVoucher as any)?.discountAmount ?? 0).toFixed(2)}\``
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("?? 0).toFixed(2)}`"));
