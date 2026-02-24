"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { StepIndicator } from '@/components/StepIndicator';
import { ServiceCard } from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceType } from '@/types';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { useCurrentCustomer } from '@/hooks/use-current-customer';
import {
  Droplets,
  Wind,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  Plus,
  Minus,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '@jordan6699/washlab-backend/dataModel';

const STEPS = ['Service', 'Clothes', 'Whites', 'Branch & Delivery', 'Details', 'Summary'];

// ── Heavy item definitions ────────────────────────────────────────────────────
const HEAVY_ITEMS = [
  { key: 'jeans',  label: 'Jeans / Trousers', emoji: '👖', weightPerItem: 0.8 },
  { key: 'duvet',  label: 'Duvet / Blanket',  emoji: '🛏️', weightPerItem: 2.5 },
  { key: 'towel',  label: 'Towel',            emoji: '🏊', weightPerItem: 0.6 },
] as const;

type HeavyItemKey = typeof HEAVY_ITEMS[number]['key'];
type HeavyItemCounts = Record<HeavyItemKey, number>;

interface Branch {
  _id: Id<"branches">;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phoneNumber: string;
  email?: string;
  pricingPerKg: number;
  deliveryFee: number;
  isActive: boolean;
  createdAt: number;
}

function Counter({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-30 transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-8 text-center font-semibold text-sm tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function OrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();
  const { clerkUser, convexUser } = useCurrentCustomer();

  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [clothesCount, setClothesCount] = useState<number>(0);
  const [heavyItems, setHeavyItems] = useState<HeavyItemCounts>({ jeans: 0, duvet: 0, towel: 0 });
  const [hasWhites, setHasWhites] = useState<boolean | null>(null);
  const [washSeparately, setWashSeparately] = useState(true);
  const [mixDisclaimer, setMixDisclaimer] = useState(false);
  const [separateDisclaimer, setSeparateDisclaimer] = useState(false);
  const [branchId, setBranchId] = useState<string>('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '', name: '', email: '', hall: '', room: '',
    deliveryAddress: '', deliveryPhone: '', notes: '',
  });

  const branches = (useQuery(api.branches.getActive, {}) ?? []) as Branch[];
  const dbServices = useQuery(api.services.getActive) ?? [];
  const createOrder = useMutation(api.orders.createOnline);

  useEffect(() => {
    if (convexUser && isAuthenticated) {
      setCustomerInfo(prev => ({
        ...prev,
        name: convexUser.name || clerkUser?.fullName || '',
        phone: convexUser.phoneNumber || '',
        email: convexUser.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '',
      }));
    }
  }, [convexUser, clerkUser, isAuthenticated]);

  useEffect(() => {
    const serviceFromUrl = searchParams.get('service');
    if (serviceFromUrl && dbServices.length > 0) {
      const service = (dbServices as any[]).find(s => s.code === serviceFromUrl);
      if (service) setServiceType(serviceFromUrl as ServiceType);
    }
  }, [searchParams, dbServices]);

  useEffect(() => {
    if ((dbServices as any[]).length > 0 && !serviceType) {
      setServiceType((dbServices as any[])[0].code as ServiceType);
    }
  }, [dbServices, serviceType]);

  const selectedDbService = (dbServices as any[]).find(s => s.code === serviceType);

  // Weight: 0.3kg per regular item + heavy item weights
  const heavyItemsWeight = HEAVY_ITEMS.reduce(
    (total, item) => total + heavyItems[item.key] * item.weightPerItem, 0
  );
  const estimatedWeight = clothesCount * 0.3 + heavyItemsWeight;

  // Whites washed separately = 1 extra load
  const extraLoadsForWhites = hasWhites && washSeparately ? 1 : 0;

  let estimatedLoads = 1;
  let estimatedPrice = 0;
  if (selectedDbService) {
    if (selectedDbService.pricingType === 'per_kg') {
      estimatedPrice = estimatedWeight * selectedDbService.basePrice;
    } else {
      estimatedLoads = Math.ceil(estimatedWeight / 8) + extraLoadsForWhites;
      estimatedLoads = Math.max(1, estimatedLoads);
      estimatedPrice = estimatedLoads * selectedDbService.basePrice;
    }
  }

  const updateHeavyItem = (key: HeavyItemKey, value: number) => {
    setHeavyItems(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return serviceType !== null;
      case 1: return clothesCount > 0;
      case 2:
        if (hasWhites === null) return false;
        if (hasWhites === false) return true;
        return washSeparately ? separateDisclaimer : mixDisclaimer;
      case 3: return branchId !== '';
      case 4:
        if (isAuthenticated && convexUser) return true;
        return !!(customerInfo.phone && customerInfo.name && customerInfo.email && customerInfo.hall && customerInfo.room);
      default: return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmitOrder();
    }
  };

  const handleSubmitOrder = async () => {
    if (!serviceType || !branchId) { toast.error('Please complete all required fields'); return; }
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: customerInfo.name || convexUser?.name || clerkUser?.fullName || '',
        customerPhoneNumber: customerInfo.phone || convexUser?.phoneNumber || '',
        customerEmail: customerInfo.email || convexUser?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '',
        branchId: branchId as Id<"branches">,
        serviceType,
        estimatedWeight,
        itemCount: clothesCount,
        estimatedLoads,
        whitesSeparate: hasWhites ? washSeparately : false,
        isDelivery,
        deliveryAddress: isDelivery ? customerInfo.deliveryAddress : undefined,
        deliveryPhoneNumber: isDelivery ? (customerInfo.deliveryPhone || customerInfo.phone) : undefined,
        deliveryHall: isDelivery ? customerInfo.hall : undefined,
        deliveryRoom: isDelivery ? customerInfo.room : undefined,
        notes: customerInfo.notes || undefined,
      };
      const result = await createOrder(orderData as any);
      setOrderNumber(result.orderNumber);
      toast.success('Order placed successfully!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(msg || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const copyOrderCode = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success('Order code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (orderNumber) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-2xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">Your order has been created successfully</p>
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 mb-8">
              <p className="text-sm text-muted-foreground mb-2">Your Order Number</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-display font-bold text-gradient break-all">{orderNumber}</span>
                <button onClick={copyOrderCode} className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
                  {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-4 sm:p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
                Next Steps
              </h3>
              <ol className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                {[
                  'Bring your clothes to the selected branch',
                  `Show your order number ${orderNumber} to the attendant`,
                  'Your clothes will be weighed and final price calculated',
                  'Pay and receive your bag tag',
                ].map((step, i) => (
                  <li key={i} className="flex gap-2 sm:gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated && (
                <Button variant="outline" onClick={() => router.push('/dashboard/orders')} className="w-full sm:w-auto">View My Orders</Button>
              )}
              <Button variant="outline" onClick={() => router.push(orderNumber ? `/track?order=${orderNumber}` : '/track')} className="w-full sm:w-auto">Track Order</Button>
              <Button onClick={() => router.push('/')} className="w-full sm:w-auto">Back to Home</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Place Your Order</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Fill in the details below to get started</p>
        </div>

        <div className="mb-8 sm:mb-12 w-full">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 md:p-8 min-h-[400px]">

          {/* Step 0: Service */}
          {currentStep === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6">Select Your Service</h2>
              {dbServices === undefined ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading services...</p>
                </div>
              ) : (dbServices as any[]).length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl border border-border">
                  <p className="text-muted-foreground mb-2">No services available</p>
                  <p className="text-sm text-muted-foreground">Please check back later or contact support</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(dbServices as any[]).map(service => {
                    const getIcon = (code: string) => {
                      if (code.includes('wash') && code.includes('dry')) return Sparkles;
                      if (code.includes('wash')) return Droplets;
                      if (code.includes('dry')) return Wind;
                      return Sparkles;
                    };
                    return (
                      <ServiceCard
                        key={service._id}
                        icon={getIcon(service.code)}
                        title={service.name}
                        description={service.description || ''}
                        isSelected={serviceType === service.code}
                        onClick={() => setServiceType(service.code as ServiceType)}
                        price={service.pricingType === 'per_kg'
                          ? `₵${service.basePrice.toFixed(2)}/kg`
                          : `₵${service.basePrice.toFixed(2)}/load`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Clothes + Heavy Items */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-display font-semibold mb-1">How Many Clothes?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your regular items, then tell us about any heavier pieces below.
              </p>

              <div className="max-w-md mx-auto mb-8">
                <Label htmlFor="clothesCount" className="text-sm text-muted-foreground">
                  Regular clothing items (shirts, underwear, socks, etc.)
                </Label>
                <Input
                  id="clothesCount"
                  type="number"
                  min="0"
                  value={clothesCount || ''}
                  onChange={(e) => setClothesCount(parseInt(e.target.value) || 0)}
                  className="mt-2 text-2xl font-display h-16 text-center"
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ~0.3 kg per item · we'll weigh everything at check-in
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <p className="text-sm font-medium text-foreground mb-1">Any heavier items?</p>
                <p className="text-xs text-muted-foreground mb-4">
                  These weigh more than regular clothes — add them for a better price estimate.
                </p>
                <div className="space-y-3">
                  {HEAVY_ITEMS.map(item => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">~{item.weightPerItem} kg each</p>
                        </div>
                      </div>
                      <Counter
                        value={heavyItems[item.key]}
                        onChange={(v) => updateHeavyItem(item.key, v)}
                      />
                    </div>
                  ))}
                </div>

                {estimatedWeight > 0 && (
                  <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="w-4 h-4 text-primary flex-shrink-0" />
                      Estimated total weight
                    </div>
                    <span className="font-bold text-primary text-lg">~{estimatedWeight.toFixed(1)} kg</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Whites */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6">Do You Have Whites?</h2>
              <div className="max-w-md mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => { setHasWhites(true); setSeparateDisclaimer(false); setMixDisclaimer(false); }}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${hasWhites === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <span className="text-3xl sm:text-4xl mb-2 block">👕</span>
                    <span className="font-medium text-sm sm:text-base">Yes, I have whites</span>
                  </button>
                  <button
                    onClick={() => { setHasWhites(false); setSeparateDisclaimer(false); setMixDisclaimer(false); }}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${hasWhites === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <span className="text-3xl sm:text-4xl mb-2 block">🎨</span>
                    <span className="font-medium text-sm sm:text-base">No whites</span>
                  </button>
                </div>

                {hasWhites && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground">Would you like us to wash your whites separately?</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setWashSeparately(true); setMixDisclaimer(false); setSeparateDisclaimer(false); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${washSeparately ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <span className="font-medium">Wash separately</span>
                        <span className="block text-sm text-muted-foreground">Recommended to prevent color bleeding</span>
                      </button>
                      <button
                        onClick={() => { setWashSeparately(false); setSeparateDisclaimer(false); setMixDisclaimer(false); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${!washSeparately ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <span className="font-medium">Mix with colors</span>
                        <span className="block text-sm text-muted-foreground">Faster but may cause color transfer</span>
                      </button>
                    </div>

                    {/* Separate wash disclaimer — warns about extra charge */}
                    {washSeparately && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-fade-in">
                        <Checkbox
                          id="separate-disclaimer"
                          checked={separateDisclaimer}
                          onCheckedChange={(checked) => setSeparateDisclaimer(checked as boolean)}
                        />
                        <Label htmlFor="separate-disclaimer" className="text-sm cursor-pointer leading-relaxed">
                          I understand that washing whites separately is counted as an{' '}
                          <strong>extra load</strong> and will <strong>incur an additional charge</strong>{' '}
                          at the per-load rate. The attendant will confirm the final price at check-in.
                        </Label>
                      </div>
                    )}

                    {/* Mix disclaimer — warns about color transfer */}
                    {!washSeparately && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 animate-fade-in">
                        <Checkbox
                          id="mix-disclaimer"
                          checked={mixDisclaimer}
                          onCheckedChange={(checked) => setMixDisclaimer(checked as boolean)}
                        />
                        <Label htmlFor="mix-disclaimer" className="text-sm cursor-pointer leading-relaxed">
                          I understand that mixing whites with colors may cause color bleeding,
                          and I accept responsibility for any color transfer.
                        </Label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Branch & Delivery */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6">Select Branch & Delivery</h2>
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <Label htmlFor="branch">Select Branch *</Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch: Branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Where will you drop off your clothes?</p>
                </div>
                <div className="space-y-3">
                  <Label>Delivery Option</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsDelivery(false)}
                      className="p-4 rounded-xl border-2 transition-all text-left border-primary bg-primary/5"
                    >
                      <span className="font-medium block mb-1">Self Service</span>
                      <span className="text-xs text-muted-foreground">You drop off your laundry and pick it up yourself.</span>
                    </button>
                    {['Drop-off + Delivery', 'Pickup + Self Pick', 'Full Service'].map(option => (
                      <button key={option} disabled className="p-4 rounded-xl border-2 text-left border-border bg-muted/30 opacity-60 cursor-not-allowed relative">
                        <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
                          Coming soon
                        </span>
                        <span className="font-medium block mb-1 text-muted-foreground">{option}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3 bg-muted/50 rounded-lg p-3">
                    Delivery and pickup services are coming soon. WashLab currently operates as self-service only.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Customer Details */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6">Your Details</h2>
              <div className="max-w-md mx-auto space-y-4">
                {isAuthenticated && convexUser ? (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Using your account information:</p>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {convexUser.name || clerkUser?.fullName}</p>
                      <p><strong>Phone:</strong> {convexUser.phoneNumber}</p>
                      {(convexUser.email || clerkUser?.emailAddresses?.[0]?.emailAddress) && (
                        <p><strong>Email:</strong> {convexUser.email || clerkUser?.emailAddresses?.[0]?.emailAddress}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      To update your info, visit your{' '}
                      <Link href="/dashboard/profile" className="text-primary hover:underline">profile page</Link>.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="0XX XXX XXXX" className="mt-1" required />
                      <p className="text-xs text-muted-foreground mt-1">We'll use this to send you updates via WhatsApp</p>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} placeholder="your.email@example.com" className="mt-1" required />
                      <p className="text-xs text-muted-foreground mt-1">Required for guest orders. Used to link your order to your account when you register.</p>
                    </div>
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Enter your full name" className="mt-1" required />
                    </div>
                  </>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hall">Hall / Hostel *</Label>
                    <Input id="hall" value={customerInfo.hall} onChange={(e) => setCustomerInfo({ ...customerInfo, hall: e.target.value })} placeholder="e.g. Akuafo Hall" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="room">Room Number *</Label>
                    <Input id="room" value={customerInfo.room} onChange={(e) => setCustomerInfo({ ...customerInfo, room: e.target.value })} placeholder="e.g. A302" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea id="notes" value={customerInfo.notes} onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })} placeholder="Any special instructions?" className="mt-1" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-2">Order Summary</h2>
              <p className="text-sm text-muted-foreground mb-5">Review everything before placing your order.</p>

              {/* Price may differ banner */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30 mb-6">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-warning">Prices may differ at the station</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All estimates below are based on the information you've entered. Your clothes will be
                    physically weighed at check-in and the final price confirmed then. The amount shown
                    here is a guide only.
                  </p>
                </div>
              </div>

              <div className="max-w-md mx-auto">
                {/* Details table */}
                <div className="rounded-xl border border-border overflow-hidden mb-6">
                  {[
                    { label: 'Service', value: selectedDbService?.name || serviceType?.replace('_', ' & ') },
                    { label: 'Regular items', value: `${clothesCount} pieces (~${(clothesCount * 0.3).toFixed(1)} kg)` },
                    // Show each heavy item that has a count > 0
                    ...HEAVY_ITEMS.filter(item => heavyItems[item.key] > 0).map(item => ({
                      label: item.label,
                      value: `${heavyItems[item.key]} ${item.emoji} (~${(heavyItems[item.key] * item.weightPerItem).toFixed(1)} kg)`,
                    })),
                    { label: 'Est. Total Weight', value: `~${estimatedWeight.toFixed(1)} kg` },
                    // Only show loads row for per_load pricing
                    ...(selectedDbService?.pricingType !== 'per_kg' ? [{
                      label: 'Est. Wash Cycles',
                      value: `${estimatedLoads} cycle${estimatedLoads !== 1 ? 's' : ''}${extraLoadsForWhites > 0 ? ' (incl. 1 extra for whites)' : ''}`,
                    }] : []),
                    {
                      label: 'Whites',
                      value: hasWhites
                        ? washSeparately ? 'Separate wash (+1 cycle)' : 'Mixed with colors'
                        : 'None',
                    },
                    { label: 'Branch', value: branches.find(b => b._id === branchId)?.name || 'Not selected' },
                    { label: 'Delivery', value: 'Self Service' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start py-3 px-4 border-b border-border last:border-b-0 gap-4">
                      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
                      <span className="text-sm font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Estimated total */}
                <div className="bg-primary/5 rounded-xl p-4 mb-5 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-base font-semibold">Estimated Total</span>
                      {selectedDbService && selectedDbService.pricingType !== 'per_kg' && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {estimatedLoads} cycle{estimatedLoads !== 1 ? 's' : ''} × ₵{selectedDbService.basePrice.toFixed(2)}/cycle
                        </p>
                      )}
                    </div>
                    <span className="text-2xl font-display font-bold text-gradient">
                      ₵{estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery to */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium mb-2 text-sm">Delivery To:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isAuthenticated && convexUser
                      ? <>{convexUser.name || clerkUser?.fullName}<br />{customerInfo.hall}, Room {customerInfo.room}<br />{convexUser.phoneNumber}</>
                      : <>{customerInfo.name}<br />{customerInfo.hall}, Room {customerInfo.room}<br />{customerInfo.phone}</>
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 mt-8">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSubmitting} className="w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed() || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              : currentStep === STEPS.length - 1 ? 'Place Order' : 'Continue'
            }
            {!isSubmitting && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    }>
      <OrderPageContent />
    </Suspense>
  );
}