import { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const [location, navigate] = useLocation();
  
  // Fixed shipping cost
  const shippingCost = cartItems.length > 0 ? 4.99 : 0;
  const orderTotal = cartTotal + shippingCost;

  const handleCheckout = () => {
    navigate("/checkout");
    onClose();
  };

  const handleUpdateQuantity = (productId: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateQuantity(productId, newQuantity);
  };

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-lg flex flex-col drawer-transition ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 bg-primary text-white flex justify-between items-center">
        <h2 className="font-medium text-lg">Your Cart</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-primary-dark focus:outline-none focus:bg-primary-dark ripple"
          aria-label="Close cart"
        >
          <X size={20} />
        </button>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <ShoppingBag size={64} className="text-muted mb-4" />
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-center mb-4">
            Add items to your cart to see them here.
          </p>
          <Button onClick={() => {
            navigate("/");
            onClose();
          }}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.productId} className="py-4 flex items-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <div className="flex items-center mt-1">
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                        className="p-1 text-muted-foreground hover:text-accent ripple"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                        className="p-1 text-muted-foreground hover:text-accent ripple"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                      <span className="ml-auto font-medium">
                        ${(item.discountPrice || item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="ml-2 p-1 text-muted-foreground hover:text-accent ripple"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">${shippingCost.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg mb-4">
              <span className="font-medium">Total</span>
              <span className="font-medium">${orderTotal.toFixed(2)}</span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-accent hover:bg-accent-light ripple"
            >
              Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
