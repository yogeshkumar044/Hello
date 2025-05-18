'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';

function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-3xl md:text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
          >
            Hello
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="text-indigo-300 hover:text-blue-400 transition font-bold text-lg"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Center: Welcome */}
        {session && (
          <div className="hidden md:block text-sm text-gray-300">
            Welcome, {user?.username || user?.email}
          </div>
        )}

        {/* Right: Auth Buttons */}
        <div>
          {session ? (
            <Button
              onClick={() => signOut()}
              className="bg-white text-black hover:bg-gray-200 transition"
              variant="outline"
            >
              Logout
            </Button>
          ) : (
            <Link href="/sign-in">
              <Button
                className="bg-white text-black hover:bg-gray-200 transition"
                variant="outline"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>

  );
}

export default Navbar;