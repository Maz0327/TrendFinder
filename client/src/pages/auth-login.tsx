import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radar, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HoverScaleButton, 
  RippleButton,
  SuccessCheck,
  ShakeOnError 
} from "@/components/ui/micro-interactions";
import { PulseDotsLoader } from "@/components/ui/loading-states";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      setLoginSuccess(true);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to Content Radar",
      });

      // Redirect after animation
      setTimeout(() => {
        setLocation("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      form.setError("password", { message: "" }); // Trigger shake animation
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for demo
  const handleDemoLogin = () => {
    form.setValue("email", "test@example.com");
    form.setValue("password", "test123");
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow"
            >
              <Radar className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Content Radar account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ShakeOnError trigger={!!form.formState.errors.password}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            disabled={isLoading}
                            className="transition-all focus:scale-[1.02]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              disabled={isLoading}
                              className="pr-10 transition-all focus:scale-[1.02]"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {loginSuccess ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2 py-4"
                      >
                        <SuccessCheck show={true} />
                        <span className="text-green-600">Login successful! Redirecting...</span>
                      </motion.div>
                    ) : (
                      <RippleButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity shadow-glow"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing in...
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </RippleButton>
                    )}
                  </AnimatePresence>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <HoverScaleButton
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full border border-primary/30 py-2 rounded-md hover:bg-primary/5 transition-colors"
                  >
                    Try Demo Account
                  </HoverScaleButton>
                </form>
              </Form>
            </ShakeOnError>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
              Forgot your password?
            </Link>
          </CardFooter>
        </Card>

        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-primary/8 dark:bg-primary/15 rounded-full blur-3xl"
          />
        </div>
      </motion.div>
    </div>
  );
}