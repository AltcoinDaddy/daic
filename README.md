# DAIC — Decentralized AI Commons

> A sovereign ecosystem where researchers, developers, and communities collaborate on AI public goods with **cryptographic verifiability**, **decentralized identity**, and **quadratic funding**.

## What is DAIC?

DAIC (Decentralized AI Commons) is a platform that brings together the tools needed to build, fund, and govern AI as a public good — without relying on centralized intermediaries.

Every dataset uploaded gets a **cryptographic integrity proof** and is **content-addressed via IPFS**. Every funding decision goes through **quadratic funding** — where the number of supporters matters more than the size of their wallets. Every identity is **self-sovereign**, backed by on-chain DIDs with verifiable credentials.

## Core Features

### 🗳️ Quadratic Funding DAO
Community-driven funding for AI public goods. Proposals are created, voted on, and funded through smart contracts on NEAR Protocol. QF math ensures democratic allocation — many small contributions are amplified over few large ones.

### 📦 Dataset Provenance Registry
Register datasets with full provenance tracking. Each upload generates a SHA-256 content-addressed CID (IPFS), an integrity proof for tamper detection, and an on-chain record of ownership, lineage, and access level.

### 🔐 Decentralized Identity (DIDs)
Self-sovereign identity via on-chain DID documents. Issue and revoke verifiable credentials, manage service endpoints, and prove dataset ownership — all without a central authority.

### 💬 P2P Encrypted Chat
Real-time decentralized messaging powered by Gun.js. Messages sync peer-to-peer across WebRTC relays — no central server stores your conversations. Multi-channel support for research coordination, dataset sharing, and governance discussion.

### 🛡️ ZK Integrity Proofs
Every dataset and credential can be verified with cryptographic integrity proofs. SHA-256 hashing with nonce-based tamper detection ensures data hasn't been modified since registration.

## Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | NEAR Protocol (Testnet) |
| **Smart Contracts** | Rust + near-sdk v5.24 |
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS |
| **P2P Messaging** | Gun.js (WebRTC + relay peers) |
| **Content Addressing** | IPFS (SHA-256 CIDs) + optional NFT.Storage pinning |
| **Identity** | On-chain DIDs + Verifiable Credentials |
| **ZK Proofs** | Browser-native SHA-256 integrity proofs |
| **Wallet** | NEAR Wallet Selector (@near-wallet-selector) |

## Smart Contracts

| Contract | Address | Purpose |
|---|---|---|
| **DAO** | `dao.daic-dev-1770225642.testnet` | Quadratic funding, proposals, voting |
| **Provenance** | `provenance.daic-dev-1770225642.testnet` | Dataset registration, access control, versioning |
| **DID Registry** | `did.daic-dev-1770225642.testnet` | DIDs, verifiable credentials, revocation |

## Project Structure

```
daic/
├── contracts/              # NEAR smart contracts (Rust)
│   ├── dao/                # DAO with quadratic funding
│   ├── provenance/         # Dataset provenance registry
│   ├── did_registry/       # Decentralized identity
│   ├── build.sh            # Build + wasm-opt optimization
│   └── deploy.sh           # Deploy to NEAR testnet
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/            # Pages (dashboard, dao, datasets, chat)
│   │   ├── components/     # UI components (ProposalCard, Toast, etc.)
│   │   ├── services/       # NEAR, IPFS, ZK, Chat services
│   │   ├── providers/      # WalletProvider context
│   │   └── hooks/          # useDAO, useDatasets hooks
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Rust** 1.85+ (pinned via `rust-toolchain.toml`)
- **NEAR CLI** (`npm i -g near-cli`)
- **wasm-opt** (`brew install binaryen`)

### Run the Frontend

```bash
cd daic/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build Smart Contracts

```bash
cd daic/contracts
./build.sh
```

This compiles all 3 contracts to WASM and runs `wasm-opt --signext-lowering` for NEAR VM compatibility.

### Deploy to NEAR Testnet

```bash
cd daic/contracts
./deploy.sh
```

### Deploy Frontend to Vercel

1. Push to GitHub
2. Import on [vercel.com/new](https://vercel.com/new)
3. Set **Root Directory** to `daic/frontend`
4. Deploy

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend   │────▶│ NEAR Testnet │     │    Gun.js P2P   │
│  (Next.js)   │     │  Contracts   │     │   Relay Peers   │
└──────┬───────┘     └──────────────┘     └────────┬────────┘
       │                                           │
       ├── IPFS (SHA-256 CIDs)                     │
       ├── ZK Proofs (Integrity)                   │
       └── Wallet Selector ◀──────────────────────▶│
                                          P2P Chat Sync
```

## License

MIT
