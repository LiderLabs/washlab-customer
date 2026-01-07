import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { PhoneSlideshow } from '@/components/PhoneSlideshow';
import { PRICING_CONFIG } from '@/config/pricing';
import { 
  Smartphone,
  MapPin,
  Bell,
  ArrowRight,
  Check,
  Star,
  Zap,
  CreditCard,
  Gift,
  Clock,
  Building2
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Clean, Bold, Friendly */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-24 overflow-hidden min-h-[90vh] md:min-h-[85vh] flex items-center">
        {/* Background laundry imagery - MORE VISIBLE */}
        <div className="absolute inset-0">
          <Image 
            src="/assets/laundry-hero-1.jpg" 
            alt="Campus laundry service" 
            fill
            className="object-cover opacity-40"
            priority
          />
          {/* Lighter overlay for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30" />
        </div>
        
        {/* Floating laundry images - MORE VISIBLE */}
        <div className="absolute top-1/4 right-10 w-40 h-40 rounded-2xl overflow-hidden shadow-2xl rotate-6 opacity-80 hidden lg:block border-4 border-white/20">
          <Image 
            src="/assets/laundry-hero-2.jpg" 
            alt="Fresh laundry" 
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-xl overflow-hidden shadow-xl -rotate-12 opacity-70 hidden lg:block border-4 border-white/20">
          <Image 
            src="/assets/stacked-clothes.jpg" 
            alt="Folded clothes" 
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-1/2 left-10 w-28 h-28 rounded-xl overflow-hidden shadow-lg rotate-3 opacity-60 hidden xl:block border-4 border-white/20">
          <Image 
            src="/assets/laundry-hero-1.jpg" 
            alt="Laundry service" 
            fill
            className="object-cover"
          />
        </div>
        
        {/* Subtle accent gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container relative px-4 md:px-6 z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Text Content */}
            <div className="max-w-xl order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 md:mb-6 backdrop-blur-sm">
                <Zap className="w-4 h-4" />
                Campus Laundry Made Easy
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 md:mb-6 leading-tight">
                Laundry made easy
                <br />
                <span className="text-primary">for campus life.</span>
              </h1>
              
              <p className="text-base md:text-xl text-muted-foreground mb-3 md:mb-4 leading-relaxed">
                <span className="font-semibold text-foreground">Wash. Dry. Fold. Done.</span>
              </p>
              
              <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
                Drop your clothes. Pay instantly. Get notified when it's ready.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/order" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="gap-2 bg-primary hover:bg-primary/90 px-6 sm:px-8 h-12 sm:h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 w-full"
                  >
                    Start Laundry
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-6 sm:px-8 h-12 sm:h-14 text-base font-semibold rounded-full border-2 bg-background/50 backdrop-blur-sm w-full"
                  >
                    How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Right - Phone Mockup Slideshow */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 mb-6 lg:mb-0">
              <div className="relative scale-90 sm:scale-100">
                <PhoneSlideshow />
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-accent/30 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps, Big Icons */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              Simple, fast, and hassle-free
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, icon: Smartphone, title: 'Place order online', desc: 'Select your service and enter your details' },
              { step: 2, icon: MapPin, title: 'Drop clothes at WashLab', desc: 'Bring your laundry to any campus location' },
              { step: 3, icon: Bell, title: 'Get notified & pick up', desc: 'We text you when your clothes are ready' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="relative mx-auto w-fit mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <item.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent text-foreground font-bold flex items-center justify-center text-xs sm:text-sm shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg sm:text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students Love WashLab - Card Layout */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
              Why Students Love WashLab
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { icon: Clock, title: 'No queues', desc: 'Skip the laundry room lines' },
              { icon: CreditCard, title: 'Pay with MoMo', desc: 'Mobile Money & USSD payments' },
              { icon: Gift, title: 'Loyalty rewards', desc: '10 washes = 1 free wash' },
              { icon: MapPin, title: 'Campus-based', desc: 'Locations in every hostel' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image 
            src="/assets/hero-laundry.jpg" 
            alt="Laundry background" 
            fill
            className="object-cover opacity-5"
          />
        </div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">1 load = {PRICING_CONFIG.KG_PER_LOAD}kg • Final price after weighing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {PRICING_CONFIG.services.map((service) => (
              <div
                key={service.id}
                className={`relative p-6 sm:p-8 rounded-3xl transition-all ${
                  service.featured 
                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 sm:scale-105' 
                    : 'bg-card border border-border'
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-accent text-foreground text-xs sm:text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display font-semibold text-lg sm:text-xl mb-2">{service.label}</h3>
                <div className={`text-3xl sm:text-4xl font-display font-bold mb-4 sm:mb-6 ${service.featured ? '' : 'text-primary'}`}>
                  ₵{service.price}<span className={`text-base sm:text-lg font-normal ${service.featured ? 'opacity-70' : 'text-muted-foreground'}`}>{service.unit}</span>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Check className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${service.featured ? '' : 'text-primary'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/order?service=${service.id}`} className="block mt-6 sm:mt-8">
                  <Button 
                    className={`w-full rounded-full h-11 sm:h-12 font-semibold text-sm sm:text-base ${
                      service.featured 
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <p className="text-primary font-semibold flex items-center justify-center gap-2 text-sm sm:text-base">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              {PRICING_CONFIG.loyalty.washesForFreeWash} washes = 1 free wash!
            </p>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
              Our Locations
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">Find us on your campus</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Legon Campus', location: 'Main Gate', isOpen: true },
              { name: 'UPSA', location: 'Hostel Area', isOpen: true },
              { name: 'KNUST', location: 'Unity Hall', isOpen: false, comingSoon: true },
            ].map((branch) => (
              <div
                key={branch.name}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  {branch.comingSoon ? (
                    <span className="px-2 sm:px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      Coming Soon
                    </span>
                  ) : (
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                      branch.isOpen ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                    }`}>
                      {branch.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg mb-1">{branch.name}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{branch.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-28 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-4 sm:mb-6">
              Ready to wash smarter?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-8 sm:mb-10">
              Join thousands of students who've made the switch to WashLab.
            </p>
            <Link href="/order">
              <Button 
                size="lg" 
                className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-full shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                Start Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <Logo size="sm" />
            <nav className="flex flex-wrap justify-center gap-x-6 sm:gap-x-8 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <Link href="/order" className="hover:text-primary transition-colors">Place Order</Link>
              <Link href="/track" className="hover:text-primary transition-colors">Track Order</Link>
              <Link href="/dashboard" className="hover:text-primary transition-colors">Account</Link>
            </nav>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 WashLab
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

