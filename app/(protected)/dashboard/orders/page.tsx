
'use client';

import { useState } from 'react';
import { useQuery, useConvexAuth } from 'convex/react';
import { api } from '@devlider001/washlab-backend/api';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTable } from '@/components/customer/OrderTable';
import {
  Package,
  Search,
  Filter,
  Calendar,
  FileText,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePaginatedQuery } from 'convex/react';
import { Doc } from '@devlider001/washlab-backend/dataModel';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Doc<"orders"> | null>(null);

  // Get active services for filter
  const dbServices = useQuery(api.services.getActive) ?? [];

  // Get all orders for the customer with pagination
  const {
    results: ordersPages,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.customers.getOrders,
    isAuthenticated ? {} : "skip",
    { initialNumItems: 50 }
  );
  const allOrders = ordersPages?.flat() ?? [];
  const isLoading = paginationStatus === "LoadingFirstPage" || paginationStatus === "LoadingMore";
  const hasMore = paginationStatus === "CanLoadMore";

  // Filter orders
  const filteredOrders = allOrders.filter((order: Doc<"orders">) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Handle status filter with legacy status mapping
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        matchesStatus = order.status === 'pending' || order.status === 'pending_dropoff';
      } else if (statusFilter === 'in_progress') {
        matchesStatus = ['in_progress', 'checked_in', 'sorting', 'washing', 'drying', 'folding'].includes(order.status);
      } else if (statusFilter === 'ready_for_pickup') {
        matchesStatus = order.status === 'ready' || order.status === 'ready_for_pickup';
      } else if (statusFilter === 'delivered') {
        matchesStatus = order.status === 'delivered' || order.status === 'completed';
      } else {
        matchesStatus = order.status === statusFilter;
      }
    }
    
    const matchesServiceType =
      serviceTypeFilter === 'all' || order.serviceType === serviceTypeFilter;
    return matchesSearch && matchesStatus && matchesServiceType;
  });

  // Map backend status to frontend OrderStatus type for StatusBadge
  const mapStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      // New statuses
      pending_dropoff: "pending_dropoff",
      checked_in: "checked_in",
      sorting: "sorting",
      washing: "washing",
      drying: "drying",
      folding: "folding",
      ready: "ready",
      completed: "completed",
      cancelled: "cancelled",
      // Legacy statuses
      pending: "pending_dropoff",
      in_progress: "washing",
      ready_for_pickup: "ready",
      delivered: "out_for_delivery",
    };
    return statusMap[status] || "pending_dropoff";
  };

  return (
    <CustomerLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Orders</h1>
          <p className='text-muted-foreground mt-2'>
            Track and manage all your laundry orders
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className='pt-6'>
            <div className='grid gap-4 md:grid-cols-3'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search by order number...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='pending_dropoff'>Pending Dropoff</SelectItem>
                  <SelectItem value='checked_in'>Checked In</SelectItem>
                  <SelectItem value='sorting'>Sorting</SelectItem>
                  <SelectItem value='washing'>Washing</SelectItem>
                  <SelectItem value='drying'>Drying</SelectItem>
                  <SelectItem value='folding'>Folding</SelectItem>
                  <SelectItem value='ready'>Ready</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                  {/* Legacy statuses */}
                  <SelectItem value='pending'>Pending (Legacy)</SelectItem>
                  <SelectItem value='in_progress'>In Progress (Legacy)</SelectItem>
                  <SelectItem value='ready_for_pickup'>Ready for Pickup (Legacy)</SelectItem>
                  <SelectItem value='delivered'>Delivered (Legacy)</SelectItem>
                </SelectContent>
              </Select>

              {/* Service Type Filter */}
              <Select
                value={serviceTypeFilter}
                onValueChange={setServiceTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All Services' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Services</SelectItem>
                  {dbServices.map(service => (
                    <SelectItem key={service._id} value={service.code}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <OrderTable
          orders={filteredOrders}
          isLoading={isLoading && allOrders.length === 0}
          onViewDetails={setSelectedOrder}
        />

        {/* Load More */}
        {hasMore && filteredOrders.length > 0 && (
          <div className='flex justify-center mt-6'>
            <Button
              variant='outline'
              onClick={() => loadMore(50)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Loading...
                </>
              ) : (
                "Load More Orders"
              )}
            </Button>
          </div>
        )}

        {/* Empty State (when no orders and no filters) */}
        {!isLoading &&
          filteredOrders.length === 0 &&
          !searchQuery &&
          statusFilter === "all" &&
          serviceTypeFilter === "all" && (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Package className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='font-semibold text-lg mb-2'>No orders found</h3>
                <p className='text-muted-foreground mb-4 text-center'>
                  You haven&apos;t placed any orders yet
                </p>
                <Button onClick={() => router.push("/order")}>
                  <Package className='mr-2 h-4 w-4' />
                  Place Your First Order
                </Button>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={true} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Order Details - {selectedOrder.orderNumber}
              </DialogTitle>
              <DialogDescription>{selectedOrder.orderNumber}</DialogDescription>
            </DialogHeader>

            <div className='space-y-6'>
              {/* Status */}
              <div>
                <h3 className='text-sm font-medium mb-2'>Status</h3>
                <StatusBadge status={mapStatus(selectedOrder.status) as any} />
              </div>

              {/* Service Details */}
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <h3 className='text-sm font-medium mb-2'>Service Type</h3>
                  <p className='text-sm capitalize'>
                    {selectedOrder.serviceType.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium mb-2'>Order Type</h3>
                  <p className='text-sm capitalize'>
                    {selectedOrder.orderType.replace(/_/g, " ")}
                  </p>
                </div>
                {selectedOrder.actualWeight && (
                  <div>
                    <h3 className='text-sm font-medium mb-2'>Weight</h3>
                    <p className='text-sm'>{selectedOrder.actualWeight} kg</p>
                  </div>
                )}
                {selectedOrder.itemCount && (
                  <div>
                    <h3 className='text-sm font-medium mb-2'>Items</h3>
                    <p className='text-sm'>{selectedOrder.itemCount} items</p>
                  </div>
                )}
              </div>

              {/* Delivery Details */}
              {selectedOrder.isDelivery && (
                <div>
                  <h3 className='text-sm font-medium mb-2'>Delivery Address</h3>
                  <div className='rounded-lg bg-muted p-3 text-sm space-y-1'>
                    {selectedOrder.deliveryHall && (
                      <p>{selectedOrder.deliveryHall}</p>
                    )}
                    {selectedOrder.deliveryRoom && (
                      <p>Room: {selectedOrder.deliveryRoom}</p>
                    )}
                    {selectedOrder.deliveryAddress && (
                      <p>{selectedOrder.deliveryAddress}</p>
                    )}
                    {selectedOrder.deliveryPhoneNumber && (
                      <p>Phone: {selectedOrder.deliveryPhoneNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className='text-sm font-medium mb-2'>Notes</h3>
                  <p className='text-sm text-muted-foreground'>
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Pricing */}
              <div>
                <h3 className='text-sm font-medium mb-2'>Pricing</h3>
                <div className='rounded-lg border p-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Base Price</span>
                    <span>â‚µ{selectedOrder.basePrice.toFixed(2)}</span>
                  </div>
                  {selectedOrder.deliveryFee > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span>Delivery Fee</span>
                      <span>â‚µ{selectedOrder.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.finalPrice < selectedOrder.totalPrice && (
                    <div className='flex justify-between text-sm text-green-600'>
                      <span>Discount</span>
                      <span>
                        -â‚µ
                        {(
                          selectedOrder.totalPrice - selectedOrder.finalPrice
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between font-bold text-lg pt-2 border-t'>
                    <span>Total</span>
                    <span>â‚µ{selectedOrder.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className='grid gap-4 sm:grid-cols-2 text-xs text-muted-foreground'>
                <div>
                  <p className='font-medium mb-1'>Created</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                {selectedOrder.status === "completed" && (
                  <div>
                    <p className='font-medium mb-1'>Completed</p>
                    <p>
                      {new Date(
                        selectedOrder.statusHistory.find(
                          (entry) => entry.status === "completed"
                        )?.changedAt || selectedOrder.updatedAt
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <Button
                className='w-full'
                onClick={() =>
                  router.push(`/track?order=${selectedOrder.orderNumber}`)
                }
              >
                Track This Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </CustomerLayout>
  )
}

