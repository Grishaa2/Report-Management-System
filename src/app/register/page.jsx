import { RegisterForm } from "@/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start managing your reports today
            </p>
          </div>

          {/* Register Form */}
          <div className="mt-8">
            <RegisterForm />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="font-semibold text-blue-600 hover:text-blue-500 transition"
              >
                Sign in
              </Link>
            </p>
            <p className="text-xs text-gray-500 pt-4">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding/Info (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">
            Join Thousands of Teams
          </h2>
          <p className="text-lg text-indigo-100">
            Trusted by professionals worldwide for report management and data visualization.
          </p>
          <div className="space-y-4 pt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-green-300 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-300 border-2 border-white"></div>
                </div>
                <span className="text-sm font-semibold">2,000+ users</span>
              </div>
              <p className="text-sm text-indigo-100">
                "This tool transformed how we handle reports. Highly recommended!"
              </p>
              <p className="text-xs text-indigo-200 mt-2">- Sarah M., Data Analyst</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
