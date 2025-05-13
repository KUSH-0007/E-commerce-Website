import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Search, 
  ShoppingCart, 
  User,
  LogOut,
  Package,
  Settings
} from "lucide-react";
import NavigationDrawer from "./navigation-drawer";
import CartDrawer from "./cart-drawer";

export default function Header() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();

  const { user, logoutMutation } = useAuth();
  const { itemCount } = useCart();

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen || isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, isCartOpen]);

  return (
    <>
      <header className="bg-primary text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                className="p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:bg-primary-dark md:hidden ripple"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <Link href="/" className="flex items-center ml-2 md:ml-0">
                <ShoppingCart className="mr-2" />
                <span className="font-medium text-lg">ShopEase</span>
              </Link>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 font-medium ripple">
                Home
              </Link>
              <Link href="/?category=all" className="px-3 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 font-medium ripple">
                Products
              </Link>
              <Link href="/?category=Electronics" className="px-3 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 font-medium ripple">
                Electronics
              </Link>
              <Link href="/?category=Fashion" className="px-3 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 font-medium ripple">
                Fashion
              </Link>
              <Link href="/?category=Home" className="px-3 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 font-medium ripple">
                Home
              </Link>
            </div>
            
            <div className="flex items-center">
              <div className="relative mx-2 md:mx-4">
                <form onSubmit={handleSearch} className="hidden md:block">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full bg-primary-dark text-white placeholder-primary-light border border-primary-light rounded-full py-1 px-4 focus:outline-none focus:ring-2 focus:ring-accent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <button 
                  className="p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:bg-primary-dark md:hidden ripple"
                  onClick={() => setMobileSearchOpen(!isMobileSearchOpen)}
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              </div>
              
              <button 
                className="p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:bg-primary-dark ripple relative"
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:bg-primary-dark ml-2 ripple" aria-label="User menu">
                      <User size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </DropdownMenuItem>
                    
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin/products")}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Manage Products</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => logoutMutation.mutate()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-white hover:bg-primary-dark"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile search bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full bg-primary-dark text-white placeholder-primary-light border border-primary-light rounded-full py-1 px-4 focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Drawer Overlay */}
      {(isDrawerOpen || isCartOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => {
            setDrawerOpen(false);
            setCartOpen(false);
          }}
        />
      )}
      
      {/* Navigation Drawer */}
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
