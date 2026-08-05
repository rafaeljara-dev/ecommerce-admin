"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to E-Commerce Admin
          </h1>
          <p className="text-lg text-gray-600">
            Manage your stores, products, and orders with ease.
          </p>
        </div>
        <div className="space-y-4">
          {user ? (
            <Link href="/stores">
              <Button className="w-full" size="lg">
                Go to My Stores
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full" size="lg">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
