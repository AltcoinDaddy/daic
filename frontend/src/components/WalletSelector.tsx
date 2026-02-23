"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";

export function WalletSelector() {
    const { accountId, signIn, signOut } = useWallet();

    return (
        <button
            onClick={accountId ? signOut : signIn}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
        >
            <Wallet className="h-4 w-4 text-cyan-500" />
            {accountId ? accountId : "Connect Wallet"}
        </button>
    );
}
