import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);

    try {
      await signIn(demoEmail, demoPassword);
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Demo account not available. Please sign up first.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-[hsl(88,30%,40%)] px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl hover:shadow-3xl transition-shadow border-0 backdrop-blur">
          <CardHeader className="text-center bg-gradient-to-b from-primary/10 to-transparent">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition transform hover:scale-110 animate-pulse-glow">
                <span className="text-primary-foreground font-bold text-lg">
                  P
                </span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Pactle</CardTitle>
            <CardDescription className="text-sm">
              Quote-to-Cash Automation Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Try demo accounts
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                disabled={isLoading}
                onClick={() =>
                  handleDemoSignIn("manager@pactle.com", "password")
                }
              >
                👨‍💼 Manager Account
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                disabled={isLoading}
                onClick={() => handleDemoSignIn("sales@pactle.com", "password")}
              >
                📊 Sales Rep Account
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                disabled={isLoading}
                onClick={() =>
                  handleDemoSignIn("viewer@pactle.com", "password")
                }
              >
                👁️ Viewer Account
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Link
                to="/sign-up"
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Demo credentials for testing:</p>
          <p className="mt-1">
            manager@pactle.com | sales@pactle.com | viewer@pactle.com
          </p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  );
}
