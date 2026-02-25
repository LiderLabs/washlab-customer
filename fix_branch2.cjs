const fs = require('fs');
let src = fs.readFileSync('app/(public)/order/page.tsx', 'utf8');

// Replace the wrong branchId with preferredBranchId, cast to any for TS
src = src.replace(
  'if (convexUser.branchId && !branchId) {\n        setBranchId(convexUser.branchId);\n      }',
  'const prefBranch = (convexUser as any).preferredBranchId;\n      if (prefBranch && !branchId) {\n        setBranchId(prefBranch);\n      }'
);

fs.writeFileSync('app/(public)/order/page.tsx', src, 'utf8');
console.log('Done');
