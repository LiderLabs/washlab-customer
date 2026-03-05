const fs = require("fs");
let src = fs.readFileSync("app/layout.tsx", "utf8");

src = src.replace(
  "export const metadata: Metadata = {\n  title: \"WashLab - Campus Laundry Made Easy\",\n  description:\n    \"Wash. Dry. Fold. Done. Professional laundry service for campus life.\",\n}",
  "export const metadata: Metadata = {\n  title: \"WashLab - Campus Laundry Made Easy\",\n  description: \"Wash. Dry. Fold. Done. Professional laundry service for campus life.\",\n  manifest: \"/manifest.json\",\n  appleWebApp: {\n    capable: true,\n    statusBarStyle: \"default\",\n    title: \"WashLab\",\n  },\n}"
);

fs.writeFileSync("app/layout.tsx", src, "utf8");
console.log("Fixed:", src.includes('manifest: "/manifest.json"'));
