import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hello',
  description: 'Real feedback from real people.',
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <AuthProvider>              
        <body className={inter.className} >
          <Navbar/>
          {children}
          <Toaster />
        </body>
      </AuthProvider> 
    </html>
  );
}
