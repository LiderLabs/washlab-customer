'use client';

import CustomerLayout from '@/components/customer/CustomerLayout';
import CustomerSubscriptions from '@/components/customer/CustomerSubscriptions';

export default function SubscriptionsPage() {
  return (
    <CustomerLayout>
      <CustomerSubscriptions />
    </CustomerLayout>
  );
}
