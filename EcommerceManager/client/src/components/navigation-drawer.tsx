import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  ShoppingBag, 
  Tag, 
  Info, 
  Package, 
  User, 
  Heart, 
  History, 
  Settings, 
  LogOut,
  FileSliders
} from "lucide-react";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-lg drawer-transition ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 bg-primary text-white">
        <div className="flex items-center">
          <ShoppingBag className="mr-2" />
          <span className="font-medium text-lg">ShopEase</span>
        </div>
      </div>
      <div className="py-2">
        <button onClick={() => handleNavigation("/")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
          <Home className="mr-2 h-5 w-5 text-muted-foreground" />
          <span>Home</span>
        </button>
        <button onClick={() => handleNavigation("/?category=all")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
          <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
          <span>Products</span>
        </button>
        <button onClick={() => handleNavigation("/?category=Electronics")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
          <FileSliders className="mr-2 h-5 w-5 text-muted-foreground" />
          <span>Electronics</span>
        </button>
        <button onClick={() => handleNavigation("/?category=Fashion")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
          <Tag className="mr-2 h-5 w-5 text-muted-foreground" />
          <span>Fashion</span>
        </button>
        <button onClick={() => handleNavigation("/?category=Home")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
          <Home className="mr-2 h-5 w-5 text-muted-foreground" />
          <span>Home</span>
        </button>
        <button onClick={() => handleNavigation("/about")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
          <Info className="mr-2 h-5 w-5 text-muted-foreground" />
          <span>About</span>
        </button>
        
        <div className="border-t border-gray-200 my-2"></div>
        
        {user ? (
          <>
            <button onClick={() => handleNavigation("/profile")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
              <User className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>My Account</span>
            </button>
            <button onClick={() => handleNavigation("/wishlist")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
              <Heart className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>Wishlist</span>
            </button>
            <button onClick={() => handleNavigation("/orders")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
              <History className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>Order History</span>
            </button>
            
            {user.isAdmin && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <button onClick={() => handleNavigation("/admin/products")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
                  <Package className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span>Manage Products</span>
                </button>
                <button onClick={() => handleNavigation("/admin/orders")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span>Manage Orders</span>
                </button>
              </>
            )}
            
            <div className="border-t border-gray-200 my-2"></div>
            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
              <LogOut className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <button onClick={() => handleNavigation("/auth")} className="w-full text-left block px-4 py-2 hover:bg-gray-100 flex items-center">
            <User className="mr-2 h-5 w-5 text-muted-foreground" />
            <span>Login / Register</span>
          </button>
        )}
      </div>
    </div>
  );
}
