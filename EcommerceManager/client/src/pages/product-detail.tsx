import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/header";
import { Product } from "@shared/schema";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/hooks/use-auth";
import ReviewForm from "@/components/review-form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  StarHalf,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Minus,
  Plus,
  Heart,
  ShoppingCart,
  AlertCircle,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id);
  const [quantity, setQuantity] = useState(1);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });

  // Fetch product reviews
  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice || undefined,
        imageUrl: product.imageUrl,
        quantity: quantity
      });
    }
  };

  // Generate rating stars
  const renderRatingStars = (rating: number | null) => {
    if (rating === null) rating = 0;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-5 w-5 fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-5 w-5 fill-amber-400 text-amber-400" />);
    }
    
    // Add empty stars to make total of 5
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-5 w-5 text-amber-400" />);
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="md:flex md:space-x-8">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
            <div className="md:w-1/2">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")} className="mx-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="md:flex md:space-x-8">
          {/* Product Image */}
          <div className="md:w-1/2 mb-6 md:mb-0">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div className="md:w-1/2">
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to products
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {renderRatingStars(product.rating)}
              </div>
              <span className="text-muted-foreground">
                {(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
            
            {/* Price */}
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold mr-2">${product.price.toFixed(2)}</span>
              {product.discountPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.discountPrice.toFixed(2)}
                </span>
              )}
              {product.isNew && (
                <Badge className="ml-auto bg-accent text-white">New</Badge>
              )}
            </div>
            
            {/* Description */}
            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>
            
            <Separator className="my-6" />
            
            {/* Quantity selector */}
            {product.inStock ? (
              <>
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Quantity</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-4 w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Add to cart and wishlist buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary-dark"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Add to Wishlist
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <div className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span className="font-medium">Out of Stock</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  This product is currently unavailable. Please check back later or browse similar products.
                </p>
              </div>
            )}
            
            {/* Product benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm">Warranty</span>
              </div>
              <div className="flex items-center">
                <RefreshCcw className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm">30-day Returns</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product details tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full max-w-md grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Product Description</h3>
                  <p className="mb-4">
                    {product.description}
                  </p>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur
                    interdum, nisl nisi consectetur nisi, euismod consectetur nisi nisi euismod.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li>High-quality materials for durability</li>
                    <li>Designed for everyday use</li>
                    <li>Modern and stylish design</li>
                    <li>Versatile functionality</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-b pb-2">
                      <span className="font-medium">Category:</span> {product.category}
                    </div>
                    <div className="border-b pb-2">
                      <span className="font-medium">Brand:</span> ShopEase
                    </div>
                    <div className="border-b pb-2">
                      <span className="font-medium">Color:</span> Various
                    </div>
                    <div className="border-b pb-2">
                      <span className="font-medium">Weight:</span> 0.5 kg
                    </div>
                    <div className="border-b pb-2">
                      <span className="font-medium">Dimensions:</span> 10 x 5 x 3 cm
                    </div>
                    <div className="border-b pb-2">
                      <span className="font-medium">Material:</span> Premium
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                    {user ? (
                      <Button onClick={() => setIsReviewFormOpen(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Write a Review
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => navigate("/auth")}>
                        Login to Review
                      </Button>
                    )}
                  </div>
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-6">
                          <div className="flex items-center mb-2">
                            <div className="flex mr-2">
                              {renderRatingStars(review.rating)}
                            </div>
                            <span className="font-medium">{review.username}</span>
                          </div>
                          <p className="text-muted-foreground mb-1">{review.comment}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        This product doesn't have any reviews yet.
                      </p>
                      {user && (
                        <Button onClick={() => setIsReviewFormOpen(true)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Be the first to review
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Review Form Modal */}
                  {user && (
                    <ReviewForm
                      productId={productId}
                      isOpen={isReviewFormOpen}
                      onClose={() => setIsReviewFormOpen(false)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
