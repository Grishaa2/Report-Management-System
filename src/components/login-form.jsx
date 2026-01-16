"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const clearErrors = useCallback((field) => {
    if (field === "email" || field === "all") {
      setEmailError(null);
      setError(null);
    }
    if (field === "password" || field === "all") {
      setPasswordError(null);
      setError(null);
    }
  }, []);

  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        if (result.error === "Wrong password" || result.error === "CredentialsSignin") {
          setPasswordError("Incorrect password. Please try again or reset your password.");
        } else if (result.error === "User not found" || result.error === "No user found") {
          setEmailError("No account found with this email. Please sign up.");
        } else if (result.error.includes("email") || result.error.includes("password")) {
          setError(result.error);
        } else {
          setError("Sign-in failed. Please try again.");
        }
      } else {
        toast({
          title: "Success!",
          description: "Welcome back to your dashboard.",
        });
        router.push('/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="space-y-6">
      {/* Error Banner - Generic Errors */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-700 font-medium">Sign-in failed</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Email address</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="name@example.com" 
                    className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      emailError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrors("email");
                    }}
                  />
                </FormControl>
                {emailError ? (
                  <div className="flex items-center space-x-2 text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{emailError}</p>
                  </div>
                ) : (
                  <FormMessage />
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      passwordError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrors("password");
                    }}
                  />
                </FormControl>
                {passwordError ? (
                  <div className="flex items-center space-x-2 text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{passwordError}</p>
                  </div>
                ) : (
                  <FormMessage />
                )}
              </FormItem>
            )}
          />
          
           <Button 
             type="submit" 
             className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm"
             disabled={isLoading}
           >
             {isLoading ? "Signing in..." : "Sign in"}
           </Button>
         </form>
       </Form>

       {/* Forgot Password Link */}
       <div className="text-center">
         <Link 
           href="/forgot-password" 
           className="text-sm text-blue-600 hover:text-blue-500 transition"
         >
           Forgot your password?
         </Link>
       </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-gray-700">Google</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="font-medium text-gray-700">GitHub</span>
        </Button>
      </div>
    </div>
  );
}
