"use client";

import { useState } from "react";
import { NEAR_CONFIG } from "@/config";
import { Shield, Check } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";

export function DIDRegister() {
    const { accountId, selector } = useWallet();
    const [registering, setRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);

    // Mock checking registration status for MVP
    // In real app, call view method on contract

    const handleRegister = async () => {
        if (!accountId) return;
        setRegistering(true);

        try {
            // Mock public key for MVP
            const publicKey = "ed25519:7GD...mock...Key";

            // Use mock service instead of real transaction for now
            // const wallet = await selector!.wallet();
            // await wallet.signAndSendTransaction(...)

            const did = await import("@/services/near").then(m => m.nearService.registerDID(accountId, publicKey));

            console.log("Registered DID:", did);
            setRegistered(true);
        } catch (err) {
            console.error("Failed to register DID", err);
        } finally {
            setRegistering(false);
        }
    };

    if (!accountId) {
        return (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6 opacity-75">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-zinc-500/10 p-2 text-zinc-500">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Sovereign Identity</h3>
                        <p className="text-sm text-zinc-400">Connect wallet to register.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => selector?.wallet().then((w: any) => w.signIn({ contractId: NEAR_CONFIG.contractName }))} className="flex-1 rounded-lg bg-white/10 py-2 font-bold text-white hover:bg-white/20">
                        Connect Wallet
                    </button>
                    {/* @ts-ignore - debug method */}
                    <button onClick={() => (useWallet() as any).debugSetAccountId?.("mock-user.testnet")} className="flex-1 rounded-lg bg-yellow-500/10 py-2 font-bold text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20">
                        Mock Connect
                    </button>
                </div>
            </div>
        );
    }

    if (registered) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-500">
                <Check className="h-5 w-5" />
                <span className="font-medium">Identity Verified (DID:near:{accountId})</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-500">
                    <Shield className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Sovereign Identity</h3>
                    <p className="text-sm text-zinc-400">Register your DID to participate in the DAO.</p>
                </div>
            </div>

            <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full rounded-lg bg-cyan-500 py-2 font-bold text-black transition-all hover:bg-cyan-400 disabled:opacity-50"
            >
                {registering ? "Registering..." : "Mint DID"}
            </button>
        </div>
    );
}
