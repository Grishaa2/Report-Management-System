import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="mt-8">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 transition"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding/Info (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">
            Transform Your Data Into Insights
          </h2>
          <p className="text-lg text-blue-100">
            Upload, visualize, and share reports with your team securely.
          </p>
          <div className="space-y-4 pt-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold">Easy Data Import</h3>
                <p className="text-sm text-blue-100">Support for CSV, Excel, and JSON files</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold">Beautiful Visualizations</h3>
                <p className="text-sm text-blue-100">Interactive charts and dashboards</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold">Secure Sharing</h3>
                <p className="text-sm text-blue-100">Control who can view and edit your reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
