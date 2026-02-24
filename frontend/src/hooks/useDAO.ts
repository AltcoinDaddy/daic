import { useState, useCallback, useEffect } from "react";
import { nearService, Proposal } from "@/services/near";

export function useDAO() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProposals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await nearService.getProposals();
            setProposals(data);
        } catch (e) {
            console.error("Failed to fetch proposals:", e);
            setError("Failed to load proposals from the blockchain.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    const createProposal = async (title: string, description: string) => {
        try {
            await nearService.createProposal(title, description);
            // Refresh after creation
            await fetchProposals();
        } catch (e) {
            console.error("Failed to create proposal:", e);
            throw e;
        }
    };

    const vote = async (proposalId: number, amountNear: string) => {
        try {
            await nearService.vote(proposalId, amountNear);
            // Refresh after voting
            await fetchProposals();
        } catch (e) {
            console.error("Failed to vote:", e);
            throw e;
        }
    };

    return {
        proposals,
        loading,
        error,
        fetchProposals,
        createProposal,
        vote,
    };
}
