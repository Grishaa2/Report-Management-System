"use client";

import { useState, useEffect, Suspense } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setIsTokenValid(false);
    } else {
      setToken(tokenParam);
      setIsTokenValid(true);
    }
  }, [searchParams]);

  async function onSubmit(values) {
    if (!token) {
      toast({
        title: "Invalid Request",
        description: "No reset token provided.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: values.password
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password Reset Successful!",
          description: "You can now sign in with your new password.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Reset Failed",
          description: data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Error Message */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                Invalid Reset Link
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                This password reset link is invalid or has expired. Please request a new reset link.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/forgot-password"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                Request New Reset Link
              </Link>
              
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Branding/Info (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-500 to-red-700 items-center justify-center p-12">
          <div className="max-w-md text-white text-center">
            <svg className="w-20 h-20 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-3xl font-bold mb-2">Link Expired</h2>
            <p className="text-red-100">
              This reset link has expired for security reasons. Request a new one to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Success Message */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                Password Reset Complete!
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
              >
                Sign In with New Password
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Branding/Info (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-500 to-green-700 items-center justify-center p-12">
          <div className="max-w-md text-white text-center">
            <svg className="w-20 h-20 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-3xl font-bold mb-2">Account Secured</h2>
            <p className="text-green-100">
              Your password has been updated successfully. Your account is now secure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Report Management System
            </h1>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Create New Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below. Make sure it's at least 8 characters long.
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="mt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your new password"
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your new password"
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Back to Sign In */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Branding/Info (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">
            Secure Your Account
          </h2>
          <p className="text-lg text-blue-100">
            Create a strong password to protect your reports and data.
          </p>
          <div className="space-y-4 pt-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="font-semibold">Use a Strong Password</h3>
                <p className="text-sm text-blue-100">Mix letters, numbers, and symbols for best security.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="font-semibold">Keep It Private</h3>
                <p className="text-sm text-blue-100">Never share your password with anyone.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
