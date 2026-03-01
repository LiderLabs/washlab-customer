const fs = require("fs");
let src = fs.readFileSync("app/(public)/order/page.tsx", "utf8");

// 1. Add getProfile query after existing queries
src = src.replace(
  `  const branches = useQuery(api.branches.getActive, {});`,
  `  const branches = useQuery(api.branches.getActive, {});
  const { isAuthenticated } = useConvexAuth();
  const customerProfile = useQuery((api as any).customers.getProfile, isAuthenticated ? {} : "skip");`
);

// 2. Auto-fill branchId from profile + skip to step 1 if branch already saved
src = src.replace(
  `  const [branchId, setBranchId] = useState<string>('');`,
  `  const [branchId, setBranchId] = useState<string>('');
  const [branchSkipped, setBranchSkipped] = useState(false);`
);

// 3. Add useEffect to pre-fill branch and skip step 0
src = src.replace(
  `  const [currentStep, setCurrentStep] = useState(0);`,
  `  const [currentStep, setCurrentStep] = useState(0);`
);

// Add useEffect after the state declarations - find a good anchor
src = src.replace(
  `  const copyOrderCode = () => {`,
  `  // Auto-skip branch step if customer has saved branch
  useEffect(() => {
    if (customerProfile?.branchId && !branchSkipped) {
      setBranchId(customerProfile.branchId);
      setBranchSkipped(true);
      if (currentStep === 0) setCurrentStep(1);
    }
  }, [customerProfile, branchSkipped, currentStep]);

  const copyOrderCode = () => {`
);

fs.writeFileSync("app/(public)/order/page.tsx", src, "utf8");
console.log("profile query added:", src.includes("customers.getProfile"));
console.log("useEffect added:", src.includes("Auto-skip branch step"));
