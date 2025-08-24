import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Smartphone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful!",
        description: "Your sensitivity pack will be available for download shortly.",
      });
      // Navigate to success page
      window.location.href = '/download';
    }, 3000);
  };

  const cartTotal = 1299.00; // Mock cart total

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
            <h1 className="text-3xl font-bold text-gaming-glow font-orbitron">
              Secure Checkout
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Information */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="text-tier-gold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="bg-input border-border"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                      className="bg-input border-border"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="text-tier-gold">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  
                  {/* Credit/Debit Card */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    
                    {paymentMethod === "card" && (
                      <div className="space-y-4 ml-7">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                              placeholder="MM/YY"
                              className="bg-input border-border"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange("cvv", e.target.value)}
                              placeholder="123"
                              className="bg-input border-border"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UPI Payment */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center">
                        <Smartphone className="w-5 h-5 mr-2" />
                        UPI Payment
                      </Label>
                    </div>
                    
                    {paymentMethod === "upi" && (
                      <div className="ml-7">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          value={formData.upiId}
                          onChange={(e) => handleInputChange("upiId", e.target.value)}
                          placeholder="yourname@paytm"
                          className="bg-input border-border"
                        />
                      </div>
                    )}
                  </div>

                  {/* Net Banking */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking" className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Net Banking
                    </Label>
                  </div>

                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="text-tier-diamond">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Android Sensitivity (Gold)</span>
                    <span>₹800.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PC Settings (Silver)</span>
                    <span>₹1000.00</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-₹501.00</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-tier-gold">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full btn-gaming text-lg py-6"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay ₹${cartTotal.toFixed(2)}`
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Your payment is secured with 256-bit SSL encryption
                </div>
              </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="card-gaming">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-tier-gold">
                    🔒 Secure Payment
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure. 
                    We never store your card details.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;