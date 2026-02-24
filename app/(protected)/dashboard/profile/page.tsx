'use client';

import { useState } from 'react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '@jordan6699/washlab-backend/api';
import { Id } from '@jordan6699/washlab-backend/dataModel';
import { useCurrentCustomer } from '@/hooks/use-current-customer';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Package,
  CheckCircle,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { clerkUser, isLoading } = useCurrentCustomer();
  const { isAuthenticated } = useConvexAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Get customer profile
  const customerProfile = useQuery(
    api.customers.getProfile,
    isAuthenticated ? {} : "skip"
  );

  // Get loyalty points
  const loyaltyInfo = useQuery(
    api.customers.getLoyaltyPoints,
    isAuthenticated ? {} : "skip"
  ) ?? {
    points: 0,
    totalEarned: 0,
    totalRedeemed: 0,
  };

  // Get active branches
  const branches = useQuery(
    api.branches.getActive,
    isAuthenticated ? {} : "skip"
  ) ?? [];

  // Stats from profile
  const stats = {
    totalOrders: customerProfile?.orderCount ?? 0,
    completedOrders: customerProfile?.completedOrderCount ?? 0,
    totalSpent: 0, // Would need to add this to profile query
  };

  
  const updateProfile = useMutation(api.customers.updateProfile);

  // Initialize formData
  const [formData, setFormData] = useState({
    name: customerProfile?.name || '',
    phoneNumber: customerProfile?.phoneNumber || '',
    email: customerProfile?.email || '',
    preferredBranchId: customerProfile?.preferredBranchId || '',
  });

  // Reset formData when entering edit mode with current profile data
  const handleEditClick = () => {
    if (!isEditing && customerProfile) {
      setFormData({
        name: customerProfile.name || '',
        phoneNumber: customerProfile.phoneNumber || '',
        email: customerProfile.email || '',
        preferredBranchId: customerProfile.preferredBranchId || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      // Only send fields that have been changed and have non-empty values
      const updates: {
        name?: string;
        phoneNumber?: string;
        email?: string;
        preferredBranchId?: Id<"branches">;
      } = {};

      // Only update name if it's not empty and different from current
      if (formData.name.trim() && formData.name.trim() !== customerProfile?.name) {
        updates.name = formData.name.trim();
      }

      // Only update phoneNumber if it's not empty and different from current
      if (formData.phoneNumber.trim() && formData.phoneNumber.trim() !== customerProfile?.phoneNumber) {
        updates.phoneNumber = formData.phoneNumber.trim();
      }

      // Only update email if it's not empty and different from current (or if currently empty)
      if (formData.email.trim()) {
        if (formData.email.trim() !== customerProfile?.email) {
          updates.email = formData.email.trim();
        }
      } else if (customerProfile?.email) {
        // Allow clearing email by sending undefined
        updates.email = undefined;
      }

      // Only update preferredBranchId if it's different from current
      if (formData.preferredBranchId) {
        const branchId = formData.preferredBranchId as Id<"branches">;
        if (branchId !== customerProfile?.preferredBranchId) {
          updates.preferredBranchId = branchId;
        }
      } else if (customerProfile?.preferredBranchId) {
        // Allow clearing preferredBranchId
        updates.preferredBranchId = undefined;
      }

      // Only call mutation if there are actual updates
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.info('No changes to save');
        setIsEditing(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const userInitials =
    clerkUser?.firstName?.[0] && clerkUser?.lastName?.[0]
      ? `${clerkUser.firstName[0]}${clerkUser.lastName[0]}`
      : clerkUser?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U';

  const memberSince = customerProfile?.createdAt
    ? new Date(customerProfile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const getAccountStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary', label: string }> = {
      active: { variant: 'default', label: 'Active' },
      blocked: { variant: 'destructive', label: 'Blocked' },
      suspended: { variant: 'destructive', label: 'Suspended' },
      restricted: { variant: 'secondary', label: 'Restricted' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading || !customerProfile) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <CardTitle className="text-2xl">{customerProfile.name}</CardTitle>
                  {getAccountStatusBadge(customerProfile.status || 'active')}
                  {customerProfile.isVerified && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Member since {memberSince}
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={handleEditClick}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={isEditing ? formData.name : customerProfile.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={isEditing ? formData.phoneNumber : (customerProfile?.phoneNumber || 'Not provided')}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="0XX XXX XXXX"
                    required={isEditing}
                  />
                </div>
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Phone number must be unique
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : (customerProfile.email || 'Not provided')}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Preferred Branch */}
              <div>
                <Label htmlFor="branch">Preferred Branch</Label>
                {isEditing ? (
                  <Select
                    value={formData.preferredBranchId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, preferredBranchId: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={
                        branches.find((b) => b._id === customerProfile.preferredBranchId)
                          ?.name || 'Not set'
                      }
                      disabled
                      className="pl-10"
                    />
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Account Statistics
              </CardTitle>
              <CardDescription>Your laundry journey so far</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <span className="font-bold">{stats.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Completed Orders</span>
                </div>
                <span className="font-bold">{stats.completedOrders}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <span className="font-bold">₵{stats.totalSpent.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Information */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Loyalty Program
              </CardTitle>
              <CardDescription>Your rewards and points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-blue-200 dark:border-blue-800">
                <span className="text-sm">Current Points</span>
                <span className="text-2xl font-bold text-blue-600">
                  {loyaltyInfo.points}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-blue-200 dark:border-blue-800">
                <span className="text-sm">Total Points Earned</span>
                <span className="font-bold">{loyaltyInfo.totalEarned}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-blue-200 dark:border-blue-800">
                <span className="text-sm">Total Points Redeemed</span>
                <span className="font-bold">{loyaltyInfo.totalRedeemed}</span>
              </div>
              <div className="pt-2">
                <div className="h-3 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{
                      width: `${Math.min((loyaltyInfo.points / 100) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Keep earning points with every order!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}

