"use client"

import { useState, useEffect } from 'react';
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
import { api } from '@devlider001/washlab-backend/api';
import { useCurrentCustomer } from '@/hooks/use-current-customer';
import { PRICING_CONFIG, getServiceById, calculateLoads } from '@/config/pricing';
import { 
  Droplets, 
  Wind, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Copy,
  Check,
  MapPin,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '@devlider001/washlab-backend/dataModel';

const STEPS = ['Service', 'Clothes', 'Whites', 'Branch & Delivery', 'Details', 'Summary'];

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

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();
  const { clerkUser, convexUser } = useCurrentCustomer();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // Form state
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [clothesCount, setClothesCount] = useState<number>(0);
  const [hasWhites, setHasWhites] = useState<boolean | null>(null);
  const [washSeparately, setWashSeparately] = useState(true);
  const [mixDisclaimer, setMixDisclaimer] = useState(false);
  const [branchId, setBranchId] = useState<string>('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    name: '',
    email: '',
    hall: '',
    room: '',
    deliveryAddress: '',
    deliveryPhone: '',
    notes: '',
  });

  // Get active branches
  const branches = (useQuery(
    api.branches.getActive,
    {} // Public query, no auth needed
  ) ?? []) as Branch[];

  // Create order mutation
  const createOrder = useMutation(api.orders.createOnline);

  // Pre-fill customer info if authenticated
  useEffect(() => {
    if (convexUser && isAuthenticated) {
      setCustomerInfo(prev => ({
        ...prev,
        name: convexUser.name || clerkUser?.fullName || '',
        phone: convexUser.phoneNumber || '',
        email: convexUser.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '',
        hall: convexUser.preferredBranchId ? '' : prev.hall,
      }));
    }
  }, [convexUser, clerkUser, isAuthenticated]);

  // Check URL params for pre-selected service
  useEffect(() => {
    const serviceFromUrl = searchParams.get('service');
    if (serviceFromUrl && ['wash_only', 'wash_and_dry', 'dry_only'].includes(serviceFromUrl)) {
      setServiceType(serviceFromUrl as ServiceType);
    }
  }, [searchParams]);

  // Calculate pricing
  const selectedService = serviceType ? getServiceById(serviceType) : null;
  const pricePerLoad = selectedService?.price || PRICING_CONFIG.services[1].price;
  const estimatedWeight = clothesCount * 0.3;
  const estimatedLoads = calculateLoads(estimatedWeight) || 1;
  const estimatedPrice = estimatedLoads * pricePerLoad;

  const canProceed = () => {
    switch (currentStep) {
      case 0: return serviceType !== null;
      case 1: return clothesCount > 0;
      case 2: return hasWhites !== null && (hasWhites === false || washSeparately || mixDisclaimer);
      case 3: return branchId !== '' && (isDelivery ? customerInfo.deliveryAddress : true);
      case 4: {
        if (isAuthenticated && convexUser) {
          return true; // If authenticated, use stored data
        }
        // For guest checkout, email is required for account matching
        return customerInfo.phone && customerInfo.name && customerInfo.email && customerInfo.hall && customerInfo.room;
      }
      default: return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit order
      await handleSubmitOrder();
    }
  };

  const handleSubmitOrder = async () => {
    if (!serviceType || !branchId) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Note: customerEmail is required by backend but types haven't regenerated yet
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
      // Note: customerEmail is required by backend but types haven't regenerated yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createOrder(orderData as any);

      setOrderNumber(result.orderNumber);
      toast.success('Order placed successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Order creation error:', errorMessage);
      toast.error(errorMessage || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyOrderCode = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success('Order code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
              Your order has been created successfully
            </p>

            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 mb-8">
              <p className="text-sm text-muted-foreground mb-2">Your Order Number</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-display font-bold text-gradient break-all">{orderNumber}</span>
                <button
                  onClick={copyOrderCode}
                  className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                >
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
                <li className="flex gap-2 sm:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  <span>Bring your clothes to the selected branch</span>
                </li>
                <li className="flex gap-2 sm:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  <span>Show your order number <strong className="break-all">{orderNumber}</strong> to the attendant</span>
                </li>
                <li className="flex gap-2 sm:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  <span>Your clothes will be weighed and final price calculated</span>
                </li>
                <li className="flex gap-2 sm:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">4</span>
                  <span>Pay and receive your bag tag</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated && (
                <Button variant="outline" onClick={() => router.push('/dashboard/orders')} className="w-full sm:w-auto">
                  View My Orders
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => router.push(orderNumber ? `/track?order=${orderNumber}` : '/track')} 
                className="w-full sm:w-auto"
              >
                Track Order
              </Button>
              <Button onClick={() => router.push('/')} className="w-full sm:w-auto">
                Back to Home
              </Button>
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
          {/* Step 0: Service Selection */}
          {currentStep === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6">Select Your Service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {PRICING_CONFIG.services.map(service => (
                  <ServiceCard
                    key={service.id}
                    icon={service.id === 'wash_and_dry' ? Sparkles : service.id === 'wash_only' ? Droplets : Wind}
                    title={service.label}
                    description={service.description}
                    isSelected={serviceType === service.id}
                    onClick={() => setServiceType(service.id as ServiceType)}
                    price={`₵${service.price}${service.unit}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Clothes Count */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-display font-semibold mb-6">How Many Clothes?</h2>
              <div className="max-w-md mx-auto">
                <Label htmlFor="clothesCount" className="text-sm text-muted-foreground">
                  Enter the approximate number of clothing items
                </Label>
                <Input
                  id="clothesCount"
                  type="number"
                  min="1"
                  value={clothesCount || ''}
                  onChange={(e) => setClothesCount(parseInt(e.target.value) || 0)}
                  className="mt-2 text-2xl font-display h-16 text-center"
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Don&apos;t worry about being exact — we&apos;ll weigh everything at check-in
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Whites Handling */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6">Do You Have Whites?</h2>
              <div className="max-w-md mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setHasWhites(true)}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                      hasWhites === true
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl mb-2 block">👕</span>
                    <span className="font-medium text-sm sm:text-base">Yes, I have whites</span>
                  </button>
                  <button
                    onClick={() => setHasWhites(false)}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                      hasWhites === false
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl mb-2 block">🎨</span>
                    <span className="font-medium text-sm sm:text-base">No whites</span>
                  </button>
                </div>

                {hasWhites && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground">
                      Would you like us to wash your whites separately?
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setWashSeparately(true); setMixDisclaimer(false); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          washSeparately
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">Wash separately</span>
                        <span className="block text-sm text-muted-foreground">
                          Recommended to prevent color bleeding
                        </span>
                      </button>
                      <button
                        onClick={() => setWashSeparately(false)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          !washSeparately
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">Mix with colors</span>
                        <span className="block text-sm text-muted-foreground">
                          Faster but may cause color transfer
                        </span>
                      </button>
                    </div>

                    {!washSeparately && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 animate-fade-in">
                        <Checkbox
                          id="disclaimer"
                          checked={mixDisclaimer}
                          onCheckedChange={(checked) => setMixDisclaimer(checked as boolean)}
                        />
                        <Label htmlFor="disclaimer" className="text-sm cursor-pointer">
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
              <div className="max-w-md mx-auto space-y-6">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Where will you drop off your clothes?
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Delivery Option</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsDelivery(false)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        !isDelivery
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="font-medium block">Pickup</span>
                      <span className="text-xs text-muted-foreground">I&apos;ll collect myself</span>
                    </button>
                    <button
                      onClick={() => setIsDelivery(true)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isDelivery
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="font-medium block">Delivery</span>
                      <span className="text-xs text-muted-foreground">Deliver to my location</span>
                    </button>
                  </div>
                </div>

                {isDelivery && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                      <Textarea
                        id="deliveryAddress"
                        value={customerInfo.deliveryAddress}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, deliveryAddress: e.target.value })}
                        placeholder="Full address for delivery"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryPhone">Delivery Phone Number</Label>
                      <Input
                        id="deliveryPhone"
                        type="tel"
                        value={customerInfo.deliveryPhone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, deliveryPhone: e.target.value })}
                        placeholder="If different from your phone"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
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
                      If you need to update your information, visit your{' '}
                      <Link href="/dashboard/profile" className="text-primary hover:underline">
                        profile page
                      </Link>
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        placeholder="0XX XXX XXXX"
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        We&apos;ll use this to send you updates via WhatsApp
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for guest orders. Used to link your order to your account when you register.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="mt-1"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hall">Hall / Hostel *</Label>
                    <Input
                      id="hall"
                      value={customerInfo.hall}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, hall: e.target.value })}
                      placeholder="e.g. Akuafo Hall"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room">Room Number *</Label>
                    <Input
                      id="room"
                      value={customerInfo.room}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, room: e.target.value })}
                      placeholder="e.g. A302"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Any special instructions?"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-4 sm:mb-6">Order Summary</h2>
              <div className="max-w-md mx-auto">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium capitalize">{serviceType?.replace('_', ' & ')}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">{clothesCount} pieces</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Est. Weight</span>
                    <span className="font-medium">~{estimatedWeight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Est. Loads</span>
                    <span className="font-medium">{estimatedLoads}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Whites</span>
                    <span className="font-medium">
                      {hasWhites ? (washSeparately ? 'Separate wash' : 'Mixed') : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-medium text-right">
                      {branches.find((b) => b._id === branchId)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">
                      {isDelivery ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Yes
                        </span>
                      ) : (
                        'Pickup'
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Estimated Total</span>
                    <span className="text-2xl font-display font-bold text-gradient">
                      ₵{estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Final price will be calculated after weighing at check-in
                  </p>
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium mb-2">Delivery To:</h4>
                  <p className="text-sm text-muted-foreground">
                    {isAuthenticated && convexUser ? (
                      <>
                        {convexUser.name || clerkUser?.fullName}<br />
                        {customerInfo.hall}, Room {customerInfo.room}<br />
                        {convexUser.phoneNumber}
                      </>
                    ) : (
                      <>
                        {customerInfo.name}<br />
                        {customerInfo.hall}, Room {customerInfo.room}<br />
                        {customerInfo.phone}
                      </>
                    )}
                    {isDelivery && customerInfo.deliveryAddress && (
                      <>
                        <br />
                        <span className="text-xs">{customerInfo.deliveryAddress}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStep === STEPS.length - 1 ? (
              'Place Order'
            ) : (
              'Continue'
            )}
            {!isSubmitting && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
