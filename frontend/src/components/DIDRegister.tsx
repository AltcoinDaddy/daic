"use client";

import { useState, useEffect } from "react";
import { Shield, Check, Loader2 } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { nearService } from "@/services/near";

export function DIDRegister() {
    const { accountId, signIn } = useWallet();
    const [registering, setRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if DID is already registered on mount
    useEffect(() => {
        if (!accountId) {
            setChecking(false);
            return;
        }
        (async () => {
            try {
                const did = await nearService.getDID(accountId);
                if (did) {
                    setRegistered(true);
                }
            } catch {
                // Not registered yet, that's fine
            } finally {
                setChecking(false);
            }
        })();
    }, [accountId]);

    const handleRegister = async () => {
        if (!accountId) return;
        setRegistering(true);

        try {
            // Use the account's public key as the verification method
            const publicKey = `ed25519:${accountId}`;
            await nearService.registerDID(publicKey);
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
                <button
                    onClick={signIn}
                    className="w-full rounded-lg bg-white/10 py-2 font-bold text-white hover:bg-white/20 transition-colors"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    if (checking) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-3 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Checking identity...</span>
            </div>
        );
    }

    if (registered) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-500">
                <Check className="h-5 w-5" />
                <span className="font-medium">Identity Verified (did:near:{accountId})</span>
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
