"use client";

import { useState } from "react";
import { useDAO } from "@/hooks/useDAO";
import { useWallet } from "@/providers/WalletProvider";
import { ProposalCard } from "@/components/ProposalCard";
import { Navbar } from "@/components/Navbar";
import { Plus, X, Loader2 } from "lucide-react";

export default function VotingPage() {
    const { proposals, loading, error, createProposal, vote } = useDAO();
    const { accountId } = useWallet();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !description.trim()) return;
        setSubmitting(true);
        try {
            await createProposal(title, description);
            setTitle("");
            setDescription("");
            setShowForm(false);
        } catch (err) {
            console.error("Create proposal failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (id: number) => {
        try {
            await vote(id, "0.1"); // Default 0.1 NEAR contribution per vote
        } catch (err) {
            console.error("Vote failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="container mx-auto p-6 max-w-5xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-500 mb-4">
                        Quadratic Funding Round #1
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
                        Your votes matter more than your capital. Support the next generation of sovereign AI public goods.
                    </p>
                    {accountId && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center gap-2 rounded-xl bg-neon-cyan px-6 py-3 text-sm font-bold text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all"
                        >
                            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {showForm ? "Cancel" : "New Proposal"}
                        </button>
                    )}
                </header>

                {/* Create Proposal Form */}
                {showForm && (
                    <div className="mb-10 mx-auto max-w-2xl glass-panel rounded-2xl p-6 border border-neon-cyan/20">
                        <h3 className="text-lg font-bold mb-4">Submit a Proposal</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Open Source Climate Model"
                                    className="w-full rounded-xl border border-white/10 bg-black/50 py-3 px-4 text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the public good this project represents..."
                                    rows={4}
                                    className="w-full rounded-xl border border-white/10 bg-black/50 py-3 px-4 text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 outline-none transition-all resize-none"
                                />
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={submitting || !title.trim() || !description.trim()}
                                className="w-full rounded-xl bg-neon-cyan py-3 font-bold text-black hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? "Submitting to Blockchain..." : "Submit Proposal"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin inline-block h-8 w-8 border-2 border-zinc-500 border-t-neon-cyan rounded-full mb-4" />
                        <div className="text-zinc-400">Loading proposals from NEAR...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-10 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && proposals.length === 0 && (
                    <div className="text-center py-20 text-zinc-500">
                        <div className="text-4xl mb-4">🗳️</div>
                        <div className="text-lg font-medium">No proposals yet</div>
                        <div className="text-sm mt-1">Be the first to submit a proposal for public good funding.</div>
                    </div>
                )}

                {/* Proposals Grid */}
                {!loading && proposals.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {proposals.map((p) => (
                            <ProposalCard
                                key={p.id}
                                proposal={p}
                                onVote={handleVote}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
