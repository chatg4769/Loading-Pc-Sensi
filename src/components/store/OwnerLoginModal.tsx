import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Lock } from "lucide-react";

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

export const OwnerLoginModal = ({ isOpen, onClose, onLogin }: OwnerLoginModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = onLogin(password);
      if (success) {
        setPassword("");
        onClose();
      } else {
        setError("Invalid password. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center text-tier-gold">
            <Crown className="w-6 h-6 mr-2" />
            Owner Access
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Enter Owner Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-muted border-border focus:border-primary"
              required
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full btn-gaming"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Verifying..." : "Login as Owner"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Only authorized store owners can access the management panel</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};