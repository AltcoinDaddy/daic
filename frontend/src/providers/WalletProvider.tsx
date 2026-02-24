"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector as WalletSelectorType } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupModal } from "@near-wallet-selector/modal-ui";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { NEAR_CONFIG } from "@/config";
import { nearService } from "@/services/near";
import "@near-wallet-selector/modal-ui/styles.css";

interface WalletContextType {
    selector: WalletSelectorType | null;
    modal: WalletSelectorModal | null;
    accountId: string | null;
    signOut: () => Promise<void>;
    signIn: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [selector, setSelector] = useState<WalletSelectorType | null>(null);
    const [modal, setModal] = useState<WalletSelectorModal | null>(null);
    const [accountId, setAccountId] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            const _selector = await setupWalletSelector({
                network: "testnet",
                modules: [setupMyNearWallet()],
            });
            const _modal = setupModal(_selector, {
                contractId: NEAR_CONFIG.daoContract,
            });

            // Inject wallet into the NEAR service so it can make change calls
            nearService.setWallet(_selector);

            const state = _selector.store.getState();
            if (state.accounts.length > 0) {
                setAccountId(state.accounts[0].accountId);
            }

            // Subscribe to account changes
            _selector.store.observable.subscribe((state: { accounts: { accountId: string }[] }) => {
                if (state.accounts.length > 0) {
                    setAccountId(state.accounts[0].accountId);
                } else {
                    setAccountId(null);
                }
            });

            setSelector(_selector);
            setModal(_modal);
        }
        init();
    }, []);

    const signIn = () => {
        modal?.show();
    };

    const signOut = async () => {
        if (!selector) return;
        const wallet = await selector.wallet();
        await wallet.signOut();
    };

    return (
        <WalletContext.Provider value={{ selector, modal, accountId, signIn, signOut }}>
            {children}
        </WalletContext.Provider>
    );
};
