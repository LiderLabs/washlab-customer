const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  `else toast.success(\`Voucher applied! You save GHS \${((validateVoucher as any)?.discountAmount ?? 0).toFixed(2)}\`;`,
  `else toast.success(\`Voucher applied! You save GHS \${((validateVoucher as any)?.discountAmount ?? 0).toFixed(2)}\`);`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", src.includes(".toFixed(2)}\`);"));
