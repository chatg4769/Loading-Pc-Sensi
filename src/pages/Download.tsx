import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, CheckCircle, MessageCircle, ArrowLeft, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIChatbot } from "@/components/store/AIChatbot";

interface PurchasedItem {
  id: string;
  name: string;
  platform: string;
  tier: string;
  downloadUrl: string;
  instructions: string;
}

const DownloadPage = () => {
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [hasLegendaryAccess, setHasLegendaryAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock purchased items - in real app, this would come from backend
    const mockPurchases: PurchasedItem[] = [
      {
        id: "android-gold",
        name: "Android Sensitivity (Gold)",
        platform: "android",
        tier: "gold",
        downloadUrl: "#",
        instructions: "1. Download the sensitivity file\n2. Open your game settings\n3. Import the sensitivity configuration\n4. Apply and restart your game"
      },
      {
        id: "pc-legendary",
        name: "PC Settings & Optimizations (Legendary)",
        platform: "pc",
        tier: "legendary",
        downloadUrl: "#",
        instructions: "1. Download the complete optimization package\n2. Run the installer as administrator\n3. Follow the setup wizard\n4. Restart your PC for optimal performance"
      }
    ];

    setPurchasedItems(mockPurchases);
    
    // Check if user has legendary access for AI chatbot
    const hasLegendary = mockPurchases.some(item => item.tier === "legendary");
    setHasLegendaryAccess(hasLegendary);
  }, []);

  const handleDownload = (item: PurchasedItem) => {
    toast({
      title: "Download Started",
      description: `${item.name} is being downloaded...`,
    });
    // In real app, this would trigger actual file download
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'silver': return 'text-tier-silver';
      case 'gold': return 'text-tier-gold';
      case 'diamond': return 'text-tier-diamond';
      case 'legendary': return 'text-tier-legendary';
      default: return 'text-tier-silver';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
              <h1 className="text-3xl font-bold text-gaming-glow font-orbitron">
                Your Downloads
              </h1>
            </div>
            
            {hasLegendaryAccess && (
              <Button
                onClick={() => setShowAIChat(true)}
                className="btn-tier-legendary flex items-center"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {purchasedItems.length === 0 ? (
          <Card className="card-gaming text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                No purchases found. Start shopping to unlock premium sensitivity packs!
              </div>
              <Button
                onClick={() => window.location.href = '/'}
                className="btn-gaming"
              >
                Browse Store
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="card-gaming border-success">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <div>
                    <h3 className="font-semibold text-success">Payment Successful!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your sensitivity packs are ready for download.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legendary AI Access Notice */}
            {hasLegendaryAccess && (
              <Card className="card-gaming border-tier-legendary">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-tier-legendary" />
                    <div>
                      <h3 className="font-semibold text-tier-legendary">AI Assistant Unlocked!</h3>
                      <p className="text-sm text-muted-foreground">
                        As a Legendary tier customer, you now have access to our AI sensitivity expert.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Downloaded Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {purchasedItems.map((item) => (
                <Card key={item.id} className="card-gaming">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`${getTierColor(item.tier)} font-orbitron`}>
                        {item.name}
                      </CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {item.platform}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Download Button */}
                    <Button
                      onClick={() => handleDownload(item)}
                      className="w-full btn-gaming"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Sensitivity Pack
                    </Button>

                    <Separator />

                    {/* Installation Instructions */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Installation Instructions
                      </h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-3 rounded-lg">
                        {item.instructions}
                      </div>
                    </div>

                    {/* Additional Resources */}
                    <div className="text-xs text-muted-foreground">
                      <p>💡 Need help? Our support team is available 24/7</p>
                      {item.tier === "legendary" && (
                        <p className="text-tier-legendary">
                          ⭐ Use our AI Assistant for personalized guidance
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Support Section */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="text-tier-gold">Need Support?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📞</div>
                    <h4 className="font-semibold">24/7 Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Call us anytime for assistance
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">💬</div>
                    <h4 className="font-semibold">Live Chat</h4>
                    <p className="text-sm text-muted-foreground">
                      Instant help via chat support
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📧</div>
                    <h4 className="font-semibold">Email Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed help via email
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* AI Chatbot Modal */}
      {hasLegendaryAccess && (
        <AIChatbot
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
};

export default DownloadPage;