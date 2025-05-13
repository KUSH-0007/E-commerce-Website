import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductDetail from "@/pages/product-detail";
import CheckoutPage from "@/pages/checkout-page";
import AdminProducts from "@/pages/admin/products";
import AddProduct from "@/pages/admin/add-product";
import EditProduct from "@/pages/admin/edit-product";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/product/:id" component={ProductDetail} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/admin/products" component={AdminProducts} admin />
      <ProtectedRoute path="/admin/products/add" component={AddProduct} admin />
      <ProtectedRoute path="/admin/products/edit/:id" component={EditProduct} admin />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
