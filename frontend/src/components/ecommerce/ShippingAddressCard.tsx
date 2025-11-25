'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ShippingAddress } from '@/types/order.types';
import { cn } from '@/lib/utils';

interface ShippingAddressCardProps {
  address: ShippingAddress | string;
  title?: string;
  className?: string;
}

/**
 * ShippingAddressCard Component
 * 
 * Display shipping address information
 * Mobile-First responsive card with contact details
 * Handles both object and JSON string address formats
 * 
 * @param address - Shipping address (object or JSON string)
 * @param title - Card title (default: "Địa chỉ giao hàng")
 * @param className - Additional CSS classes
 */
export function ShippingAddressCard({
  address,
  title = 'Địa chỉ giao hàng',
  className,
}: ShippingAddressCardProps) {
  // Parse address if it's a JSON string
  const shippingAddress: ShippingAddress =
    typeof address === 'string' ? JSON.parse(address) : address;

  // Build full address string
  const fullAddress = [
    shippingAddress?.address,
    shippingAddress?.ward,
    shippingAddress?.district,
    shippingAddress?.city,
  ]
    .filter(Boolean)
    .join(', ');

  const recipientName =
    shippingAddress?.name || shippingAddress?.fullName || 'N/A';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm pt-0">
        {/* Recipient Name */}
        <p className="font-medium text-gray-900 text-sm sm:text-base">
          {recipientName}
        </p>

        {/* Phone Number */}
        {shippingAddress?.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {shippingAddress.phone}
            </span>
          </div>
        )}

        {/* Email (if available) */}
        {shippingAddress?.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm break-all">
              {shippingAddress.email}
            </span>
          </div>
        )}

        {/* Full Address */}
        {fullAddress && (
          <div className="flex items-start gap-2 text-gray-600 pt-1">
            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm leading-relaxed">
              {fullAddress}
            </span>
          </div>
        )}

        {/* Postal Code (if available) */}
        {shippingAddress?.postalCode && (
          <div className="text-xs text-gray-500 pl-5">
            Mã bưu chính: {shippingAddress.postalCode}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
