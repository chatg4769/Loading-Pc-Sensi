import { useState, useEffect } from "react";
import { Header } from "@/components/store/Header";
import { ProductCard, Product } from "@/components/store/ProductCard";
import { CartModal } from "@/components/store/CartModal";
import { OwnerLoginModal } from "@/components/store/OwnerLoginModal";
import { OwnerDashboard } from "@/components/store/OwnerDashboard";
import { useToast } from "@/hooks/use-toast";

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
  const [showCart, setShowCart] = useState(false);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [generatingProductId, setGeneratingProductId] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize with sample products
  useEffect(() => {
    const initialProducts: Product[] = [
      {
        id: "android-silver",
        name: "Android Sensitivity (Silver)",
        price: 300.00,
        image_url: "https://i.postimg.cc/Vvv38Bfc/Loading-Sensi-Pack-Design-Android-Silver-Upscaled.jpg",
        description: "Get started with optimized sensitivity settings for your Android device.",
        platform: "android",
        tier: "silver"
      },
      {
        id: "android-gold",
        name: "Android Sensitivity (Gold)",
        price: 800.00,
        image_url: "https://i.postimg.cc/2y5f5NxM/Loading-Sensi-Pack-Design-Android-Gold-Upscaled.jpg",
        description: "Advanced sensitivity settings for better control and accuracy on Android.",
        platform: "android",
        tier: "gold",
        discount: 10
      },
      {
        id: "android-diamond",
        name: "Android Sensitivity (Diamond)",
        price: 1200.00,
        image_url: "https://i.postimg.cc/W4PLkknM/Loading-Sensi-Pack-Design-Android-Diamond-Upscaled.jpg",
        description: "Pro-level sensitivity and custom configuration to master your Android gameplay.",
        platform: "android",
        tier: "diamond"
      },
      {
        id: "android-legendary",
        name: "Android Sensitivity (Legendary)",
        price: 2000.00,
        image_url: "https://i.postimg.cc/152ZyTV7/Loading-Sensi-Pack-Design-Android-Legendary-Upscaled.jpg",
        description: "Unlock the ultimate performance with fully personalized legendary settings for Android.",
        platform: "android",
        tier: "legendary",
        discount: 15
      },
      {
        id: "pc-silver",
        name: "PC Settings (Silver)",
        price: 1000.00,
        image_url: "https://i.postimg.cc/KzJdwsyN/Loading-Sensi-Pack-Design-PCSilver-Upscaled.jpg",
        description: "Fundamental sensitivity settings to improve your PC gaming experience.",
        platform: "pc",
        tier: "silver"
      },
      {
        id: "pc-gold",
        name: "PC Settings & Gameplay Tricks (Gold)",
        price: 1500.00,
        image_url: "https://i.postimg.cc/LXDpR8jj/Loading-Sensi-Pack-Design-PCGold-Upscaled.jpg",
        description: "Advanced settings, gameplay tricks, and drag techniques for competitive PC gaming.",
        platform: "pc",
        tier: "gold"
      },
      {
        id: "pc-diamond",
        name: "PC Optimizations (Diamond)",
        price: 1800.00,
        image_url: "https://i.postimg.cc/hGbFbtyN/Loading-Sensi-Pack-Design-PCDiamond-Upscaled.jpg",
        description: "Optimize your PC to its full potential with advanced settings for peak performance.",
        platform: "pc",
        tier: "diamond",
        discount: 20
      },
      {
        id: "pc-legendary",
        name: "PC Settings & Optimizations (Legendary)",
        price: 2500.00,
        image_url: "https://i.postimg.cc/FznXdCWR/Loading-Sensi-Pack-Design-PCLegendary-Upscaled.jpg",
        description: "The ultimate package: custom settings, system optimizations, and expert tips.",
        platform: "pc",
        tier: "legendary"
      },
      {
        id: "ios-silver",
        name: "iOS Sensitivity (Silver)",
        price: 500.00,
        image_url: "https://i.postimg.cc/d1qbWcg3/Loading-Sensi-Pack-Designios-Silver-Upscaled.jpg",
        description: "Essential sensitivity settings to get you started with iOS gaming.",
        platform: "ios",
        tier: "silver"
      },
      {
        id: "ios-gold",
        name: "iOS Sensitivity (Gold)",
        price: 1000.00,
        image_url: "https://i.postimg.cc/h4CB5hDB/Loading-Sensi-Pack-Designios-Gold-Upscaled.jpg",
        description: "Refined settings for superior aim and control on your iOS device.",
        platform: "ios",
        tier: "gold"
      },
      {
        id: "ios-diamond",
        name: "iOS Sensitivity (Diamond)",
        price: 1500.00,
        image_url: "https://i.postimg.cc/vZnwTzWY/Loading-Sensi-Pack-Designios-Diamond-Upscaled.jpg",
        description: "Precision-tuned sensitivity and advanced configuration for elite iOS players.",
        platform: "ios",
        tier: "diamond",
        discount: 25
      },
      {
        id: "ios-legendary",
        name: "iOS Sensitivity (Legendary)",
        price: 2500.00,
        image_url: "https://i.postimg.cc/TYp6MG1W/Loading-Sensi-Pack-Designios-Legendary-Upscaled.jpg",
        description: "Custom-built, legendary settings for the highest level of performance on iOS.",
        platform: "ios",
        tier: "legendary"
      }
    ];

    setProducts(initialProducts);
  }, []);

  // Owner login logic
  const handleOwnerLogin = (password: string) => {
    // Simple password check (in real app, this would be more secure)
    if (password === "loading=accuracy@20112003") {
      setIsOwner(true);
      setShowOwnerDashboard(true);
      toast({
        title: "Welcome Owner!",
        description: "You now have access to the management dashboard.",
      });
      return true;
    }
    return false;
  };

  // Cart management
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev[product.id];
      if (existingItem) {
        return {
          ...prev,
          [product.id]: { ...existingItem, quantity: existingItem.quantity + 1 }
        };
      } else {
        return {
          ...prev,
          [product.id]: { ...product, quantity: 1 }
        };
      }
    });

    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });

    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    });
  };

  // Product management
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString()
    };
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Product Added!",
      description: "New product has been added to the store.",
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast({
      title: "Product Updated!",
      description: "Product has been successfully updated.",
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Product Deleted!",
      description: "Product has been removed from the store.",
    });
  };

  // Generate description (mock AI function)
  const generateDescription = async (product: Product) => {
    setGeneratingProductId(product.id);
    
    // Simulate API call
    setTimeout(() => {
      setGeneratingProductId(null);
      toast({
        title: "Description Generated!",
        description: "Enhanced product description has been created.",
      });
    }, 2000);
  };

  // Checkout process
  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  const cartItems = Object.values(cart);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Sort products by platform and tier
  const sortedProducts = [...products].sort((a, b) => {
    const platformOrder = { android: 1, ios: 2, pc: 3 };
    const tierOrder = { silver: 1, gold: 2, diamond: 3, legendary: 4 };

    if (platformOrder[a.platform as keyof typeof platformOrder] !== platformOrder[b.platform as keyof typeof platformOrder]) {
      return platformOrder[a.platform as keyof typeof platformOrder] - platformOrder[b.platform as keyof typeof platformOrder];
    }
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setShowCart(true)}
        onOwnerLogin={() => setShowOwnerLogin(true)}
        isOwner={isOwner}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gaming-glow">
            Premium Gaming Sensitivity Packs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Elevate your gameplay with professional sensitivity settings designed for Android, iOS, and PC platforms. 
            Choose your tier and dominate the competition.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onGenerateDescription={generateDescription}
              isGenerating={generatingProductId === product.id}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <OwnerLoginModal
        isOpen={showOwnerLogin}
        onClose={() => setShowOwnerLogin(false)}
        onLogin={handleOwnerLogin}
      />

      <OwnerDashboard
        isOpen={showOwnerDashboard}
        onClose={() => setShowOwnerDashboard(false)}
        products={products}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
      />
    </div>
  );
};

export default Index;
