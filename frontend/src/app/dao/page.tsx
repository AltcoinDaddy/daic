"use client";

import { useDAO } from "@/hooks/useDAO";
import { ProposalCard } from "@/components/ProposalCard";
import { WalletSelector } from "@/components/WalletSelector";

export default function VotingPage() {
    const { createProposal } = useDAO();

    // Mock data for display until contract connection is fully live
    const mockProposals = [
        { id: 1, title: "Open Source Climate Model", description: "A fully verifiable, open-weights climate model trained on public satellite data.", votes: 42, funding: "1,500" },
        { id: 2, title: "Decentralized Drug Discovery", description: "Using ZK proofs to verify molecule screening without revealing proprietary formulas.", votes: 128, funding: "8,400" },
        { id: 3, title: "Anti-Censorship LLM Dataset", description: "A pinned IPFS dataset of historical texts resilient to takedowns.", votes: 15, funding: "300" },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <nav className="border-b border-white/10 bg-zinc-900/50">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <div className="text-xl font-bold tracking-tight text-white">DAIC DAO</div>
                    <WalletSelector />
                </div>
            </nav>

            <main className="container mx-auto p-6 max-w-5xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-500 mb-4">
                        Quadratic Funding Round #1
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Your votes matter more than your capital. Support the next generation of sovereign AI public goods.
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mockProposals.map((p) => (
                        <ProposalCard
                            key={p.id}
                            id={p.id}
                            title={p.title}
                            description={p.description}
                            votes={p.votes}
                            funding={p.funding}
                            onVote={(id) => console.log("Voted for proposal", id)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
