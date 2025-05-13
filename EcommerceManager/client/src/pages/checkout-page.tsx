import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutData } from "@shared/schema";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Calendar,
  Lock,
  User,
  Home,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  // Store order details to display after order completion
  const [orderDetails, setOrderDetails] = useState<{
    items: typeof cartItems;
    subtotal: number;
    shipping: number;
    total: number;
  } | null>(null);

  // Fixed shipping cost
  const shippingCost = cartItems.length > 0 ? 4.99 : 0;
  const totalAmount = cartTotal + shippingCost;

  // Checkout form
  const form = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  // Place order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutData) => {
      const orderData = {
        userId: user?.id,
        status: "pending",
        totalAmount,
        shippingAddress: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
        createdAt: new Date().toISOString(),
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.discountPrice || item.price
        }))
      };
      
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      // Save order details before clearing the cart
      setOrderDetails({
        items: [...cartItems], // Create a copy of the cart items
        subtotal: cartTotal,
        shipping: shippingCost,
        total: totalAmount
      });
      setOrderId(data.id);
      setOrderComplete(true);
      clearCart();
    },
  });

  const onSubmit = (data: CheckoutData) => {
    orderMutation.mutate(data);
  };

  // Redirect if cart is empty and order not complete
  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before proceeding to checkout.
            </p>
            <Button onClick={() => navigate("/")} className="mx-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Order success screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. Your order #{orderId} has been confirmed.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Order #{orderId}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orderDetails?.items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>${((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderDetails?.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${orderDetails?.shipping.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${orderDetails?.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate("/")} className="mr-2">
                  Continue Shopping
                </Button>
                <Button variant="outline" onClick={() => navigate("/orders")}>
                  View Orders
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>

          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="md:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder="John Doe" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground">@</span>
                                <Input className="pl-10" placeholder="email@example.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Home className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder="123 Main St" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input className="pl-10" placeholder="10001" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                      <CardDescription>All transactions are secure and encrypted.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  className="pl-10" 
                                  placeholder="1234 5678 9012 3456" 
                                  maxLength={19}
                                  {...field}
                                  onChange={(e) => {
                                    // Format card number with spaces
                                    const val = e.target.value.replace(/\s/g, "");
                                    const formattedVal = val.replace(/(.{4})/g, "$1 ").trim();
                                    field.onChange(formattedVal);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input 
                                    className="pl-10" 
                                    placeholder="MM/YY" 
                                    maxLength={5}
                                    {...field}
                                    onChange={(e) => {
                                      // Format expiry date with slash
                                      const val = e.target.value.replace(/\//g, "");
                                      if (val.length <= 2) {
                                        field.onChange(val);
                                      } else {
                                        const formattedVal = `${val.slice(0, 2)}/${val.slice(2)}`;
                                        field.onChange(formattedVal);
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardCvc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input 
                                    className="pl-10" 
                                    placeholder="123" 
                                    maxLength={3}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {orderMutation.isError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {orderMutation.error?.message || "There was an error processing your order. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={orderMutation.isPending}
                  >
                    {orderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      `Complete Order - $${totalAmount.toFixed(2)}`
                    )}
                  </Button>
                </form>
              </Form>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="max-h-80 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex items-center py-2 border-b">
                          <div className="h-12 w-12 rounded bg-muted mr-3 overflow-hidden">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-sm font-medium">
                                ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${shippingCost.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium py-1">
                        <span>Total</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Secure checkout powered by ShopEase</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
