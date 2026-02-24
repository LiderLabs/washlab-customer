'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { PRICING_CONFIG } from '@/config/pricing';
import { Check, Sparkles, Loader2 } from 'lucide-react';

export default function PricingPage() {
  // ✅ Live services from the database — reflects whatever admin sets
  const dbServices = useQuery(api.services.getActive);
  const isLoading = dbServices === undefined;

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
            No hidden fees. Just clean laundry at student-friendly prices.
          </p>
        </div>

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
            {dbServices.map((service, index) => {
              // Mark the middle service as featured if there are 3, otherwise mark first
              const isFeatured = dbServices.length === 3 ? index === 1 : index === 0;

              return (
                <div
                  key={service._id}
                  className={`relative bg-card rounded-2xl p-6 sm:p-8 border ${
                    isFeatured
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-border'
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      {service.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-primary">
                        ₵{service.basePrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground text-sm sm:text-base">
                        /{service.pricingType === 'per_kg' ? 'kg' : 'load'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      (1 load = {PRICING_CONFIG.KG_PER_LOAD}kg)
                    </p>
                  </div>

                  {service.description && (
                    <p className="text-muted-foreground text-center mb-4 sm:mb-6 text-sm sm:text-base">
                      {service.description}
                    </p>
                  )}

                  <Link href="/order">
                    <Button
                      className="w-full"
                      variant={isFeatured ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Info — kept from config since not stored in DB */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-muted/50 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">
              Additional Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Delivery Fee</span>
                <span className="font-bold text-primary text-sm sm:text-base">
                  ₵{PRICING_CONFIG.deliveryFee}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Service Fee</span>
                <span className="font-bold text-primary text-sm sm:text-base">
                  ₵{PRICING_CONFIG.serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Tax Rate</span>
                <span className="font-bold text-primary text-sm sm:text-base">
                  {PRICING_CONFIG.taxRate * 100}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Loyalty Reward</span>
                <span className="font-bold text-primary text-xs sm:text-sm text-right">
                  {PRICING_CONFIG.loyalty.washesForFreeWash} washes = 1 free
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}