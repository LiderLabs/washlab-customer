const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Find the full step 4 branch+delivery section and replace with delivery only
const oldStep4Header = `              <h2 className=\"text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6\">Select Branch & Delivery</h2>\r\n              <div className=\"max-w-2xl mx-auto space-y-6\">\r\n                <div>\r\n                  <Label htmlFor=\"branch\">Select Branch *</Label>\r\n                  <Select value={branchId} onValueChange={setBranchId}>\r\n                    <SelectTrigger className=\"mt-1\">\r\n                      <SelectValue placeholder=\"Choose a branch\" />\r\n                    </SelectTrigger>\r\n                    <SelectContent>\r\n                      {branches.map((branch: Branch) => (\r\n                        <SelectItem key={branch._id} value={branch._id}>\r\n                          {branch.name} - {branch.city}\r\n                        </SelectItem>\r\n                      ))}\r\n                    </SelectContent>\r\n                  </Select>\r\n                  <p className=\"text-xs text-muted-foreground mt-1\">Where will you drop off your clothes?</p>\r\n                </div>\r\n                <div className=\"space-y-3\">`;

const newStep4Header = `              <h2 className=\"text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6\">Delivery Option</h2>\r\n              <div className=\"max-w-2xl mx-auto space-y-6\">\r\n                <div className=\"space-y-3\">`;

src = src.replace(oldStep4Header, newStep4Header);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Step 4 fixed:", src.includes("Delivery Option"));
console.log("Old branch selector removed:", !src.includes("Select Branch *"));
