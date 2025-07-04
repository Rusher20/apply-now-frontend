import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { Toaster } from "react-hot-toast"; // ✅ import Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Application Form",
  description: "Submit your job application with our easy-to-use form",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloWrapper>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </ApolloWrapper>
      </body>
    </html>
  );
}
