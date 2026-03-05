const fs = require("fs");
let src = fs.readFileSync("app/layout.tsx", "utf8");

src = src.replace(
  "<body suppressHydrationWarning>\n        <AuthProvider>",
  "<body suppressHydrationWarning>\n        <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/service-worker.js'); }); }` }} />\n        <AuthProvider>"
);

fs.writeFileSync("app/layout.tsx", src, "utf8");
console.log("Fixed:", src.includes("serviceWorker.register"));
