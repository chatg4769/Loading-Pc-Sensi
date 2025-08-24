import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Crown, User } from "lucide-react";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onOwnerLogin: () => void;
  isOwner?: boolean;
}

export const Header = ({ cartItemCount, onCartClick, onOwnerLogin, isOwner = false }: HeaderProps) => {
  return (
    <header className="w-full bg-card/50 backdrop-blur-lg border-b border-border/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <img 
              src="https://i.postimg.cc/bJ0K8mXS/DOC-20250604-WA0024-1.jpg" 
              alt="Loading PC Sensi Store" 
              className="h-12 w-auto rounded-lg shadow-lg"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gaming-glow">
                Loading PC Sensi Store
              </h1>
              <p className="text-sm text-muted-foreground">Premium Gaming Sensitivity</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Owner Login/Dashboard Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOwnerLogin}
              className="border-border hover:bg-card-hover transition-all duration-300"
            >
              {isOwner ? (
                <>
                  <Crown className="w-4 h-4 mr-2 text-tier-gold" />
                  Owner Panel
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Owner Login
                </>
              )}
            </Button>

            {/* Cart Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCartClick}
              className="relative border-border hover:bg-card-hover transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};