import React, { createContext, useReducer, useContext, ReactNode, useEffect } from "react";
import { CartItem, cartItemSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type CartState = {
  items: CartItem[];
  total: number;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: number } }
  | { type: "CLEAR_CART" };

type CartContextType = {
  cartItems: CartItem[];
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      } else {
        // Item doesn't exist, add it
        const newItems = [...state.items, action.payload];
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
        };
      }
    }
    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      // Ensure quantity is at least 1
      const validQuantity = Math.max(1, quantity);
      
      const updatedItems = state.items.map((item) =>
        item.productId === productId ? { ...item, quantity: validQuantity } : item
      );
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(
        (item) => item.productId !== action.payload.productId
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
      };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to load cart from localStorage on initialization
  const initialState: CartState = {
    items: [],
    total: 0,
  };

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart.items)) {
          // Validate each item
          const validItems: CartItem[] = [];
          parsedCart.items.forEach((item: any) => {
            try {
              const validItem = cartItemSchema.parse(item);
              validItems.push(validItem);
            } catch (e) {
              console.error("Invalid cart item:", e);
            }
          });
          dispatch({ type: "CLEAR_CART" });
          validItems.forEach(item => {
            dispatch({ type: "ADD_ITEM", payload: item });
          });
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { toast } = useToast();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
      duration: 2000,
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: state.items,
        cartTotal: state.total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
