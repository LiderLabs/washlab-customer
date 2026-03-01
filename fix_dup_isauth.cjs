const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Remove the duplicate isAuthenticated declaration we added
src = src.replace(
  `]) as Branch[];\r\n  const { isAuthenticated } = useConvexAuth();\r\n  const customerProfile = useQuery((api as any).customers.getProfile, isAuthenticated ? {} : "skip");`,
  `]) as Branch[];\r\n  const customerProfile = useQuery((api as any).customers.getProfile, isAuthenticated ? {} : "skip");`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Fixed:", !src.includes('const { isAuthenticated } = useConvexAuth();\r\n  const customerProfile'));
