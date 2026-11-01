'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';

export interface SubscriptionFlyer {
  url: string;
  title?: string;
}

/** undefined = loading, null = no flyer uploaded, object = flyer to show */
export function useSubscriptionFlyer(): SubscriptionFlyer | null | undefined {
  return useQuery((api as any).subscriptions.getFlyer) as SubscriptionFlyer | null | undefined;
}

/** One full phone-screen slide: the flyer with a Buy now button. */
export function SubscriptionFlyerSlide({ flyer }: { flyer: SubscriptionFlyer }) {
  return (
    <div className="relative w-full h-full flex flex-col bg-white">
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flyer.url}
          alt={flyer.title ?? 'WashLab subscription packages'}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </div>
      <div className="px-3 pt-3 pb-6 bg-white">
        <Link
          href="/subscribe"
          className="block w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md"
        >
          Buy now
        </Link>
      </div>
    </div>
  );
}

export default SubscriptionFlyerSlide;
