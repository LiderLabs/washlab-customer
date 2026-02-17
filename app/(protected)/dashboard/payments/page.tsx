'use client';

import { useState } from 'react';
import { usePaginatedQuery, useQuery, useConvexAuth } from 'convex/react';
import { api } from '@devlider001/washlab-backend/api';
import { Doc } from '@devlider001/washlab-backend/dataModel';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentTable } from '@/components/customer/PaymentTable';
import { PaymentDetailsDialog } from '@/components/customer/PaymentDetailsDialog';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Loader2,
  Filter,
} from 'lucide-react';

type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"

type PaymentMethod = "mobile_money" | "card" | "cash"

const PAYMENTS_LIMIT = 20

export default function PaymentsPage() {
  const { isAuthenticated } = useConvexAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<
    (Doc<"payments"> & {
      order?: Doc<"orders"> | null
    }) | null
  >(null);

  // Get payments with pagination
  const {
    results: paymentsPages,
    status: paginationStatus,
    loadMore,
  } =
  usePaginatedQuery(
    api.payments.getByCustomer,
    isAuthenticated ? {} : "skip",
    { initialNumItems: PAYMENTS_LIMIT }
  );

  const allPayments = paymentsPages?.flat() ?? [];
  const isLoading = paginationStatus === "LoadingFirstPage" || paginationStatus === "LoadingMore";
  const hasMore = paginationStatus === "CanLoadMore";

  // Payments already include order details from the backend query
  const payments = allPayments;

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesMethod = selectedMethod === 'all' || payment.paymentMethod === selectedMethod;
    return matchesStatus && matchesMethod;
  });

  // Calculate stats
  const stats = {
    total: filteredPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    count: filteredPayments.length,
    completed: filteredPayments.filter((p) => p.status === 'completed').length,
    pending: filteredPayments.filter((p) => p.status === 'pending').length,
  };

  const handleViewDetails = (payment: Doc<"payments">) => {
    const paymentWithDetails = filteredPayments.find((p) => p._id === payment._id);
    setSelectedPayment(paymentWithDetails || payment);
  };

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSelectedMethod('all');
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground mt-2">
            View all your payment transactions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{stats.total.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All completed payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.count}</div>
              <p className="text-xs text-muted-foreground">All payments</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Successful payments</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Loader2 className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <PaymentTable
          payments={filteredPayments}
          isLoading={isLoading && filteredPayments.length === 0}
          onViewDetails={handleViewDetails}
        />

        {/* Load More */}
        {hasMore && filteredPayments.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => loadMore(PAYMENTS_LIMIT)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Payments"
              )}
            </Button>
          </div>
        )}

        {/* Payment Details Dialog */}
        {selectedPayment && (
          <PaymentDetailsDialog
            payment={selectedPayment}
            open={!!selectedPayment}
            onOpenChange={(open) => !open && setSelectedPayment(null)}
          />
        )}
      </div>
    </CustomerLayout>
  );
}

