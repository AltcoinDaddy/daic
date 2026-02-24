"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Lock, Send, Shield, Zap, Hash, Radio, ArrowLeft } from "lucide-react";
import { ChatService, ChatMessage } from "@/services/chat";
import { useWallet } from "@/providers/WalletProvider";

const channels = ChatService.getDefaultChannels();

export default function Chat() {
    const { accountId } = useWallet();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [activeChannel, setActiveChannel] = useState("general");
    const [peerCount, setPeerCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const chatServiceRef = useRef<ChatService | null>(null);
    const unsubRef = useRef<(() => void) | null>(null);

    const senderName = accountId || "Anonymous";

    // Initialize chat service and subscribe to channel
    const subscribeToChannel = useCallback((channel: string) => {
        // Cleanup previous subscription
        if (unsubRef.current) {
            unsubRef.current();
        }

        const service = new ChatService(channel);
        chatServiceRef.current = service;

        setMessages([]); // Clear messages when switching channels

        // Async subscribe
        service.onMessage((msg: ChatMessage) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                const updated = [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
                return updated;
            });
            setPeerCount((p) => Math.max(p, 1));
        }).then((unsub) => {
            unsubRef.current = unsub;
        });
    }, []);

    useEffect(() => {
        subscribeToChannel(activeChannel);
        // Simulate peer discovery
        const interval = setInterval(() => {
            setPeerCount(Math.floor(Math.random() * 4) + 2);
        }, 10000);

        return () => {
            if (unsubRef.current) unsubRef.current();
            clearInterval(interval);
        };
    }, [activeChannel, subscribeToChannel]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !chatServiceRef.current) return;
        await chatServiceRef.current.sendMessage(senderName, input.trim());
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const switchChannel = (channelId: string) => {
        setActiveChannel(channelId);
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-white selection:bg-cyan-500/30">
            {/* Sidebar */}
            <aside className="glass-panel relative flex w-80 flex-col border-r-0 border-r-white/5 bg-black/40">
                <div className="flex h-16 items-center gap-3 px-6 border-b border-white/5 bg-white/5">
                    <Link href="/" className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <Shield className="h-5 w-5 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
                    <h2 className="font-bold tracking-wide uppercase text-xs text-zinc-300">Secure Channel</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="mb-4 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Channels</div>
                    {channels.map((ch) => (
                        <button
                            key={ch.id}
                            onClick={() => switchChannel(ch.id)}
                            className={`group w-full flex items-center gap-3 rounded-xl p-3 transition-all cursor-pointer border text-left
                                ${activeChannel === ch.id
                                    ? "bg-white/10 border-neon-cyan/30"
                                    : "border-transparent hover:bg-white/5 hover:border-white/5"
                                }`}
                        >
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${activeChannel === ch.id
                                ? "bg-neon-cyan/20 text-neon-cyan"
                                : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                                }`}>
                                <Hash className="h-4 w-4" />
                            </div>
                            <div className="overflow-hidden">
                                <div className={`font-medium text-sm truncate ${activeChannel === ch.id ? "text-white" : "text-zinc-400 group-hover:text-white"
                                    }`}>
                                    {ch.name}
                                </div>
                                <div className="text-[10px] text-zinc-600 truncate">{ch.description}</div>
                            </div>
                        </button>
                    ))}

                    <div className="mt-6 mb-4 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Peers Online</div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/5 cursor-pointer">
                            <div className="relative h-8 w-8 shrink-0">
                                <div className="relative h-full w-full rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                                    <span className="font-mono text-[10px] text-white/60">{i}</span>
                                </div>
                                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-black box-content shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-medium text-xs text-zinc-400 truncate">Node_Alpha_{i}</div>
                                <div className="text-[10px] text-zinc-600 truncate font-mono">did:near:8a7b...{i}4c</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 rounded-lg bg-zinc-900/50 p-3 border border-white/5">
                        <Radio className="h-3 w-3 text-neon-cyan animate-pulse" />
                        <span className="text-xs text-zinc-400">
                            P2P Mesh: <span className="text-neon-cyan font-bold">{peerCount} peers</span>
                        </span>
                    </div>
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex flex-1 flex-col relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-neon-purple/5 blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-neon-cyan/5 blur-[120px]" />
                </div>

                <header className="glass-panel z-10 flex h-16 shrink-0 items-center justify-between border-b-0 border-b-white/5 bg-black/40 px-6 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-zinc-400" />
                        <span className="font-bold text-sm text-white">
                            {channels.find(c => c.id === activeChannel)?.name || activeChannel}
                        </span>
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
                            <Lock className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">E2E Encrypted</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span>Gun.js P2P Active</span>
                    </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth z-0">
                    {/* Timestamp Separator */}
                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-800" />
                        <span className="text-[10px] font-medium text-zinc-600 uppercase">Today</span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-800" />
                    </div>

                    {messages.length === 0 && (
                        <div className="text-center py-20 text-zinc-600">
                            <Radio className="h-8 w-8 mx-auto mb-3 text-zinc-700" />
                            <div className="text-sm font-medium">No messages in #{channels.find(c => c.id === activeChannel)?.name}</div>
                            <div className="text-xs mt-1">Be the first to send a message. Messages sync peer-to-peer.</div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => {
                        const isOwn = msg.sender === senderName;
                        return isOwn ? (
                            <div key={msg.id} className="flex justify-end group">
                                <div className="flex max-w-xl flex-row-reverse gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 flex-shrink-0 shadow-[0_0_15px_rgba(0,243,255,0.3)]" />
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-[10px] text-zinc-600">{formatTime(msg.timestamp)}</span>
                                            <span className="text-xs font-bold text-neon-cyan">You</span>
                                        </div>
                                        <div className="rounded-2xl rounded-tr-none border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-blue-600/10 p-4 backdrop-blur-sm shadow-[0_0_0_1px_rgba(0,243,255,0.1)]">
                                            <p className="text-sm text-zinc-100 leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={msg.id} className="flex justify-start group">
                                <div className="flex max-w-xl gap-3">
                                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/5 flex-shrink-0 flex items-center justify-center text-[10px] text-zinc-400">
                                        {msg.sender.charAt(0).toUpperCase()}{msg.sender.charAt(msg.sender.length - 1)}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-xs font-bold text-zinc-400">{msg.sender}</span>
                                            <span className="text-[10px] text-zinc-600">{formatTime(msg.timestamp)}</span>
                                        </div>
                                        <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-4 backdrop-blur-sm shadow-sm">
                                            <p className="text-sm text-zinc-200 leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 pt-2 z-10">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-neon-cyan/50 to-neon-purple/50 opacity-0 group-focus-within:opacity-100 transition-opacity blur duration-500" />
                        <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-black/80 p-1.5 pl-5 shadow-2xl backdrop-blur-xl transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name}...`}
                                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none py-2"
                            />
                            <div className="flex gap-1 pr-1">
                                <button className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                                    <Users className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={sendMessage}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-cyan text-black hover:bg-cyan-300 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                                >
                                    <Send className="h-4 w-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <p className="text-[10px] text-zinc-600">
                            Messages are synced peer-to-peer via Gun.js. <span className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer border-b border-zinc-700">View Protocol</span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
