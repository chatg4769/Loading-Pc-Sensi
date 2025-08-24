import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Sparkles } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  platform: string;
  tier: 'silver' | 'gold' | 'diamond' | 'legendary';
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onGenerateDescription: (product: Product) => void;
  isGenerating?: boolean;
}

export const ProductCard = ({ 
  product, 
  onAddToCart, 
  onGenerateDescription, 
  isGenerating = false 
}: ProductCardProps) => {
  const getTierClass = (tier: string) => {
    switch (tier) {
      case 'silver': return 'tier-silver';
      case 'gold': return 'tier-gold';
      case 'diamond': return 'tier-diamond';
      case 'legendary': return 'tier-legendary';
      default: return 'tier-silver';
    }
  };

  const getTierButtonClass = (tier: string) => {
    switch (tier) {
      case 'silver': return 'btn-tier-silver';
      case 'gold': return 'btn-tier-gold';
      case 'diamond': return 'btn-tier-diamond';
      case 'legendary': return 'btn-tier-legendary';
      default: return 'btn-tier-silver';
    }
  };

  const getTierTextClass = (tier: string) => {
    switch (tier) {
      case 'silver': return 'text-tier-silver';
      case 'gold': return 'text-tier-gold';
      case 'diamond': return 'text-tier-diamond';
      case 'legendary': return 'text-tier-legendary';
      default: return 'text-tier-silver';
    }
  };

  const originalPrice = product.discount ? product.price / (1 - product.discount / 100) : null;

  return (
    <Card className={`card-gaming border-2 ${getTierClass(product.tier)} overflow-hidden`}>
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
        />
        {product.discount && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
            -{product.discount}%
          </Badge>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className={`${getTierTextClass(product.tier)} border-current capitalize font-semibold`}>
            {product.tier}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Product Info */}
        <div>
          <h3 className={`text-xl font-bold ${getTierTextClass(product.tier)} mb-2`}>
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {product.description}
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {product.platform.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-foreground">
              ₹{product.price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={() => onAddToCart(product)}
            className={`w-full ${getTierButtonClass(product.tier)} hover:shadow-lg transition-all duration-300`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => onGenerateDescription(product)}
            disabled={isGenerating}
            className="w-full border-border hover:bg-card-hover"
          >
            {isGenerating ? (
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};