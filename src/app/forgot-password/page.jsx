"use client";

import { useState } from "react";
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
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    setSubmittedEmail(values.email);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Email sent!",
          description: "If an account exists with that email, you will receive a password reset link.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Request failed",
          description: data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Request failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            {!emailSent ? (
              <>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Forgot your password?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </>
            ) : (
              <>
                <div className="mt-6 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a password reset link to <span className="font-semibold text-gray-900">{submittedEmail}</span>
                </p>
              </>
            )}
          </div>

          {!emailSent ? (
            <>
              {/* Forgot Password Form */}
              <div className="mt-8">
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
                      {isLoading ? "Sending..." : "Send reset link"}
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
            </>
          ) : (
            <>
              {/* Success Message Content */}
              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Check your inbox</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Click the link in the email to reset your password. The link will expire in 1 hour.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Didn't receive the email?</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Check your spam folder or try entering your email address again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Sign In */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Branding/Info (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">
            Secure Password Recovery
          </h2>
          <p className="text-lg text-blue-100">
            We help you recover access to your account securely and quickly.
          </p>
          <div className="space-y-4 pt-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold">Secure & Encrypted</h3>
                <p className="text-sm text-blue-100">Your password reset links are encrypted and time-limited.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold">Quick Recovery</h3>
                <p className="text-sm text-blue-100">Get back to your reports in minutes with our fast reset process.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-sm text-blue-100">Our team is here to help if you need assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
