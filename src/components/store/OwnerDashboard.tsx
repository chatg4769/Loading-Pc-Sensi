import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Crown, Package, Settings } from "lucide-react";
import { Product } from "./ProductCard";

interface OwnerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export const OwnerDashboard = ({ 
  isOpen, 
  onClose, 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct 
}: OwnerDashboardProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    image_url: "",
    description: "",
    platform: "android",
    tier: "silver" as Product['tier'],
    discount: 0
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setNewProduct({
      name: "",
      price: 0,
      image_url: "",
      description: "",
      platform: "android",
      tier: "silver",
      discount: 0
    });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-tier-gold flex items-center">
            <Crown className="w-8 h-8 mr-3" />
            Owner Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="products" className="h-full">
          <TabsList className="grid grid-cols-3 w-full bg-muted">
            <TabsTrigger value="products" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="add-product" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="max-h-96 overflow-y-auto space-y-4">
            <h3 className="text-xl font-semibold mb-4">Manage Products</h3>
            {products.map((product) => (
              <Card key={product.id} className="bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className={`font-semibold ${getTierTextClass(product.tier)}`}>
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.platform.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {product.tier}
                          </Badge>
                          {product.discount && (
                            <Badge className="text-xs bg-destructive">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg font-bold mt-1">₹{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="add-product" className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                  placeholder="Enter image URL"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Enter product description"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={newProduct.platform} onValueChange={(value) => setNewProduct({...newProduct, platform: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="pc">PC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tier</label>
                  <Select value={newProduct.tier} onValueChange={(value: Product['tier']) => setNewProduct({...newProduct, tier: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Discount (%)</label>
                  <Input
                    type="number"
                    value={newProduct.discount}
                    onChange={(e) => setNewProduct({...newProduct, discount: parseInt(e.target.value)})}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full btn-gaming">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Store Settings</h3>
            <Card>
              <CardHeader>
                <CardTitle>Store Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Store Name</label>
                  <Input value="Loading PC Sensi Store" readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Input value="INR (₹)" readOnly />
                </div>
                <div className="text-sm text-muted-foreground">
                  More settings will be available in future updates.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Product Modal */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Discount (%)</label>
                  <Input
                    type="number"
                    value={editingProduct.discount || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, discount: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <Button type="submit" className="w-full btn-gaming">
                  Update Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};