const fs = require("fs");

const newPricingPage = `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, MapPin, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const branches = (useQuery(api.branches.getActive, {}) ?? []) as any[];
  const branchServices = useQuery(
    (api as any).admin.getBranchServicesPublic,
    selectedBranchId ? { branchId: selectedBranchId } : "skip"
  ) as any[] | undefined;

  const selectedBranch = branches.find((b: any) => b._id === selectedBranchId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a branch to see their services and pricing.
          </p>
        </div>

        {!selectedBranchId ? (
          /* Branch Selection */
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Choose a Branch</h2>
            {branches.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {branches.map((branch: any) => (
                  <button
                    key={branch._id}
                    onClick={() => setSelectedBranchId(branch._id)}
                    className="p-5 rounded-2xl border-2 border-border bg-card text-left hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{branch.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{branch.address}, {branch.city}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Services for selected branch */
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setSelectedBranchId(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                All Branches
              </button>
              <span className="text-muted-foreground">•</span>
              <span className="font-semibold text-foreground">{selectedBranch?.name}</span>
            </div>

            {branchServices === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : branchServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services available for this branch yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                {branchServices.map((service: any, index: number) => {
                  const isFeatured = branchServices.length === 3 ? index === 1 : index === 0;
                  return (
                    <div
                      key={service._id}
                      className={\`relative bg-card rounded-2xl p-6 sm:p-8 border \${isFeatured ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'}\`}
                    >
                      {isFeatured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
                            <Sparkles className="w-3 h-3" />
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{service.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl sm:text-4xl font-bold text-primary">₵{service.price.toFixed(2)}</span>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-muted-foreground text-center mb-4 text-sm">{service.description}</p>
                      )}
                      <Link href="/order">
                        <Button className="w-full" variant={isFeatured ? 'default' : 'outline'}>
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
`;

fs.writeFileSync("app/(public)/pricing/page.tsx", newPricingPage, "utf8");
console.log("Pricing page rewritten:", newPricingPage.includes("getBranchServicesPublic"));
