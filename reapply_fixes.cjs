const fs = require("fs");

// Fix 1: SignUpForm - redirect to complete-profile after signup
let signup = fs.readFileSync("components/auth/SignUpForm.tsx", "utf8");
signup = signup.replace("router.push('/dashboard')", "router.push('/dashboard/complete-profile')");
fs.writeFileSync("components/auth/SignUpForm.tsx", signup, "utf8");
console.log("SignUp fix:", signup.includes("complete-profile"));

// Fix 2: Order page - auto-skip branch step for logged-in users
let order = fs.readFileSync("app/(public)/order/page.tsx", "utf8");
order = order.replace(
  "  const [currentStep, setCurrentStep] = useState(0);",
  "  const [currentStep, setCurrentStep] = useState(0);\n  const [branchAutoSet, setBranchAutoSet] = useState(false);"
);
order = order.replace(
  "      const prefBranch = (convexUser as any).preferredBranchId;\r\n      if (prefBranch && !branchId) {\r\n        setBranchId(prefBranch);\r\n      }",
  "      const prefBranch = (convexUser as any).preferredBranchId;\r\n      if (prefBranch && !branchAutoSet) {\r\n        setBranchId(prefBranch);\r\n        setBranchAutoSet(true);\r\n        if (currentStep === 0) setCurrentStep(1);\r\n      }"
);
order = order.replace(
  "disabled={currentStep === 1 || isSubmitting}",
  "disabled={currentStep === 0 || (currentStep === 1 && isAuthenticated && !!(convexUser as any)?.preferredBranchId) || isSubmitting}"
);
fs.writeFileSync("app/(public)/order/page.tsx", order, "utf8");
console.log("Order fix:", order.includes("branchAutoSet"));
