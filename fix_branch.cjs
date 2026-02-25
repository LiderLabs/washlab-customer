const fs = require('fs');
const lines = fs.readFileSync('app/(public)/order/page.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (convexUser && isAuthenticated)')) {
    for (let j = i+1; j < i+15; j++) {
      if (lines[j] && lines[j].includes('}));')) {
        lines.splice(j+1, 0,
          '      if (convexUser.branchId && !branchId) {',
          '        setBranchId(convexUser.branchId);',
          '      }'
        );
        console.log('Branch auto-select added at line ' + (j+1));
        break;
      }
    }
    break;
  }
}

fs.writeFileSync('app/(public)/order/page.tsx', lines.join('\n'), 'utf8');
console.log('Done');
