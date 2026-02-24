"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { nearService, Dataset } from "@/services/near";
import { IPFSService } from "@/services/ipfs";
import { ZKService, IntegrityProof } from "@/services/zk";
import { Navbar } from "@/components/Navbar";
import {
    Database, Upload, Shield, ExternalLink, Clock,
    FileText, Plus, X, Loader2, CheckCircle, Link as LinkIcon
} from "lucide-react";

export default function DatasetsPage() {
    const { accountId } = useWallet();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [parentIds, setParentIds] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState("");
    const [lastCid, setLastCid] = useState("");
    const [lastProof, setLastProof] = useState<IntegrityProof | null>(null);

    useEffect(() => {
        loadDatasets();
    }, []);

    const loadDatasets = async () => {
        try {
            const data = await nearService.getDatasets();
            setDatasets(data);
        } catch (err) {
            console.error("Failed to load datasets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;
        setSubmitting(true);

        try {
            // Step 1: Upload to IPFS + Filecoin via Lighthouse
            setStep("Uploading to IPFS + Filecoin...");
            let cid: string;
            let filecoinDeal = false;
            if (file) {
                const result = await IPFSService.uploadFile(file);
                cid = result.cid;
                filecoinDeal = result.filecoinDeal;
            } else {
                const result = await IPFSService.uploadJSON({ title, description, timestamp: Date.now() });
                cid = result.cid;
                filecoinDeal = result.filecoinDeal;
            }
            setLastCid(cid);
            if (filecoinDeal) {
                setStep("✅ Stored on IPFS + Filecoin! Generating proof...");
            }

            // Step 2: Generate integrity proof
            setStep("Generating integrity proof...");
            const proof = await ZKService.generateProof({ title, description, cid });
            setLastProof(proof);

            // Step 3: Register on-chain
            setStep("Registering on blockchain...");
            const lineage = parentIds
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);

            await nearService.registerDataset(cid, title, description, lineage);

            // Success
            setStep("✅ Dataset registered!");
            setTitle("");
            setDescription("");
            setFile(null);
            setParentIds("");
            await loadDatasets();

            setTimeout(() => {
                setShowForm(false);
                setStep("");
                setLastCid("");
                setLastProof(null);
            }, 3000);
        } catch (err) {
            console.error("Registration failed:", err);
            setStep("❌ Registration failed. Check console.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimestamp = (ns: number) => {
        // NEAR timestamps are in nanoseconds
        const ms = ns / 1e6;
        return new Date(ms).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            <main className="container mx-auto p-6 max-w-5xl">
                {/* Header */}
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4">
                        Dataset Provenance Registry
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
                        Register datasets with cryptographic integrity proofs. Every upload is content-addressed via IPFS, stored permanently on Filecoin, and recorded on-chain.
                    </p>
                    {accountId && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
                        >
                            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {showForm ? "Cancel" : "Register Dataset"}
                        </button>
                    )}
                </header>

                {/* Registration Form */}
                {showForm && (
                    <div className="mb-10 mx-auto max-w-2xl glass-panel rounded-2xl p-6 border border-emerald-500/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-emerald-400" />
                            Register a Dataset
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Climate Sensor Data 2024"
                                    className="w-full rounded-xl border border-white/10 bg-black/50 py-3 px-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the dataset, its source, and intended use..."
                                    rows={3}
                                    className="w-full rounded-xl border border-white/10 bg-black/50 py-3 px-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                                    File <span className="text-zinc-600">(optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="w-full rounded-xl border border-white/10 bg-black/50 py-3 px-4 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all"
                                    />
                                </div>
                                {file && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                                    Parent Dataset IDs <span className="text-zinc-600">(optional, comma-separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={parentIds}
                                    onChange={(e) => setParentIds(e.target.value)}
                                    placeholder="bafkrei..., bafkrei..."
                                    className="w-full rounded-xl border border-white/10 bg-black/50 py-3 px-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                />
                            </div>

                            {/* Progress */}
                            {step && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                                    ) : step.startsWith("✅") ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                        <X className="h-4 w-4 text-red-400" />
                                    )}
                                    <span className="text-emerald-300">{step}</span>
                                </div>
                            )}

                            {/* CID & Proof Results */}
                            {lastCid && (
                                <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-xs font-mono space-y-1">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-3 w-3 text-cyan-400" />
                                        <span className="text-zinc-400">CID:</span>
                                        <span className="text-cyan-400">{lastCid.slice(0, 30)}...</span>
                                    </div>
                                    {lastProof && (
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3 w-3 text-purple-400" />
                                            <span className="text-zinc-400">Proof:</span>
                                            <span className="text-purple-400">{lastProof.signature.slice(0, 24)}...</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !title.trim() || !description.trim()}
                                className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-black hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? step : "Upload & Register On-Chain"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin inline-block h-8 w-8 border-2 border-zinc-500 border-t-emerald-400 rounded-full mb-4" />
                        <div className="text-zinc-400">Loading datasets from NEAR...</div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && datasets.length === 0 && (
                    <div className="text-center py-20 text-zinc-500">
                        <div className="text-4xl mb-4">📦</div>
                        <div className="text-lg font-medium">No datasets registered yet</div>
                        <div className="text-sm mt-1">Be the first to register a dataset with provenance tracking.</div>
                    </div>
                )}

                {/* Dataset Cards */}
                {!loading && datasets.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {datasets.map((ds) => (
                            <div
                                key={ds.id}
                                className="glass-panel rounded-2xl p-5 hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-emerald-400" />
                                        <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                            {ds.title}
                                        </h3>
                                    </div>
                                    <a
                                        href={IPFSService.getUrl(ds.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-500 hover:text-emerald-400 transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{ds.description}</p>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider">
                                    <span className="flex items-center gap-1 text-zinc-500">
                                        <Shield className="h-3 w-3" />
                                        {ds.owner.slice(0, 20)}...
                                    </span>
                                    <span className="flex items-center gap-1 text-zinc-500">
                                        <Clock className="h-3 w-3" />
                                        {formatTimestamp(ds.timestamp)}
                                    </span>
                                    {ds.lineage.length > 0 && (
                                        <span className="flex items-center gap-1 text-purple-400">
                                            <LinkIcon className="h-3 w-3" />
                                            {ds.lineage.length} parent{ds.lineage.length > 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 text-[10px] font-mono text-zinc-600 truncate">
                                    CID: {ds.id}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
