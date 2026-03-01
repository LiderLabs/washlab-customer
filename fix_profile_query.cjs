const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

src = src.replace(
  `hes = (useQuery(api.branches.getActive, {}) ?? []) as Branch[];`,
  `hes = (useQuery(api.branches.getActive, {}) ?? []) as Branch[];\r\n  const { isAuthenticated } = useConvexAuth();\r\n  const customerProfile = useQuery((api as any).customers.getProfile, isAuthenticated ? {} : "skip");`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("profile query added:", src.includes("customers.getProfile"));
