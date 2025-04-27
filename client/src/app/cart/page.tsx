"use client"

import { useEffect, useState } from "react"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import useCartStore from "@/stores/useCartStore"
import { useAuthStore } from "@/stores/useAuthStore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Checkbox } from "@/components/ui/checkbox"
import type { Cart, UpdateCartItemRequest } from "@/types/cart"
import { Header } from "@/components/Header"
import clsx from "clsx"

export default function CartPage() {
  const { cart, isLoading, getMyCart, updateCartItem, removeFromCart } = useCartStore()
  const { authUser, fetchAuthUser } = useAuthStore()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [selectedTotal, setSelectedTotal] = useState(0)
  const [updatingItems, setUpdatingItems] = useState<string[]>([])
  const [localCart, setLocalCart] = useState<Cart | null>(null)

  // Check authentication and fetch cart data
  useEffect(() => {
    const initCart = async () => {
      try {
        // First check if user is authenticated
        await fetchAuthUser()

        // If not authenticated, redirect to login
        if (!useAuthStore.getState().authUser) {
          const currentPath = window.location.pathname
          router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
          return
        }

        // If authenticated, fetch cart
        await getMyCart()
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing cart:", error)
        // If there's an error, redirect to login
        const currentPath = window.location.pathname
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      }
    }

    initCart()
  }, [getMyCart, fetchAuthUser, router])

  // Keep a local copy of the cart for optimistic updates
  useEffect(() => {
    if (cart) {
      setLocalCart(cart)
    }
  }, [cart])

  // Initialize selected items when cart loads
  useEffect(() => {
    if (localCart && localCart.cartItems) {
      // Initialize all items as selected
      const initialSelectedState: Record<string, boolean> = {}
      localCart.cartItems.forEach((item) => {
        initialSelectedState[item.id] = true
      })
      setSelectedItems(initialSelectedState)
    }
  }, [localCart])

  // Calculate selected total whenever selections or cart changes
  useEffect(() => {
    if (localCart && localCart.cartItems) {
      const total = localCart.cartItems.reduce((sum, item) => {
        return sum + (selectedItems[item.id] ? item.price * item.quantity : 0)
      }, 0)
      setSelectedTotal(total)
    }
  }, [selectedItems, localCart])

  const handleUpdateQuantity = async (cartItemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change)
    if (newQuantity === currentQuantity) return

    // Check if user is still authenticated
    if (!authUser) {
      toast.error("Please login to update your cart")
      const currentPath = window.location.pathname
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      return
    }

    if (!localCart) return // Handle if no cart

    // Mark this item as updating
    setUpdatingItems((prev) => [...prev, cartItemId])

    // Create a deep copy of the cart for optimistic updates
    const updatedCartItems = localCart.cartItems.map((item) =>
      item.id === cartItemId ? { ...item, quantity: newQuantity } : { ...item },
    )

    // Calculate new total items and price
    const newTotalItems = localCart.totalItems + (newQuantity - currentQuantity)
    const updatedItem = updatedCartItems.find((item) => item.id === cartItemId)
    const priceDifference = updatedItem ? (newQuantity - currentQuantity) * updatedItem.price : 0
    const newTotalPrice = localCart.totalPrice + priceDifference

    // Create updated cart object for local state only
    const updatedLocalCart: Cart = {
      ...localCart,
      cartItems: updatedCartItems,
      totalItems: newTotalItems,
      totalPrice: newTotalPrice,
    }

    // Update local cart state for immediate UI feedback
    setLocalCart(updatedLocalCart)

    try {
      // Prepare the request object according to your store's interface
      const request: UpdateCartItemRequest = {
        cartItemId,
        quantity: newQuantity,
      }

      // Send the update to the server
      await updateCartItem(request)

      // No need to show success toast as your store already does that
    } catch (error) {
      // If there's an error, revert to the original cart
      setLocalCart(cart) // Revert to the original cart from the store
    } finally {
      // Remove this item from updating state
      setUpdatingItems((prev) => prev.filter((id) => id !== cartItemId))
    }
  }

  const handleRemoveItem = async (cartItemId: string) => {
    // Check if user is still authenticated
    if (!authUser) {
      toast.error("Please login to remove items from your cart")
      const currentPath = window.location.pathname
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      return
    }

    if (!localCart) return

    // Optimistically remove the item from UI
    const removedItem = localCart.cartItems.find((item) => item.id === cartItemId)
    if (removedItem) {
      const updatedCartItems = localCart.cartItems.filter((item) => item.id !== cartItemId)
      const newTotalItems = localCart.totalItems - removedItem.quantity
      const newTotalPrice = localCart.totalPrice - removedItem.price * removedItem.quantity

      const updatedLocalCart: Cart = {
        ...localCart,
        cartItems: updatedCartItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      }

      setLocalCart(updatedLocalCart)
    }

    try {
      await removeFromCart(cartItemId)
      // No need to show success toast as your store already does that
    } catch (error) {
      // If there's an error, revert to the original cart
      setLocalCart(cart)
    }
  }

  const handleItemSelection = (itemId: string, isChecked: boolean) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: isChecked,
    }))
  }

  const handleSelectAll = (isChecked: boolean) => {
    if (localCart && localCart.cartItems) {
      const newSelectedState: Record<string, boolean> = {}
      localCart.cartItems.forEach((item) => {
        newSelectedState[item.id] = isChecked
      })
      setSelectedItems(newSelectedState)
    }
  }

  const getSelectedItemIds = () => {
    return Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)
  }

  const handleProceedToCheckout = () => {
    const selectedIds = getSelectedItemIds()
    if (selectedIds.length === 0) {
      toast.error("Please select at least one item to checkout")
      return
    }

    // Navigate to checkout page with selected item IDs
    router.push(`/checkout?items=${selectedIds.join(",")}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // If still checking authentication or loading cart, show loading state
  if (!isInitialized || isLoading) {
    return (
      <Bounded className="min-h-screen bg-brand-gray py-16">
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 animate-spin rounded-full border-4 bg-brand-gray border-t-[#8a9bab]"></div>
        </div>
      </Bounded>
    )
  }

  if (!authUser) {
    return (
      <Bounded className="min-h-screen bg-brand-gray py-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-[#a0aab4] mb-4">Please login to view your cart</p>
            <Link
              href="/login"
              className="inline-flex items-center bg-[#8a9bab] text-white hover:bg-[#c9a689] font-medium transition-colors duration-200 py-3 px-6 rounded-lg"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </Bounded>
    )
  }

  // If authenticated but cart is empty
  if (!localCart || localCart.cartItems.length === 0) {
    return (
      <Bounded className="min-h-screen bg-brand-gray py-16">
        <Heading className="text-center mb-8 text-brand-purple font-mono text-4xl md:text-5xl tracking-wide" as="h1">
          Your Shopping Cart
        </Heading>
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border bg-brand-gray">
          <div className="flex flex-col items-center gap-4">
            <ShoppingBag className="h-16 w-16 text-[#d9c7b8] mb-2" />
            <p className="text-[#a0aab4] mb-8">Your cart is empty</p>
            <Link
              href="/search"
              className="inline-flex items-center bg-[#8a9bab] text-white hover:bg-[#c9a689] font-medium transition-colors duration-200 py-3 px-6 rounded-lg"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Bounded>
    )
  }

  const selectedItemCount = Object.values(selectedItems).filter(Boolean).length

  return (
    <>
    <Header/>

    <Bounded className="min-h-screen bg-brand-gray py-16 text-[#5d6970] font-cormorant">
    <h1
          className={clsx(
            'text-[3rem] md:text-[4rem] font-dancing tracking-tight text-brand-purple drop-shadow-md transition-all duration-700 text-center mt-5 mb-9'
          )}
        >
          Your Cart
        </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#d9c7b8]">
            <div className="p-6 border-b border-[#e9e0d5] flex justify-between items-center bg-[#f9f5f0]">
              <h2 className="text-xl font-medium text-brand-purple">Cart Items ({localCart.totalItems})</h2>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={localCart.cartItems.length > 0 && selectedItemCount === localCart.cartItems.length}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  className="text-[#c9a689] border-[#d9c7b8] focus:ring-[#c9a689]"
                />
                <label htmlFor="select-all" className="text-sm text-brand-purple">
                  Select All
                </label>
              </div>
            </div>

            <div className="divide-y divide-[#e9e0d5]">
              {localCart.cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex flex-col sm:flex-row items-start gap-6 hover:bg-[#f9f5f0] transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`select-${item.id}`}
                      checked={selectedItems[item.id] || false}
                      onCheckedChange={(checked) => handleItemSelection(item.id, checked === true)}
                      className="text-[#c9a689] border-[#d9c7b8] focus:ring-[#c9a689]"
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-brand-purple">{item.productName}</h3>
                    <p className="text-[#a0aab4] text-sm mb-1">{item.variantName}</p>
                    <p className="font-medium text-sm">{formatCurrency(item.price)}</p>
                    <p className="text-[#a0aab4] text-sm mt-2">
                      Subtotal:{" "}
                      <span className="font-medium text-brand-purple">{formatCurrency(item.price * item.quantity)}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center border border-[#e9e0d5] rounded-xl overflow-hidden transition-colors duration-150 bg-white">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        className="p-2 hover:bg-[#f0e6d6] transition-colors duration-150"
                        aria-label="Decrease quantity"
                        disabled={updatingItems.includes(item.id)}
                      >
                        <Minus className="h-4 w-4 text-brand-purple" />
                      </button>
                      <span className="px-4 text-sm font-medium">
                        {updatingItems.includes(item.id) ? (
                          <span className="inline-block w-4 h-4 animate-pulse bg-[#e9e0d5] rounded-full"></span>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        className="p-2 hover:bg-[#f0e6d6] transition-colors duration-150"
                        aria-label="Increase quantity"
                        disabled={updatingItems.includes(item.id)}
                      >
                        <Plus className="h-4 w-4 text-brand-purple" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#c9a689] hover:text-[#b08f6d] flex items-center gap-1 text-sm transition-colors duration-150"
                      disabled={updatingItems.includes(item.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#d9c7b8] sticky top-24">
            <h2 className="text-xl font-semibold mb-6 text-brand-purple font-dancing tracking-wide">Order Summary</h2>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-[#a0aab4]">
                <span>Selected Items</span>
                <span>
                  {selectedItemCount} of {localCart.totalItems}
                </span>
              </div>
              <div className="flex justify-between text-[#a0aab4]">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>
              <div className="flex justify-between text-[#a0aab4]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-[#a0aab4]">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-[#e9e0d5] pt-4 flex justify-between font-medium text-base text-[#5d6970]">
                <span>Total</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-brand-be text-white hover:bg-[#c9a689] py-5 rounded-xl transition-colors duration-200 font-medium"
                onClick={handleProceedToCheckout}
                disabled={selectedItemCount === 0}
              >
                Proceed to Checkout
              </Button>
              <Link
                href="/shop"
                className="block text-center text-[#a0aab4] hover:text-brand-purple transition-colors duration-150 text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Bounded>
    </>
  )
}
