# DAIC - Decentralized AI Commons

DAIC is a sovereign ecosystem where individuals, researchers, and communities collaborate on AI-driven solutions to public-good problems. The platform integrates secure ZK proofs, P2P communications, decentralized identity (DIDs), verifiable data pipelines, and community-driven economics via quadratic funding.

## Core Features

- **Secure, Sovereign Systems**: ZK Proofs for private compute, P2P messaging, and DID-based identity.
- **AI & Autonomous Infrastructure**: Verifiable data pipelines and provenance agents tracking dataset lineage.
- **Decentralized Economies**: Quadratic funding for public goods and DAO governance on NEAR.

## Tech Stack

- **Blockchain**: NEAR Protocol (DAO, Provenance, DIDs)
- **Storage**: IPFS / Filecoin (Data pinning)
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn/UI
- **ZK Proofs**: SnarkJS / Circom

## Directory Structure

- `/contracts`: NEAR smart contracts (Rust)
- `/frontend`: Web application (Next.js)

## Getting Started

### Prerequisites

- Node.js
- Rust & Cargo (for NEAR contracts)
- NEAR CLI

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Build contracts:
   ```bash
   cd contracts
   ./build.sh
   ```
