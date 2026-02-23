#!/bin/bash
set -e

# Build DAO
cd dao
cargo build --target wasm32-unknown-unknown --release
mkdir -p ../out
cp target/wasm32-unknown-unknown/release/daic_dao.wasm ../out/daic_dao.wasm
cd ..

# Build Provenance
cd provenance
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/daic_provenance.wasm ../out/daic_provenance.wasm
cd ..

# Build DID Registry
cd did_registry
cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/daic_did_registry.wasm ../out/daic_did_registry.wasm
cd ..

echo "Build complete. WASM files are in contracts/out/"
