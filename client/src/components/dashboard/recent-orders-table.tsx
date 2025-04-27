import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RecentOrder {
  id: string
  customerName: string | null
  orderDate: string
  totalAmount: number
  status: string
  paymentStatus: string
}

interface RecentOrdersTableProps {
  orders: RecentOrder[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 6)}...</TableCell>
                  <TableCell className="max-w-[100px] truncate">{order.customerName || "Anonymous"}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {format(new Date(order.orderDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "COMPLETED"
                          ? "success"
                          : order.status === "PENDING"
                            ? "secondary"
                            : order.status === "CANCELLED"
                              ? "destructive"
                              : "default"
                      }
                      className="whitespace-nowrap"
                    >
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        order.paymentStatus === "COMPLETED"
                          ? "success"
                          : order.paymentStatus === "PENDING"
                            ? "secondary"
                            : order.paymentStatus === "FAILED"
                              ? "destructive"
                              : "default"
                      }
                      className="whitespace-nowrap"
                    >
                      {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
