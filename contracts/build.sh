#!/bin/bash
set -e

WASM_TARGET="wasm32-unknown-unknown"
OUT_DIR="out"
TARGET_DIR="target"

mkdir -p "$OUT_DIR"

# Build all contracts from workspace root
echo "Building all contracts..."
cargo build --target "$WASM_TARGET" --release

# Copy WASM files from workspace target
echo "Copying WASM files..."
cp "$TARGET_DIR/$WASM_TARGET/release/daic_dao.wasm" "$OUT_DIR/daic_dao.wasm"
cp "$TARGET_DIR/$WASM_TARGET/release/daic_provenance.wasm" "$OUT_DIR/daic_provenance.wasm"
cp "$TARGET_DIR/$WASM_TARGET/release/daic_did_registry.wasm" "$OUT_DIR/daic_did_registry.wasm"

# Optimize WASM binaries (removes sign-ext opcodes for NEAR VM compatibility)
echo "Optimizing WASM with wasm-opt..."
if command -v wasm-opt &> /dev/null; then
    for wasm in "$OUT_DIR"/*.wasm; do
        echo "  Optimizing $(basename $wasm)..."
        wasm-opt -Oz --signext-lowering "$wasm" -o "$wasm"
    done
    echo "✅ WASM optimization complete"
else
    echo "⚠️  wasm-opt not found! Install binaryen: brew install binaryen"
    echo "   Skipping optimization — contracts may fail on NEAR VM."
fi

echo ""
echo "Build complete. WASM files are in contracts/$OUT_DIR/"
ls -lh "$OUT_DIR"/*.wasm
