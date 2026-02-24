import Link from "next/link";
import { ArrowRight, Globe, ShieldCheck, Database, Cpu, Zap, Activity } from "lucide-react";
import { WalletSelector } from "@/components/WalletSelector";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30">
      {/* Navbar with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-neon-cyan to-blue-600 blur opacity-40 animate-pulse" />
              <div className="relative h-full w-full rounded-xl bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-neon-cyan" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">DAIC</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-neon-cyan transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-neon-cyan transition-colors">How it works</Link>
            <Link href="/dashboard" className="text-white hover:text-neon-cyan transition-colors">Dashboard</Link>
            <Link href="/datasets" className="text-white hover:text-neon-cyan transition-colors">Datasets</Link>
            <Link href="/dao" className="text-white hover:text-neon-cyan transition-colors">DAO</Link>
          </div>
          <div className="flex items-center gap-4">
            <WalletSelector />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center pt-24 overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="h-[600px] w-[600px] rounded-full bg-neon-cyan/10 blur-[150px] animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-neon-cyan mb-10 animate-fade-in-up shadow-[0_0_20px_rgba(0,243,255,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
            </span>
            Live on NEAR Testnet
          </div>

          <h1 className="mx-auto max-w-5xl text-6xl font-bold tracking-tight sm:text-7xl lg:text-9xl mb-8">
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 pb-4">Decentralized</span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-light text-zinc-400 mt-2">Intelligence Commons</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-12 leading-relaxed">
            Collaborate on AI public goods with <span className="text-zinc-200 font-medium">ZK verifiability</span>, <span className="text-zinc-200 font-medium">sovereign identity</span>, and <span className="text-zinc-200 font-medium">quadratic funding</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/dashboard"
              className="group relative flex items-center gap-3 rounded-full bg-neon-cyan px-10 py-4 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(34,211,238,0.6)]"
            >
              Start Building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/your-repo/daic"
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-10 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              View Source
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 group-hover:bg-white transition-colors" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-center mb-4">Core Architecture</h2>
            <div className="h-1 w-20 bg-neon-cyan/50 rounded-full" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "ZK Compute",
                desc: "Prove model accuracy on sensitive data using Zero-Knowledge proofs without revealing inputs."
              },
              {
                icon: Globe,
                title: "P2P Net",
                desc: "Encrypted, direct peer-to-peer messaging and data sharing for real-time research."
              },
              {
                icon: Database,
                title: "Provenance",
                desc: "Immutable logs of dataset lineage and model training steps, anchored on NEAR & Filecoin."
              },
              {
                icon: Cpu,
                title: "Auto Agents",
                desc: "Smart contract agents that track biases, origins, and verify ethical sourcing automatically."
              }
            ].map((feature, i) => (
              <div key={i} className="glass-panel group relative overflow-hidden rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-neon-cyan group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_-5px_rgba(0,243,255,0.3)]">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-zinc-100">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-zinc-600 bg-black/40">
        <p>© 2026 DAIC. Built for PL_Genesis Hackathon.</p>
      </footer>
    </div>
  );
}
