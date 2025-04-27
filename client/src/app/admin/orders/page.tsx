"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import useOrderStore from "@/stores/useOrderStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"
import { Order, OrderStatus, PaymentStatus, DeliveryStatus, UpdateOrderStatusRequest } from "@/types/order"

export default function OrdersPage() {
  const {
    orders,
    statusCounts,
    totalPages,
    currentPage,
    isLoading,
    fetchOrders,
    fetchOrderStatistics,
    updateOrderStatus,
    deleteOrder,
  } = useOrderStore()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusForm, setStatusForm] = useState<UpdateOrderStatusRequest>({
    orderStatus: undefined,
    paymentStatus: undefined,
    deliveryStatus: undefined,
  })

  useEffect(() => {
    fetchOrders()
    fetchOrderStatistics()
  }, [fetchOrders, fetchOrderStatistics])

  const handlePageChange = (page: number) => {
    fetchOrders({ page })
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setStatusForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedOrderId) {
      await deleteOrder(selectedOrderId)
      setIsDeleteDialogOpen(false)
      setSelectedOrderId(null)
    }
  }

  const handleStatusChange = (field: string, value: OrderStatus | PaymentStatus | DeliveryStatus) => {
    setStatusForm((prev) => ({ 
      ...prev, 
      [field]: value 
    }))
  }

  const handleStatusUpdate = async () => {
    if (selectedOrder) {
      await updateOrderStatus(selectedOrder.id, statusForm)
      setIsEditDialogOpen(false)
      setSelectedOrder(null)
      window.location.reload()
    }
  }

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Badge variant="outline">Pending</Badge>
      case OrderStatus.PROCESSING:
        return <Badge variant="secondary">Packaging</Badge>
      case "SHIPPED" as any: // For backward compatibility
        return <Badge variant="secondary">Shipped</Badge>
      case "DELIVERED" as any: // For backward compatibility
        return <Badge variant="success">Completed</Badge>
      case "CANCELLED" as OrderStatus:
      case "CANCELED" as any: // For backward compatibility
        return <Badge variant="destructive">Canceled</Badge>
      case OrderStatus.DELIVERED:
        return <Badge variant="success">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Unpaid</Badge>
      case "PAID" as any: // For backward compatibility
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>
      case "REFUNDED" as any: // For backward compatibility
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Refund</Badge>
      case PaymentStatus.FAILED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>
      case PaymentStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader title="Orders" description="Manage and track customer orders" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Order Pending</h3>
                  <p className="text-2xl font-semibold mt-1">{statusCounts?.orderStatus?.PENDING || 0}</p>
                </div>
                <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Order Cancel</h3>
                  <p className="text-2xl font-semibold mt-1">{statusCounts?.orderStatus.CANCELLED || statusCounts?.orderStatus.CANCELLED || 0}</p>
                </div>
                <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                <h3 className="text-gray-500 text-sm font-medium">Order Processing</h3>
                <p className="text-2xl font-semibold mt-1">{statusCounts?.orderStatus.PROCESSING || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                <h3 className="text-gray-500 text-sm font-medium">Order Completed</h3>
                <p className="text-2xl font-semibold mt-1">{statusCounts?.orderStatus.DELIVERED || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">ORDERS LIST</h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Created at</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.orderNumber || order.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-blue-500">{order.userName}</TableCell>
                          <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => handleEditOrder(order)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                             
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-end">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(currentPage - 1)}
                            aria-disabled={currentPage === 1}
                          >
                            Previous
                          </PaginationLink>
                        </PaginationItem>

                        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                          const page = currentPage <= 2 ? i + 1 : currentPage - 1 + i
                          if (page > totalPages) return null
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)}>
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}

                        {totalPages > 3 && currentPage < totalPages - 1 && (
                          <>
                            {currentPage < totalPages - 2 && <PaginationItem>...</PaginationItem>}
                            <PaginationItem>
                              <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                            </PaginationItem>
                          </>
                        )}

                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(currentPage + 1)}
                            aria-disabled={currentPage === totalPages}
                          >
                            Next
                          </PaginationLink>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">#{selectedOrder.orderNumber || selectedOrder.id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <div className="mt-1">{getOrderStatusBadge(selectedOrder.orderStatus)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <div className="mt-1">{getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                          
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-xs text-gray-500">{item.productVariantName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="orderStatus">Order Status</Label>
                <Select
                  value={statusForm.orderStatus}
                  onValueChange={(value) => handleStatusChange("orderStatus", value as OrderStatus)}
                >
                  <SelectTrigger id="orderStatus">
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md rounded-md">
                    <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>Completed</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={statusForm.paymentStatus}
                  onValueChange={(value) => handleStatusChange("paymentStatus", value as PaymentStatus)}
                >
                  <SelectTrigger id="paymentStatus">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md rounded-md">
                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                    <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deliveryStatus">Delivery Status</Label>
                <Select
                  value={statusForm.deliveryStatus}
                  onValueChange={(value) => handleStatusChange("deliveryStatus", value as DeliveryStatus)}
                >
                  <SelectTrigger id="deliveryStatus">
                    <SelectValue placeholder="Select delivery status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md rounded-md">
                    <SelectItem value={DeliveryStatus.DELIVERING}>Processing</SelectItem>
                    <SelectItem value={DeliveryStatus.PREPARING}>Preparing</SelectItem>
                    <SelectItem value={DeliveryStatus.DELIVERED}>Shipped</SelectItem>
                    <SelectItem value={DeliveryStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this order? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}