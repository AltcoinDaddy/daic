import { useState, useCallback } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { NEAR_CONFIG } from "@/config";

export interface Proposal {
    id: number;
    proposer: string;
    title: string;
    description: string;
    votes: number;
    contributions: string;
}

export function useDAO() {
    const { selector } = useWallet();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProposals = useCallback(async () => {
        if (!selector) return;
        setLoading(true);
        try {
            const wallet = await selector.wallet();
            // For MVP, we might need a view method call helper
            // Since 'view' calls don't strictly require a wallet connection in near-api-js but wallet-selector helps
            // We will assume using a provider mechanism or standard near-api-js JsonRpcProvider

            // Mocking for now as we don't have the full view logic set up without 'near-api-js' providers directly imported
            // In a real app: const res = await provider.query(...)
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [selector]);

    const createProposal = async (title: string, description: string) => {
        if (!selector) return;
        const wallet = await selector.wallet();
        await wallet.signAndSendTransaction({
            receiverId: NEAR_CONFIG.contractName,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "create_proposal",
                        args: { title, description },
                        gas: "30000000000000",
                        deposit: "0",
                    },
                },
            ],
        });
    };

    return {
        proposals,
        loading,
        fetchProposals,
        createProposal,
    };
}
