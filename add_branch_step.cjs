const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// Add branch step 0 UI before currentStep === 1
const branchStep = `          {/* Step 0: Branch Selection */}
          {currentStep === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-2">Choose Your Branch</h2>
              <p className="text-sm text-muted-foreground mb-6">Select the WashLab location nearest to you</p>
              {!branches || branches.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading branches...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {branches.map((branch: Branch) => (
                    <button
                      key={branch._id}
                      onClick={() => { setBranchId(branch._id); setCurrentStep(1); }}
                      className={\`p-5 rounded-2xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 \${branchId === branch._id ? "border-primary bg-primary/5" : "border-border bg-card"}\`}
                    >
                      <p className="font-semibold text-foreground">{branch.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{branch.address}, {branch.city}</p>
                      {branch.pricingPerKg && (
                        <p className="text-xs text-primary font-medium mt-2">₵{branch.pricingPerKg}/kg</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

`;

src = src.replace(
  `          {/* Step 0: Service */}\r\n          {currentStep === 1 &&`,
  branchStep + `          {/* Step 1: Service */}\r\n          {currentStep === 1 &&`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("Branch step added:", src.includes("Step 0: Branch Selection"));
