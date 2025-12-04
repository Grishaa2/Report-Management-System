"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6">Welcome to WCT Final</h1>

      {session ? (
        <div className="flex flex-col items-center">
          <p className="text-lg mb-4">Signed in as {session.user.email}</p>
          <Button onClick={() => signOut()} className="mb-4">Sign out</Button>
          <Link href="/dashboard" passHref>
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link href="/login" passHref>
            <Button>Sign in</Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      )}
    </div>
  );
}