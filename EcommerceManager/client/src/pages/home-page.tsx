import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  Dumbbell, 
  Gift, 
  MoreHorizontal,
  ShoppingBag,
  ArrowRight 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [location, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get("category") || "all");
  const [sortOption, setSortOption] = useState<string>("featured");

  // Update URL when category changes
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    if (activeCategory && activeCategory !== "all") {
      newParams.set("category", activeCategory);
    } else {
      newParams.delete("category");
    }
    
    const search = newParams.toString();
    const newUrl = search ? `/?${search}` : "/";
    
    // Only update if URL actually changed to avoid unnecessary history entries
    if (newUrl !== location) {
      navigate(newUrl, { replace: true });
    }
  }, [activeCategory, location, navigate]);

  // Fetch products
  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: featuredProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: newProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/new"],
  });

  // Filter and sort products
  const getFilteredProducts = () => {
    if (!allProducts) return [];
    
    let filtered = [...allProducts];
    
    // Filter by category
    if (activeCategory && activeCategory !== "all") {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    // Filter by search term
    const searchTerm = searchParams.get("search");
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term)
      );
    }
    
    // Sort products
    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered = filtered.filter(product => product.isNew).concat(
          filtered.filter(product => !product.isNew)
        );
        break;
      // Default is featured
      default:
        filtered = filtered.filter(product => product.isFeatured).concat(
          filtered.filter(product => !product.isFeatured)
        );
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const categories = [
    { id: "all", name: "All Products", icon: <ShoppingBag className="text-primary text-4xl mb-2" /> },
    { id: "Electronics", name: "Electronics", icon: <Smartphone className="text-primary text-4xl mb-2" /> },
    { id: "Fashion", name: "Fashion", icon: <Shirt className="text-primary text-4xl mb-2" /> },
    { id: "Home", name: "Home", icon: <HomeIcon className="text-primary text-4xl mb-2" /> },
    { id: "Sports", name: "Sports", icon: <Dumbbell className="text-primary text-4xl mb-2" /> },
    { id: "Toys", name: "Toys", icon: <Gift className="text-primary text-4xl mb-2" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Banner */}
        <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
          <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-primary to-primary-dark overflow-hidden">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-6 md:px-12 py-6 md:w-1/2 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Summer Tech Sale</h1>
                <p className="text-lg md:text-xl mb-4">Up to 40% off on all electronics and accessories</p>
                <p className="text-sm md:text-base mb-6">Limited time offer. Get the latest gadgets at unbeatable prices.</p>
                <Button 
                  onClick={() => navigate("/?category=Electronics")}
                  className="bg-accent hover:bg-accent-light text-white rounded-full px-6 py-2 font-medium transition-colors duration-200"
                >
                  Shop Now
                </Button>
              </div>
              <div className="hidden md:block md:w-1/2 relative">
                {/* We're using position absolute to simulate the overlap from the design */}
                <div className="absolute right-0 max-w-xs rounded-lg transform rotate-3 shadow-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1608343375770-fa368a1afb14?q=80&w=2070&auto=format&fit=crop" 
                    alt="Electronics gadgets collection" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute right-48 bottom-4 max-w-xs rounded-lg transform -rotate-6 shadow-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                    alt="Red sneakers" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className={`p-4 text-center transition-transform hover:scale-105 cursor-pointer ${
                  activeCategory === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardContent className="p-0 flex flex-col items-center justify-center">
                  {category.icon}
                  <div className="font-medium">{category.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        {!searchParams.get("category") && !searchParams.get("search") && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Featured Products</h2>
              <Button variant="link" className="text-primary hover:text-primary-dark font-medium flex items-center text-sm p-0" onClick={() => navigate("/?sort=featured")}>
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoading ? (
                // Skeleton loading state
                Array(4).fill(0).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : featuredProducts ? (
                featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-4 text-center py-8">
                  <p>No featured products available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Arrivals */}
        {!searchParams.get("category") && !searchParams.get("search") && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">New Arrivals</h2>
              <Button variant="link" className="text-primary hover:text-primary-dark font-medium flex items-center text-sm p-0" onClick={() => navigate("/?sort=newest")}>
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoading ? (
                // Skeleton loading state
                Array(4).fill(0).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : newProducts ? (
                newProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-4 text-center py-8">
                  <p>No new products available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promotional Banner */}
        {!searchParams.get("category") && !searchParams.get("search") && (
          <div className="mb-8 bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-accent to-pink-700 text-white p-6 md:p-0 md:flex">
              <div className="md:w-1/2 md:p-8 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Exclusive Offer</h2>
                <p className="mb-4">Get free shipping on all orders over $50. Limited time only!</p>
                <div className="flex">
                  <Button 
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="bg-white text-accent hover:bg-gray-100"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
              <div className="hidden md:block md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="Online shopping with laptop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Listings */}
        {(searchParams.get("category") || searchParams.get("search") || 
          searchParams.get("sort") || activeCategory !== "all") && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-medium">
                {searchParams.get("search") 
                  ? `Search Results for "${searchParams.get("search")}"`
                  : activeCategory !== "all" 
                    ? categories.find(c => c.id === activeCategory)?.name || "Products"
                    : "All Products"}
              </h2>
              
              <div className="flex items-center">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchParams.get("search") 
                    ? `We couldn't find any products matching "${searchParams.get("search")}"`
                    : "No products available in this category"}
                </p>
                <Button onClick={() => {
                  setActiveCategory("all");
                  searchParams.delete("search");
                  navigate("/");
                }}>
                  View All Products
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="bg-white rounded-lg p-6 md:p-8 shadow mb-8">
          <div className="md:flex md:items-center">
            <div className="mb-4 md:mb-0 md:flex-1">
              <h2 className="text-xl font-medium mb-2">Subscribe to Our Newsletter</h2>
              <p className="text-muted-foreground">Get the latest updates, exclusive offers, and special discounts delivered to your inbox.</p>
            </div>
            <div className="md:flex-1">
              <form className="flex flex-col sm:flex-row">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary flex-grow mb-2 sm:mb-0 sm:mr-2"
                />
                <Button className="bg-accent hover:bg-accent-light text-white font-medium">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-10 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium text-lg mb-4">ShopEase</h3>
              <p className="text-primary-light mb-4">Your one-stop shop for all your shopping needs. Quality products at competitive prices.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-primary-light hover:text-white">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-dark hover:bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </span>
                </a>
                <a href="#" className="text-primary-light hover:text-white">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-dark hover:bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </span>
                </a>
                <a href="#" className="text-primary-light hover:text-white">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-dark hover:bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </span>
                </a>
                <a href="#" className="text-primary-light hover:text-white">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-dark hover:bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-primary-light hover:text-white">All Products</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Featured Items</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">New Arrivals</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Special Offers</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Coming Soon</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-primary-light hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">FAQs</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Shipping Policy</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Returns & Exchanges</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Track Your Order</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">About</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-primary-light hover:text-white">Our Story</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Blog</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Press</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Careers</a></li>
                <li><a href="#" className="text-primary-light hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-primary-dark flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-light text-sm mb-4 md:mb-0">© 2023 ShopEase. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="25" viewBox="0 0 40 25" fill="none" className="h-6">
                <rect width="40" height="25" rx="4" fill="#1A1F71" />
                <path d="M15.3 16.7H12.7L14.2 8.3H16.8L15.3 16.7ZM22.8 8.5C22.2 8.3 21.5 8.1 20.6 8.1C18.3 8.1 16.7 9.3 16.7 11C16.7 12.3 17.8 13 18.7 13.4C19.6 13.8 19.9 14.1 19.9 14.5C19.9 15.1 19.2 15.4 18.5 15.4C17.6 15.4 17.1 15.3 16.3 14.9L16 14.8L15.7 17C16.4 17.3 17.6 17.5 18.8 17.5C21.3 17.5 22.8 16.3 22.8 14.5C22.8 13.5 22.2 12.7 20.8 12.2C19.9 11.9 19.4 11.6 19.4 11.2C19.4 10.8 19.8 10.4 20.7 10.4C21.5 10.4 22 10.5 22.5 10.7L22.7 10.8L23 8.5H22.8ZM28.5 8.3H26.5C26 8.3 25.6 8.4 25.3 8.9L21.7 16.7H24.3C24.3 16.7 24.7 15.7 24.8 15.5H27.9C28 15.8 28.2 16.7 28.2 16.7H30.5L28.5 8.3ZM25.4 13.6C25.6 13.1 26.5 10.8 26.5 10.8C26.5 10.8 26.7 10.3 26.8 10L27 10.7C27 10.7 27.6 13.2 27.7 13.6H25.4Z" fill="white" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="25" viewBox="0 0 40 25" fill="none" className="h-6">
                <rect width="40" height="25" rx="4" fill="#EB001B" />
                <circle cx="15" cy="12.5" r="5" fill="#EB001B" />
                <circle cx="25" cy="12.5" r="5" fill="#F79E1B" />
                <path d="M20 8.75C18.1 10.3 17 12.5 17 15C17 17.5 18.1 19.7 20 21.25C21.9 19.7 23 17.5 23 15C23 12.5 21.9 10.3 20 8.75Z" fill="#FF5F00" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="25" viewBox="0 0 40 25" fill="none" className="h-6">
                <rect width="40" height="25" rx="4" fill="#003087" />
                <path d="M15.5 10H17C17.8 10 18.3 10.3 18.2 11.1C18 12.5 17 12.8 15.8 12.8H15.3L15.5 10ZM13 16H14.7L15 14.3H16.5C18.5 14.3 19.7 13.3 20 11.2C20.3 8.9 18.8 8 16.8 8H13.8L12 16H13Z" fill="#FFFFFF" />
                <path d="M21 16H22.7L23.8 10H22.1L21 16ZM22.2 9H23.9L24.2 8H22.5L22.2 9Z" fill="#FFFFFF" />
                <path d="M25.5 13L26 10.6C26 10.6 24.7 10 23.9 10C23.1 10 21 10.4 21 12C21 13.4 23.3 13.3 23.3 14C23.3 14.7 21 14.5 20.3 14L19.8 16.3C19.8 16.3 21 16.8 22.5 16.8C24 16.8 26 16 26 14.3C26 12.9 23.7 12.8 23.7 12.1C23.7 11.6 25.1 11.8 25.5 13Z" fill="#FFFFFF" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="25" viewBox="0 0 40 25" fill="none" className="h-6">
                <rect width="40" height="25" rx="4" fill="#000000" />
                <path d="M22.2 16.4C19.6 16.4 17.5 14.3 17.5 11.7C17.5 9.1 19.6 7 22.2 7C24.8 7 26.9 9.1 26.9 11.7C26.9 14.3 24.8 16.4 22.2 16.4Z" fill="#FFFFFF" />
                <path d="M15.5 16.4C15 16.4 14.5 16.3 14.1 16.2L12.8 18H11.2L12.9 15.6C12.2 14.6 11.8 13.3 11.8 11.8C11.8 8.2 14.2 5.6 17.5 5.6C20.8 5.6 23.2 8.2 23.2 11.8C23.2 15.4 20.8 18 17.5 18C16.8 18 16.1 17.9 15.5 17.7" fill="#FFFFFF" />
              </svg>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
