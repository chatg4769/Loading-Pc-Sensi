import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, CreditCard } from "lucide-react";
import { Product } from "./ProductCard";

interface CartItem extends Product {
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onCheckout 
}: CartModalProps) => {
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getTierTextClass = (tier: string) => {
    switch (tier) {
      case 'silver': return 'text-tier-silver';
      case 'gold': return 'text-tier-gold';
      case 'diamond': return 'text-tier-diamond';
      case 'legendary': return 'text-tier-legendary';
      default: return 'text-tier-silver';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gaming-glow flex items-center">
            Shopping Cart
            {totalItems > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some premium sensitivity packs to get started!
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted/20 rounded-lg">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h4 className={`font-semibold ${getTierTextClass(item.tier)}`}>
                    {item.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.platform.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {item.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="mt-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
            </div>
            
            <Button 
              onClick={onCheckout}
              className="w-full btn-gaming text-lg py-6"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Checkout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};