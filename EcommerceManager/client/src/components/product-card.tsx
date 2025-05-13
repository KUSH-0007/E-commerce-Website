import { useState } from "react";
import { Link } from "wouter";
import { ShoppingCart, Heart, Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  const { 
    id, 
    name, 
    description, 
    price, 
    discountPrice, 
    imageUrl, 
    rating, 
    reviewCount,
    isNew, 
    inStock 
  } = product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation();
    
    addToCart({
      productId: id,
      name,
      price,
      discountPrice: discountPrice || undefined,
      imageUrl,
      quantity: 1
    });
  };

  // Generate rating stars
  const renderRatingStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }
    
    // Add empty stars to make total of 5
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-amber-400" />);
    }
    
    return stars;
  };

  return (
    <Link href={`/product/${id}`}>
      <div 
        className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-48 object-cover transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-muted-foreground hover:text-accent">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          {isNew && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-accent text-white hover:bg-accent">New</Badge>
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium text-lg">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-medium mb-1 line-clamp-1">{name}</h3>
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{description}</p>
          
          <div className="flex items-center mb-2">
            <div className="flex text-amber-400">
              {renderRatingStars()}
            </div>
            <span className="text-muted-foreground text-xs ml-1">({reviewCount})</span>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <div>
              <span className="font-bold text-lg">${price.toFixed(2)}</span>
              {discountPrice && (
                <span className="text-muted-foreground text-sm line-through ml-2">${discountPrice.toFixed(2)}</span>
              )}
            </div>
            <Button 
              onClick={handleAddToCart}
              disabled={!inStock}
              variant="default" 
              size="icon" 
              className="rounded-full bg-primary hover:bg-primary-dark"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
