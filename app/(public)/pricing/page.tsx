import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { PRICING_CONFIG } from '@/config/pricing';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
          {PRICING_CONFIG.services.map((service) => (
            <div 
              key={service.id}
              className={`relative bg-card rounded-2xl p-6 sm:p-8 border ${
                service.featured 
                  ? 'border-primary shadow-lg shadow-primary/20' 
                  : 'border-border'
              }`}
            >
              {service.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{service.label}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-primary">₵{service.price}</span>
                  <span className="text-muted-foreground text-sm sm:text-base">{service.unit}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">(1 load = {PRICING_CONFIG.KG_PER_LOAD}kg)</p>
              </div>

              <p className="text-muted-foreground text-center mb-4 sm:mb-6 text-sm sm:text-base">{service.description}</p>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-foreground text-sm sm:text-base">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/order">
                <Button 
                  className={`w-full ${service.featured ? '' : 'variant-outline'}`}
                  variant={service.featured ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-muted/50 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Additional Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Delivery Fee</span>
                <span className="font-bold text-primary text-sm sm:text-base">₵{PRICING_CONFIG.deliveryFee}</span>
              </div>
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Service Fee</span>
                <span className="font-bold text-primary text-sm sm:text-base">₵{PRICING_CONFIG.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Tax Rate</span>
                <span className="font-bold text-primary text-sm sm:text-base">{PRICING_CONFIG.taxRate * 100}%</span>
              </div>
              <div className="flex justify-between items-center p-3 sm:p-4 bg-background rounded-xl">
                <span className="text-foreground text-sm sm:text-base">Loyalty Reward</span>
                <span className="font-bold text-primary text-xs sm:text-sm text-right">{PRICING_CONFIG.loyalty.washesForFreeWash} washes = 1 free</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

