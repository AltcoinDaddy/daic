"use client";

import Link from "next/link";
import { Plus, Search, FileText, Activity, Server, Database } from "lucide-react";
import { DIDRegister } from "@/components/DIDRegister";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { nearService, Proposal, Dataset } from "@/services/near";
import { useWallet } from "@/providers/WalletProvider";

export default function Dashboard() {
    const { accountId } = useWallet();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [fetchedProposals, fetchedDatasets] = await Promise.all([
                    nearService.getProposals(),
                    nearService.getDatasets()
                ]);
                setProposals(fetchedProposals);
                setDatasets(fetchedDatasets);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Calculate Stats
    const totalFundingYocto = proposals.reduce((acc, p) => acc + p.contributions, 0);
    const totalFundingNEAR = (totalFundingYocto / 1e24).toLocaleString(undefined, { maximumFractionDigits: 2 });
    const activeProposals = proposals.filter(p => p.votes >= 0).length; // All proposals are active for now

    const handleNewProposal = async () => {
        setCreating(true);
        try {
            await nearService.createProposal(
                "New Research Project",
                "A new research proposal submitted from the dashboard."
            );
            const updated = await nearService.getProposals();
            setProposals(updated);
        } catch (err) {
            console.error("Failed to create proposal:", err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            <main className="container mx-auto p-6 md:p-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Research Efforts</h1>
                        <p className="text-zinc-400 max-w-lg">Manage your sovereign AI projects, track credentials, and verify signals.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <DIDRegister />
                        <button
                            onClick={handleNewProposal}
                            disabled={creating || !accountId}
                            className="flex items-center gap-2 rounded-xl bg-neon-cyan px-5 py-2.5 text-sm font-bold text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            {creating ? "Creating..." : "New Proposal"}
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-3 mb-10">
                    {[
                        { label: "Total Proposals", value: proposals.length.toString(), icon: FileText, color: "text-neon-cyan" },
                        { label: "Total Funding", value: `${totalFundingNEAR} NEAR`, icon: Activity, color: "text-neon-purple" },
                        { label: "Datasets Registered", value: datasets.length.toString(), icon: Database, color: "text-emerald-400" },
                    ].map((stat, i) => (
                        <div key={i} className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                            <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                                <stat.icon className={`h-5 w-5 ${stat.color} drop-shadow-md`} />
                            </div>
                            <div className="text-4xl font-bold tracking-tight text-white mb-1">
                                {loading ? <span className="animate-pulse">...</span> : stat.value}
                            </div>
                            <div className={`h-1 w-full mt-4 rounded-full bg-white/5 overflow-hidden`}>
                                <div className={`h-full w-1/2 rounded-full ${stat.color.replace('text-', 'bg-')} opacity-50`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Projects List */}
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="border-b border-white/5 bg-white/5 px-6 py-5 flex items-center justify-between">
                        <h2 className="font-bold text-lg">All Submissions</h2>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-neon-cyan transition-colors" />
                            <input type="text" placeholder="Search projects..." className="rounded-xl border border-white/10 bg-black/50 py-2 pl-10 pr-4 text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 outline-none transition-all w-64" />
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-8 text-center text-zinc-500">
                                <div className="animate-spin inline-block h-6 w-6 border-2 border-zinc-500 border-t-neon-cyan rounded-full mb-2" />
                                <div>Loading from blockchain...</div>
                            </div>
                        ) : proposals.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                <div className="mb-2 text-2xl">📭</div>
                                No proposals found on-chain. Create the first one!
                            </div>
                        ) : (
                            proposals.map((project) => (
                                <div key={project.id} className="flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors group cursor-pointer">
                                    <div>
                                        <div className="font-bold text-zinc-100 group-hover:text-neon-cyan transition-colors">{project.title}</div>
                                        <div className="text-xs text-zinc-500 mt-1">
                                            Submitted by <span className="text-zinc-300 font-mono">{project.proposer}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-500/10 text-blue-400 border-blue-500/20">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            {project.votes} votes
                                        </span>
                                        <span className="text-sm font-mono text-zinc-300 w-24 text-right">
                                            {(project.contributions / 1e24).toFixed(2)} Ⓝ
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
