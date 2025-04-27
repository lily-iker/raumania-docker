"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DeliveryStatus, type OrderSummary } from "@/types/order"
import { Package, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Status badge component
const DeliveryStatusBadge = ({ status }: { status: DeliveryStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case DeliveryStatus.DELIVERING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case DeliveryStatus.PREPARING:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case DeliveryStatus.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200"
      case DeliveryStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={`${getStatusColor()} px-3 py-1 rounded-full text-xs font-medium`}>{status}</Badge>
}

interface OrderCardProps {
  order: OrderSummary
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/orders/${order.orderId}`)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="bg-gray-50 p-4 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Order #{order.orderId.substring(0, 8)}</h3>
        </div>
        <DeliveryStatusBadge status={order.deliveryStatus} />
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">{order.productVariantName}</h4>
            <div className="text-sm text-gray-500 mt-1">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {order.productVariantSize && <span>Size: {order.productVariantSize}</span>}
                {order.productVariantScent && <span>Scent: {order.productVariantScent}</span>}
                <span>Quantity: {order.quantity}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleViewDetails}>
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
