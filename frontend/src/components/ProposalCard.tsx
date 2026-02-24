"use client";

import { Proposal } from "@/services/near";
import { ThumbsUp, TrendingUp } from "lucide-react";

interface ProposalCardProps {
    proposal: Proposal;
    onVote: (id: number) => void;
}

const STATUS_COLORS = {
    Active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Funded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Completed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function ProposalCard({ proposal, onVote }: ProposalCardProps) {
    const funding = (proposal.contributions / 1e24).toFixed(2);
    const statusColors = STATUS_COLORS[proposal.status] || STATUS_COLORS.Active;

    return (
        <div className="glass-panel rounded-2xl p-5 hover:border-white/20 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white text-lg leading-tight group-hover:text-neon-cyan transition-colors">
                    {proposal.title}
                </h3>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColors}`}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    {proposal.status}
                </span>
            </div>

            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{proposal.description}</p>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Contributions</div>
                    <div className="text-lg font-bold text-white">{funding} <span className="text-sm text-zinc-400">Ⓝ</span></div>
                </div>
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Voters</div>
                    <div className="text-lg font-bold text-white">{proposal.voter_count}</div>
                </div>
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Votes</div>
                    <div className="text-lg font-bold text-neon-cyan">{proposal.votes}</div>
                </div>
            </div>

            {/* QF Indicator */}
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    QF Multiplier: {proposal.voter_count > 0 ? `${proposal.voter_count}x` : "--"}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onVote(proposal.id)}
                    disabled={proposal.status !== "Active"}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neon-cyan py-2.5 text-sm font-bold text-black hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ThumbsUp className="h-4 w-4" />
                    Vote (0.1Ⓝ)
                </button>
            </div>

            <div className="mt-3 text-[10px] text-zinc-600 font-mono truncate">
                by {proposal.proposer}
            </div>
        </div>
    );
}
