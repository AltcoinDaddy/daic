"use client";

import { useState } from "react";
import { ThumbsUp, Activity } from "lucide-react";

interface ProposalCardProps {
    id: number;
    title: string;
    description: string;
    votes: number;
    funding: string;
    onVote: (id: number) => void;
}

export function ProposalCard({ id, title, description, votes, funding, onVote }: ProposalCardProps) {
    const [voting, setVoting] = useState(false);

    const handleVote = async () => {
        setVoting(true);
        await onVote(id);
        setVoting(false);
    };

    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 transition-all hover:border-cyan-500/50 hover:bg-zinc-900">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
                <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <ThumbsUp className="h-4 w-4 text-cyan-500" />
                        <span className="font-mono text-sm">{votes} Votes</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="font-mono text-sm">{funding} NEAR</span>
                    </div>
                </div>

                <button
                    onClick={handleVote}
                    disabled={voting}
                    className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-cyan-500 hover:text-black disabled:opacity-50"
                >
                    {voting ? "Voting..." : "Vote"}
                </button>
            </div>
        </div>
    );
}
