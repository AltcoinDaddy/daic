"use client";

import Link from "next/link";
import { Plus, Search, FileText, Activity, Server, Activity as ActivityIcon } from "lucide-react";
import { DIDRegister } from "@/components/DIDRegister";
import { useEffect, useState } from "react";
import { nearService, Proposal, Dataset } from "@/services/near";

export default function Dashboard() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);

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
    // Rough approximate for display (10^24 yocto = 1 NEAR)
    // Javascript doesn't handle 10^24 well with standard number, so we treat it as big float approx
    const totalFundingNEAR = (totalFundingYocto / 1e24).toLocaleString(undefined, { maximumFractionDigits: 1 });

    // Dataset size sum (parsing "45 GB", "1.2 TB")
    // For now just hardcode or approximate count as a proxy for "pinned"
    const totalDatasetsSize = datasets.length > 0 ? "89.2 TB" : "0 TB";

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Dashboard Nav - Glassmorphism */}
            <nav className="glass-panel sticky top-0 z-40 border-b-0">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-neon-purple to-pink-600 blur opacity-40 animate-pulse" />
                            <div className="relative h-full w-full rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-600/20 border border-white/10 flex items-center justify-center">
                                <ActivityIcon className="h-6 w-6 text-neon-purple" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-neon-cyan transition-colors">DAIC</Link>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Dashboard Console</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-zinc-300">near.testnet</span>
                            <span className="text-[10px] text-green-500 flex items-center gap-1">
                                <span className="block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                Connected
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-neon-cyan to-blue-600 border-2 border-white/10 shadow-[0_0_15px_rgba(0,243,255,0.3)]" />
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-6 md:p-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Research Efforts</h1>
                        <p className="text-zinc-400 max-w-lg">Manage your sovereign AI projects, track credentials, and verify signals.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <DIDRegister />
                        <button
                            onClick={() => {
                                // Simple mock creation for now
                                nearService.createProposal("New Project " + Date.now(), "Auto-generated project")
                                    .then(() => nearService.getProposals())
                                    .then(setProposals);
                            }}
                            className="flex items-center gap-2 rounded-xl bg-neon-cyan px-5 py-2.5 text-sm font-bold text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            New Proposal
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-3 mb-10">
                    {[
                        { label: "Active Proposals", value: proposals.filter(p => p.status === 'Active').length.toString(), icon: FileText, color: "text-neon-cyan" },
                        { label: "Total Funding", value: `${totalFundingNEAR} NEAR`, icon: Activity, color: "text-neon-purple" },
                        { label: "Pinned Datasets", value: totalDatasetsSize, icon: Server, color: "text-emerald-400" },
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
                            <div className="p-8 text-center text-zinc-500">Loading proposals...</div>
                        ) : proposals.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">No proposals found.</div>
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
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${project.status === 'Passed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                project.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                            }`}>
                                            {project.status === 'Active' && <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse" />}
                                            {project.status}
                                        </span>
                                        <span className="text-sm font-mono text-zinc-300 w-24 text-right">
                                            {(project.contributions / 1e24).toFixed(1)} NEAR
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
