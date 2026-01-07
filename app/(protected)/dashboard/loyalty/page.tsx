'use client';

import CustomerLayout from '@/components/customer/CustomerLayout';
import CustomerLoyaltyPoints from "@/components/customer/CustomerLoyaltyPoints"

export default function LoyaltyPage() {
  return (
    <CustomerLayout>
      <CustomerLoyaltyPoints />
    </CustomerLayout>
  )
}

