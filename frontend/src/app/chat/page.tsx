import { MessageSquare, Users, Lock, Send, Shield, Zap } from "lucide-react";

export default function Chat() {
    return (
        <div className="flex h-screen w-full bg-zinc-950 text-white selection:bg-cyan-500/30">
            {/* Sidebar - Glass Panel */}
            <aside className="glass-panel relative flex w-80 flex-col border-r-0 border-r-white/5 bg-black/40">
                <div className="flex h-16 items-center gap-3 px-6 border-b border-white/5 bg-white/5">
                    <Shield className="h-5 w-5 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
                    <h2 className="font-bold tracking-wide uppercase text-xs text-zinc-300">Secure Channel</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="mb-4 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Nodes</div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/5">
                            <div className="relative h-10 w-10 shrink-0">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-purple to-indigo-600 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="relative h-full w-full rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                                    <span className="font-mono text-xs text-white/80">{i}</span>
                                </div>
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-black box-content shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-medium text-sm text-zinc-200 truncate group-hover:text-white">Node_Alpha_{i}</div>
                                <div className="text-[10px] uppercase tracking-wide text-zinc-600 truncate font-mono">did:near:8a7b...{i}4c</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 rounded-lg bg-zinc-900/50 p-3 border border-white/5">
                        <div className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
                        <span className="text-xs text-zinc-400">Mesh Network: <span className="text-neon-cyan">Synced</span></span>
                    </div>
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex flex-1 flex-col relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-neon-purple/5 blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-neon-cyan/5 blur-[120px]" />
                </div>

                <header className="glass-panel z-10 flex h-16 shrink-0 items-center justify-between border-b-0 border-b-white/5 bg-black/40 px-6 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
                            <Lock className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">E2E Encrypted</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span>Libp2p Swarm Active</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth z-0">
                    {/* Timestamp Separator */}
                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-800" />
                        <span className="text-[10px] font-medium text-zinc-600 uppercase">Today, 10:23 AM</span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-800" />
                    </div>

                    {/* Messages */}
                    <div className="flex justify-start group">
                        <div className="flex max-w-xl gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/5 flex-shrink-0 flex items-center justify-center text-[10px] text-zinc-400">
                                P1
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-bold text-zinc-400">Peer 1</span>
                                    <span className="text-[10px] text-zinc-600">10:24 AM</span>
                                </div>
                                <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-4 backdrop-blur-sm shadow-sm">
                                    <p className="text-sm text-zinc-200 leading-relaxed">Has anyone verified the climate model ZK credentials?</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end group">
                        <div className="flex max-w-xl flex-row-reverse gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 flex-shrink-0 shadow-[0_0_15px_rgba(0,243,255,0.3)]" />
                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-[10px] text-zinc-600">10:25 AM</span>
                                    <span className="text-xs font-bold text-neon-cyan">You</span>
                                </div>
                                <div className="rounded-2xl rounded-tr-none border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-blue-600/10 p-4 backdrop-blur-sm shadow-[0_0_0_1px_rgba(0,243,255,0.1)]">
                                    <p className="text-sm text-zinc-100 leading-relaxed">Yes, I checked the prover contract. The proof is valid for the latest dataset.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 z-10">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-neon-cyan/50 to-neon-purple/50 opacity-0 group-focus-within:opacity-100 transition-opacity blur duration-500" />
                        <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-black/80 p-1.5 pl-5 shadow-2xl backdrop-blur-xl transition-all">
                            <input
                                type="text"
                                placeholder="Broadcast a secure message..."
                                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none py-2"
                            />
                            <div className="flex gap-1 pr-1">
                                <button className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                                    <Users className="h-4 w-4" />
                                </button>
                                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-cyan text-black hover:bg-cyan-300 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                                    <Send className="h-4 w-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <p className="text-[10px] text-zinc-600">Keys are never stored on server. <span className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer border-b border-zinc-700">View Encryption Protocol</span></p>
                    </div>
                </div>
            </main>
        </div>
    );
}

