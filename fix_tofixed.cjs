const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Fix all unsafe toFixed calls - wrap with nullish coalescing
src = src.replace(/service\.price\.toFixed\(2\)/g, "(service.price ?? 0).toFixed(2)");
src = src.replace(/service\.basePrice\.toFixed\(2\)/g, "(service.basePrice ?? 0).toFixed(2)");
src = src.replace(/selectedDbService\.basePrice\.toFixed\(2\)/g, "(selectedDbService.basePrice ?? 0).toFixed(2)");
src = src.replace(/estimatedPrice\.toFixed\(2\)/g, "(estimatedPrice ?? 0).toFixed(2)");
src = src.replace(/estimatedWeight\.toFixed\(1\)/g, "(estimatedWeight ?? 0).toFixed(1)");
src = src.replace(/voucherResult\.discountAmount\?\.toFixed\(2\)/g, "(voucherResult?.discountAmount ?? 0).toFixed(2)");
src = src.replace(/validateVoucher as any\)\.discountAmount\?\.toFixed\(2\)/g, "(validateVoucher as any)?.discountAmount?.toFixed(2) ?? \"0.00\"");

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed price:", src.includes("(service.price ?? 0).toFixed"));
console.log("Fixed basePrice:", src.includes("(service.basePrice ?? 0).toFixed"));
console.log("Fixed estimatedPrice:", src.includes("(estimatedPrice ?? 0).toFixed"));
