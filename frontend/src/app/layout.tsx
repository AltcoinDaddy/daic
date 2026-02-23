import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DAIC - Decentralized AI Commons",
  description: "Sovereign AI Ecosystem for Public Goods",
};

import { WalletProvider } from "@/providers/WalletProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} bg-zinc-950 text-white antialiased`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
