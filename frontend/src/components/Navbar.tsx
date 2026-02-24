"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletSelector } from "./WalletSelector";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/datasets", label: "Datasets" },
    { href: "/dao", label: "DAO" },
    { href: "/chat", label: "Chat" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-14 items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center">
                            <span className="text-[10px] font-black text-white">D</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">DAIC</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                        ? "text-white bg-white/10"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <WalletSelector />
            </div>
        </nav>
    );
}
